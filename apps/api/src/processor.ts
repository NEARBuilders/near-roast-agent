import { ApiResponse, doSomething } from "./lib/api-sdk";
import { ContractRequest, setResponse } from "./lib/contract-sdk";

// Request processing, put on queue by the indexer (~/apps/indexer)
export function processRequest(requestId: string, request: ContractRequest) {
  const { data } = request;
  // what schema does request data follow?
  // validate
  // what schema does api accept?
  // transform
  const requestData = JSON.parse(data);

  try {
    // doSomething can come from federated module
    const action: Promise<ApiResponse> = doSomething({ requestId, data: requestData });

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
  const responseData = JSON.stringify(data);

  setResponse(request.yield_id, { request_id: requestId, data: responseData });
}
