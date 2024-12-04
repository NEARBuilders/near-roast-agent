import { ApiResponse, doSomething } from "./lib/api-sdk";
import { ContractRequest, setResponse } from "./lib/contract-sdk";

// Request processing, put on queue by the indexer (~/apps/indexer)
export function processRequest(requestId: string, request: ContractRequest) {
  try {
    // doSomething can come from federated module
    const action: Promise<ApiResponse> = doSomething({ requestId, data: request });

    action.then((response) => {
      // Submit to end queue
      submitResponse(request, response);
    })

  } catch (error) {
    console.error('Processing error:', error);
    throw error;
  }
}

// Submits response to contract
async function submitResponse(request: ContractRequest, response: ApiResponse) {
  const { requestId, data } = response;
  console.log("Submitting a response for:", requestId);
  setResponse({ yield_id: request.yield_id, ...data });
}
