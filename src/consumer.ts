import mongoose from 'mongoose';
import { config } from './config';
import { connectRabbitMQ, getChannel } from './services/rabbitmq';
import Document from './models/Document';

const startConsumer = async () => {
  // Connect to MongoDB
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Consumer connected to MongoDB');
  } catch (error) {
    console.error('Consumer MongoDB connection error:', error);
    process.exit(1);
  }

  // Connect to RabbitMQ
  await connectRabbitMQ();
  const channel = getChannel();

  console.log('Consumer waiting for messages...');

  channel.consume(config.queueName, async (msg) => {
    if (msg) {
      const content = JSON.parse(msg.content.toString());
      const { action, data, id } = content;

      try {
        if (action === 'INSERT') {
          const newDoc = new Document(data);
          await newDoc.save();
          console.log(`[x] Inserted document: ${data.title}`);
        } else if (action === 'UPDATE') {
          await Document.findByIdAndUpdate(id, data);
          console.log(`[x] Updated document ID: ${id}`);
        }
        
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing message:', error);
        // In a real app, you might want to handle retries or move to dead-letter queue
        channel.nack(msg, false, false); 
      }
    }
  });
};

startConsumer();
