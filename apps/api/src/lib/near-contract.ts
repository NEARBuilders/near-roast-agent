import { getProviderByEndpoints, getSignerFromPrivateKey, SignedTransactionComposer, view } from "@near-js/client";
import { KeyPairString } from '@near-js/crypto';

// Default to testnet if not specified
const NETWORK_ID = (process.env.NETWORK_ID || 'testnet') as 'testnet' | 'mainnet';
const CONTRACT_ID = process.env.CONTRACT_ID || 'v0.near-roasts.testnet';
const SIGNER_ID = process.env.SIGNER_ID;
const SIGNER_PRIVATE_KEY = process.env.SIGNER_PRIVATE_KEY;

const RPC_ENDPOINTS = {
  mainnet: [
    "https://g.w.lavanet.xyz:443/gateway/near/rpc-http/e330a793cbe84ecb08940afd9ebb957c",
    "https://rpc.shitzuapes.xyz"
  ],
  testnet: [
    "https://g.w.lavanet.xyz:443/gateway/neart/rpc-http/e330a793cbe84ecb08940afd9ebb957c"
  ]
}

// Validate network ID and get RPC provider
if (!RPC_ENDPOINTS[NETWORK_ID]) {
  throw new Error(`Invalid NETWORK_ID: ${NETWORK_ID}. Must be either 'testnet' or 'mainnet'`);
}

const rpcProvider = getProviderByEndpoints(...RPC_ENDPOINTS[NETWORK_ID]);

interface Request {
  yield_id: any,
  prompt: string,
}

export async function getRequest(requestId: string): Promise<Request> {
  try {
    return await view<Request>({
      account: CONTRACT_ID,
      method: "get_request",
      args: {
        request_id: requestId
      },
      deps: { rpcProvider },
    });
  } catch (error: any) {
    throw new Error(`Failed to get request: ${error?.message || 'Unknown error'}`);
  }
}

export async function getRequests(): Promise<Request[]> {
  try {
    return await view<Request[]>({
      account: CONTRACT_ID,
      method: "list_requests",
      deps: { rpcProvider },
    });
  } catch (error: any) {
    throw new Error(`Failed to list requests: ${error?.message || 'Unknown error'}`);
  }
}

export async function setResponse(yieldId: string, response: string) {
  // Validate required environment variables for transaction signing
  if (!SIGNER_ID) {
    throw new Error('SIGNER_ID environment variable is required for sending transactions');
  }
  if (!SIGNER_PRIVATE_KEY) {
    throw new Error('SIGNER_PRIVATE_KEY environment variable is required for sending transactions');
  }

  try {
    const signer = getSignerFromPrivateKey(SIGNER_PRIVATE_KEY as KeyPairString);
    const composer = SignedTransactionComposer.init({
      sender: SIGNER_ID,
      receiver: CONTRACT_ID,
      deps: {
        signer,
        rpcProvider
      }
    });

    await composer.functionCall("respond", {
      yield_id: yieldId,
      response
    }).signAndSend();
  } catch (error: any) {
    throw new Error(`Failed to set response: ${error?.message || 'Unknown error'}`);
  }
}
