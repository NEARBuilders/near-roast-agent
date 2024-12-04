/**
 * A simple SDK for interacting with your custom logic
 */
export interface ApiRequest {
  requestId: string;
  data: {
    prompt: string;
  }
}

export interface ApiResponse {
  requestId: string;  // Echo back the request_id for correlation
  data: {
    answer: string;
  }
}

export async function doSomething(request: ApiRequest): Promise<ApiResponse> {
  const { requestId, data } = request;
  
  const response = {
    requestId,  // Maintain request traceability
    data: {
      answer: "hello"
    }
  }
  return new Promise((resolve, reject) => {
    resolve(response)
  });
}

// processor and server could most likely be combined with indexer
// reduce latency

// but we want to handle requests and be able to scale
// probably with queues, so Cloudflare workers and queues?
// uses Redis
