import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import { config } from './config';
import { connectRabbitMQ, publishToQueue } from './services/rabbitmq';
import Document from './models/Document';

const app = express();
app.use(express.json());

const startServer = async () => {
  // Connect to MongoDB
  try {
    await mongoose.connect(config.mongodbUri);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }

  // Connect to RabbitMQ
  await connectRabbitMQ();

  // --- API Routes ---

  // 1. Insert Document (Asynchronous via RabbitMQ)
  app.post('/documents', async (req: Request, res: Response) => {
    const { title, content, tags } = req.body;
    
    // We publish a task to the queue instead of saving directly
    const task = {
      action: 'INSERT',
      data: { title, content, tags }
    };

    await publishToQueue(task);
    res.status(202).json({ message: 'Document creation task accepted', detail: 'Processing via RabbitMQ' });
  });

  // 2. Query Documents (Direct from MongoDB)
  app.get('/documents', async (req: Request, res: Response) => {
    const { title, tag } = req.query;
    const filter: any = {};
    
    if (title) filter.title = { $regex: title, $options: 'i' };
    if (tag) filter.tags = tag;

    const documents = await Document.find(filter).sort({ createdAt: -1 });
    res.json(documents);
  });

  // 3. Update Document (Asynchronous via RabbitMQ)
  app.put('/documents/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, content, tags } = req.body;

    const task = {
      action: 'UPDATE',
      id,
      data: { title, content, tags }
    };

    await publishToQueue(task);
    res.status(202).json({ message: 'Document update task accepted', detail: 'Processing via RabbitMQ' });
  });

  app.get('/', (req: Request, res: Response) => {
    res.send('RabbitMQ + MongoDB Management API is running');
  });

  app.listen(config.port, () => {
    console.log(`Server is running at http://localhost:${config.port}`);
  });
};

startServer();
