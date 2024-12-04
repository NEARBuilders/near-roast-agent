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
 * Initiates processing for a request
 */
app.post('/v0/process', async (req, res) => {
  try {
    const requestId = req.body.request_id;

    console.log(`Received request to process: ${requestId}`);

    const request = await getRequest(requestId); // get from contract

    if (!request) {
      console.error(`Request not found: ${requestId}`);
      return res.status(404).send({ error: "Request not found" });
    }

    // put a request on the queue (todo)
    processRequest(requestId, request);

    res.status(200).send(); // ack
  } catch (e) {
    console.error("Error processing request:", e);
    res.status(500).send({ error: "Internal server error" });
  }
})

const PORT = process.env.PORT || 4555;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  process.exit(0);
});
