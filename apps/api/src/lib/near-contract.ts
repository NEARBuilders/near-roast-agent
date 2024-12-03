import { getProviderByEndpoints, view } from "@near-js/client";
import { KeyPairString } from '@near-js/crypto';
import { Wallet } from "../near";

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

// Validate required environment variables for transaction signing
if (!SIGNER_ID) {
  throw new Error('SIGNER_ID environment variable is required for sending transactions');
}
if (!SIGNER_PRIVATE_KEY) {
  throw new Error('SIGNER_PRIVATE_KEY environment variable is required for sending transactions');
}

const wallet = new Wallet({ networkId: NETWORK_ID, accountId: SIGNER_ID, privateKey: SIGNER_PRIVATE_KEY as KeyPairString });


const rpcProvider = getProviderByEndpoints(...RPC_ENDPOINTS[NETWORK_ID]);

interface Request {
  yield_id: any,
  prompt: string,
}

export async function getRequest(requestId: string): Promise<Request> {
  try {
    const request = await view<Request>({
      account: CONTRACT_ID,
      method: "get_request",
      args: {
        request_id: requestId
      },
      deps: { rpcProvider },
    });
    return request;
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

export async function setResponse(yieldId: any, response: string) {
  console.log("gonna try and set a response")

  try {
    await wallet.callMethod(
      {
        contractId: CONTRACT_ID,
        method: 'respond',
        args: {
          yield_id: yieldId,
          response,
        },
      }
    )
    
    // BELOW GAVE ISSUE WITH @NEAR-JS/CLIENT

    // const signer = getSignerFromPrivateKey(SIGNER_PRIVATE_KEY as KeyPairString);

    // const composer = TransactionComposer.init({
    //   sender: SIGNER_ID,
    //   receiver: CONTRACT_ID,
    // });

    // const transaction = composer.functionCall("respond", {
    //   yield_id: yieldId,
    //   response,
    // }).toTransaction();

    // console.log("have transaction, time to sign and send", transaction);

    // return signAndSendTransaction({ transaction, deps: { signer, rpcProvider } });
  } catch (error: any) {
    throw new Error(`Failed to set response: ${error?.message || 'Unknown error'}`);
  }
}
