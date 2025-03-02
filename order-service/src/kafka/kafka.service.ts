// kafka.service.ts - Servicio base para ambos microservicios
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Kafka, Consumer, Producer, logLevel, EachMessagePayload } from 'kafkajs';

@Injectable()
export class KafkaService implements OnModuleInit, OnModuleDestroy {
  private kafka: Kafka;
  private producer: Producer;
  private consumers: Map<string, Consumer> = new Map();
  private responseHandlers: Map<string, Map<string, Function>> = new Map();

  constructor() {
    this.kafka = new Kafka({
      clientId: process.env.KAFKA_CLIENT_ID || 'order-service',
      brokers: (process.env.KAFKA_BROKERS || 'localhost:9092').split(','),
      logLevel: logLevel.ERROR,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async onModuleDestroy() {
    await this.producer.disconnect();

    // Desconectar todos los consumidores
    for (const consumer of this.consumers.values()) {
      await consumer.disconnect();
    }
  }

  // Método genérico para enviar mensajes
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

  // Método para request-response pattern
  async sendAndReceive(requestTopic: string, message: any, responseTopic: string, timeout = 10000): Promise<any> {
    const correlationId = Date.now().toString();

    // Crear una promesa que se resolverá cuando llegue la respuesta
    const responsePromise = new Promise((resolve, reject) => {
      // Guardar el handler para esta petición específica
      if (!this.responseHandlers.has(responseTopic)) {
        this.responseHandlers.set(responseTopic, new Map());
      }
      const responseHandler = this.responseHandlers.get(responseTopic);
      if (responseHandler) {
        responseHandler.set(correlationId, resolve);
      }

      // Configurar timeout
      setTimeout(() => {
        if (this.responseHandlers.get(responseTopic)?.has(correlationId)) {
          this.responseHandlers.get(responseTopic)?.delete(correlationId);
          reject(new Error('Response timeout'));
        }
      }, timeout);
    });

    // Asegurarse de que hay un consumidor para el topic de respuesta
    if (!this.consumers.has(responseTopic)) {
      await this.subscribeToResponseTopic(responseTopic);
    }

    // Enviar el mensaje con el correlationId
    await this.sendMessage(requestTopic, message, correlationId);

    // Esperar la respuesta
    return responsePromise;
  }

  // Suscribirse a un topic para respuestas
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

        // Si hay un handler registrado para este correlationId, llamarlo
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

  // Método para crear un consumidor genérico
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

          // Procesar el mensaje con el handler proporcionado
          const result = await handler(payload);

          // Si se configuró autoResponse, enviar respuesta automáticamente
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