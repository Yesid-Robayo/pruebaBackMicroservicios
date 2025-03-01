import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class KafkaService implements OnModuleInit {
  private readonly kafka: Kafka;
  private producer: Producer;

  constructor(private configService: ConfigService) {
    const brokers = (this.configService.get<string>('KAFKA_BROKERS') || '').split(',');
    this.kafka = new Kafka({
      clientId: 'User-service',
      brokers,
    });
    this.producer = this.kafka.producer();
  }

  async onModuleInit() {
    await this.producer.connect();
  }

  async produce(topic: string, message: any) {
    await this.producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }],
    });
  }

  async onModuleDestroy() {
    await this.producer.disconnect();
  }
}