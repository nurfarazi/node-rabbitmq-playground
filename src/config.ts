import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/rabbitmq_playground',
  rabbitmqUrl: process.env.RABBITMQ_URL || 'amqp://localhost',
  queueName: 'document_tasks',
  port: process.env.PORT || 3000,
};
