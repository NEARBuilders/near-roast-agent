/**
 * A simple SDK for interacting with your contract (~/contract)
 */
import { view } from "@near-js/client";
import { rpcProvider, wallet } from "../near";

const DEFAULT_CONTRACT_ID = 'v0.near-roasts.testnet';

const CONTRACT_ID = process.env.CONTRACT_ID || DEFAULT_CONTRACT_ID;

export interface ContractRequest { // This should match the Rust contract Request type
  yield_id: any,
  data: string // JSON stringified ApiRequest
}

export interface ContractResponse { // Should match contract Response type
  request_id: any,
  data: string // JSON stringified ApiResponse
}

/**
 * Gets a yielded request by ID
 * 
 * Used after this API (/v0/process) is triggered by the indexer to start processing
 * 
 * curl localhost:4555/v0/request/${ID}
 * near contract call-function as-read-only ${CONTRACT_ID} get_request json-args '{ "request_id": "${requestId}" }' network-config testnet now
 */
export async function getRequest(requestId: string): Promise<ContractRequest> {
  try {
    const request = await view<ContractRequest>({
      account: CONTRACT_ID,
      method: "get_request",
      args: {
        request_id: requestId
      },
      deps: { rpcProvider },
    });
    return request;
  } catch (error: any) {
    throw new Error(`CONTRACT-SDK: Failed to get request: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Gets all currently yielded requests
 * 
 * Used as a helper function for viewing any pending requests
 * 
 * curl localhost:4555/v0/requests
 * near contract call-function as-read-only ${CONTRACT_ID} list_requests json-args {} network-config testnet now
 */
export async function getRequests(): Promise<ContractRequest[]> {
  try {
    return await view<ContractRequest[]>({
      account: CONTRACT_ID,
      method: "list_requests",
      deps: { rpcProvider },
    });
  } catch (error: any) {
    throw new Error(`CONTRACT-SDK: Failed to list requests: ${error?.message || 'Unknown error'}`);
  }
}

/**
 * Sets a response for the yielded promise
 * 
 * Used after processing the request, in order to "resume" the yielded
 * 
 */
export async function setResponse(yieldId: any, response: ContractResponse) { // what's best way to communicate with a contract?
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
  } catch (error: any) {
    throw new Error(`CONTRACT-SDK: Failed to set response: ${error?.message || 'Unknown error'}`);
  }
}
