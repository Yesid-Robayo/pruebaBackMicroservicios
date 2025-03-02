// kafka.service.ts - Servicio base para ambos microservicios
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, Producer, logLevel, EachMessagePayload } from 'kafkajs';

/**
 * KafkaService class provides methods to interact with Kafka, including producing and consuming messages,
 * as well as implementing a request-response pattern.
 */
@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private responseHandlers: Map<string, Map<string, Function>> = new Map();

  /**
   * Constructor initializes Kafka client and producer.
   */
  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'order-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
  }

  /**
   * Lifecycle hook that is called when the module is initialized.
   * Connects the Kafka producer.
   */
  async onModuleInit() {
    await this.producer.connect();
  }

  /**
   * Lifecycle hook that is called when the module is destroyed.
   * Disconnects the Kafka producer and all consumers.
   */
  async onModuleDestroy() {
    await this.producer.disconnect();

    // Disconnect all consumers
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  /**
   * Sends a message to a specified Kafka topic.
   * @param topic - The Kafka topic to send the message to.
   * @param message - The message to send.
   * @param correlationId - Optional correlation ID for the message.
   */
  async sendMessage(topic: string, message: any, correlationId?: string): Promise<void> {
    await this.producer.send({
      topic,
      messages: [
        {
          value: JSON.stringify(message),
          headers: correlationId ? { correlationId } : undefined
        },
      ],
    });
  }

  /**
   * Sends a message to a request topic and waits for a response on a response topic.
   * @param requestTopic - The Kafka topic to send the request message to.
   * @param message - The request message to send.
   * @param responseTopic - The Kafka topic to listen for the response message.
   * @param timeout - Optional timeout in milliseconds to wait for the response. Default is 10000ms.
   * @returns A promise that resolves with the response message.
   */
  async sendAndReceive(requestTopic: string, message: any, responseTopic: string, timeout = 10000): Promise<any> {
    const correlationId = Date.now().toString();

    // Create a promise that will resolve when the response arrives
    const responsePromise = new Promise((resolve, reject) => {
      // Save the handler for this specific request
      if (!this.responseHandlers.has(responseTopic)) {
        this.responseHandlers.set(responseTopic, new Map());
      }
      const responseHandler = this.responseHandlers.get(responseTopic);
      if (responseHandler) {
        responseHandler.set(correlationId, resolve);
      }

      // Set up timeout
      setTimeout(() => {
        if (this.responseHandlers.get(responseTopic)?.has(correlationId)) {
          this.responseHandlers.get(responseTopic)?.delete(correlationId);
          reject(new Error('Response timeout'));
        }
      }, timeout);
    });

    // Ensure there is a consumer for the response topic
    if (!this.consumers.has(responseTopic)) {
      await this.subscribeToResponseTopic(responseTopic);
    }

    // Send the message with the correlationId
    await this.sendMessage(requestTopic, message, correlationId);

    // Wait for the response
    return responsePromise;
  }

  /**
   * Subscribes to a Kafka topic to listen for response messages.
   * @param topic - The Kafka topic to subscribe to.
   */
  private async subscribeToResponseTopic(topic: string): Promise<void> {
    const consumer = this.kafka.consumer({
      groupId: `response-consumer-${topic}-${Date.now()}`,
    });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async (payload: EachMessagePayload) => {
        const { topic, message } = payload;
        const correlationId = message.headers?.correlationId?.toString();
        const responseData = message.value ? JSON.parse(message.value.toString()) : null;

        // If there is a handler registered for this correlationId, call it
        if (correlationId && this.responseHandlers.has(topic)) {
          const responseHandler = this.responseHandlers.get(topic);
          if (responseHandler && responseHandler.has(correlationId)) {
            const resolve = this.responseHandlers.get(topic)?.get(correlationId);
            if (responseHandler) {
              responseHandler.delete(correlationId);
            }
            if (resolve) {
              resolve(responseData);
            }
          }
        }
      }
    });

    this.consumers.set(topic, consumer);
  }

  /**
   * Creates a generic Kafka consumer.
   * @param topic - The Kafka topic to consume messages from.
   * @param groupId - The consumer group ID.
   * @param handler - The handler function to process each message.
   * @param autoResponse - Optional configuration for automatic response. If provided, the consumer will send a response to the specified topic.
   */
  async createConsumer(topic: string, groupId: string,
    handler: (payload: any) => Promise<any>,
    autoResponse?: { topic: string }): Promise<void> {
    const consumer = this.kafka.consumer({ groupId });

    await consumer.connect();
    await consumer.subscribe({ topic, fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const payload = message.value ? JSON.parse(message.value.toString()) : null;
          const correlationId = message.headers?.correlationId?.toString();

          // Process the message with the provided handler
          const result = await handler(payload);

          // If autoResponse is configured, send response automatically
          if (autoResponse && correlationId) {
            await this.sendMessage(autoResponse.topic, result, correlationId);
          }
        } catch (error) {
          console.error(`Error processing message from ${topic}:`, error);
        }
      },
    });

    this.consumers.set(`${topic}-${groupId}`, consumer);
  }
}