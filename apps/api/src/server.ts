import express from 'express';
import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import { processRequest } from './processor.js';

// Redis connection for queue management
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: Number(process.env.REDIS_PORT) || 6379,
});

// Create request queue
const requestQueue = new Queue('contract-requests', {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000,
    },
  },
});

// API routes
const app = express();
app.use(express.json());

app.post('/process-request', async (req, res) => {
  try {
    const job = await requestQueue.add('process', {
      transactionHash: req.body.transactionHash,
      data: req.body.data,
      timestamp: Date.now(),
    });
    
    res.json({ 
      status: 'queued',
      jobId: job.id
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Start multiple workers to process requests
const WORKER_COUNT = 5;
const workers: Worker[] = [];

for (let i = 0; i < WORKER_COUNT; i++) {
  const worker = new Worker('contract-requests', async (job) => {
    const result = await processRequest(job.data);
    return result;
  }, {
    connection: redis,
    concurrency: 3, // Each worker can process 3 jobs concurrently
  });

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });

  worker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed:`, error);
  });

  workers.push(worker);
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await Promise.all(workers.map(worker => worker.close()));
  await requestQueue.close();
  await redis.quit();
  process.exit(0);
});