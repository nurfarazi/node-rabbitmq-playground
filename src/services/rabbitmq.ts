import * as amqp from 'amqplib';
import { config } from '../config';

let connection: amqp.Connection;
let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    connection = await amqp.connect(config.rabbitmqUrl);
    channel = await connection.createChannel();
    await channel.assertQueue(config.queueName, { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    process.exit(1);
  }
};

export const publishToQueue = async (data: any) => {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized');
  }
  channel.sendToQueue(config.queueName, Buffer.from(JSON.stringify(data)), {
    persistent: true,
  });
};

export const getChannel = () => channel;
