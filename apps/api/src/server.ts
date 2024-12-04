import express from 'express';
import { getRequest, getRequests } from './lib/contract-sdk';
import { processRequest } from './processor';

const app = express();
app.use(express.json());

app.post('/ping', (req, res) => {
  console.log("PONG, ", req.body.message);
  res.json({ message: req.body.message });
});

/**
 * Gets requests from contract, used as a helper function to view pending requests
 */
app.get('/v0/requests', async (_req, res) => {
  const requests = await getRequests();
  res.json({ requests });
});

/**
 * Initiates processing 
 */
app.post('/v0/process', async (req, res) => {
  try {
    const requestId = req.body.request_id;
    const request = await getRequest(requestId); // get from contract

    // put a request on the queue (todo)
    processRequest(requestId, request);

    res.status(200).send();
  } catch (e) {
    res.status(500).send();
  }
})

// import { Worker, Queue } from 'bullmq';
// import Redis from 'ioredis';
// import { processRequest } from './processor.js';

// Redis connection for queue management
// const redis = new Redis({
//   host: process.env.REDIS_HOST || 'localhost',
//   port: Number(process.env.REDIS_PORT) || 6379,
// });

// // Create request queue
// const requestQueue = new Queue('contract-requests', {
//   connection: redis,
//   defaultJobOptions: {
//     attempts: 3,
//     backoff: {
//       type: 'exponential',
//       delay: 1000,
//     },
//   },
// });

// app.post('/process-request', async (req, res) => {
//   try {
//     const job = await requestQueue.add('process', {
//       transactionHash: req.body.transactionHash,
//       data: req.body.data,
//       timestamp: Date.now(),
//     });

//     res.json({ 
//       status: 'queued',
//       jobId: job.id
//     });
//   } catch (error: any) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Start multiple workers to process requests
// const WORKER_COUNT = 5;
// const workers: Worker[] = [];

// for (let i = 0; i < WORKER_COUNT; i++) {
//   const worker = new Worker('contract-requests', async (job) => {
//     const result = await processRequest(job.data);
//     return result;
//   }, {
//     connection: redis,
//     concurrency: 3, // Each worker can process 3 jobs concurrently
//   });

//   worker.on('completed', (job) => {
//     console.log(`Job ${job.id} completed`);
//   });

//   worker.on('failed', (job, error) => {
//     console.error(`Job ${job?.id} failed:`, error);
//   });

//   workers.push(worker);
// }

const PORT = process.env.PORT || 4555;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  // await Promise.all(workers.map(worker => worker.close()));
  // await requestQueue.close();
  // await redis.quit();
  process.exit(0);
});
