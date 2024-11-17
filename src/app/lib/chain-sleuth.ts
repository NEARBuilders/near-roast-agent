// const NEARLANTIR_API = "https://filepile.ai";
const NEARLANTIR_API = "http://localhost:3005";
const NEARLANTIR_API_KEY =
  "a77218d1ea343e98167ed59d6fbccd7dd8883f95de4ec177b16cd500400d6b5c";

type TaskStatus = "processing" | "completed" | "error";

interface AnalysisResult {
  taskInfo: any | null;
  robustSummary: string | null;
  shortSummary: string | null;
  status: TaskStatus;
}

interface EventData {
  status?: string;
  summary?: string;
  url?: string;
  message?: string;
}

class StreamProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "StreamProcessingError";
  }
}

export async function processAccount(accountId: string): Promise<Response> {
  try {
    const accessToken = await getAccessToken();
    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        const taskId = await triggerAnalysis(accountId, accessToken);
        const result = await streamSummary(taskId, accessToken);

        return new Response(JSON.stringify(result), {
          headers: {
            "Content-Type": "application/json",
          },
        });
      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;

        if (retryCount === maxRetries) {
          throw error;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, Math.pow(2, retryCount) * 1000),
        );
      }
    }

    throw new Error("All retry attempts failed");
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}

async function getAccessToken() {
  console.log("getting token");
  const authResponse = await fetch(`${NEARLANTIR_API}/api/v1/auth/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": NEARLANTIR_API_KEY,
    },
  });

  if (!authResponse.ok) {
    throw new Error("Failed to get token");
  }

  const { token } = await authResponse.json();
  return token.accessToken;
}

async function triggerAnalysis(
  accountId: string,
  accessToken: string,
): Promise<string> {
  const triggerResponse = await fetch(
    `${NEARLANTIR_API}/api/v1/trigger/${accountId}`,
    {
      method: "POST",
      headers: {
        Authorization: `BEARER ${accessToken}`,
      },
    },
  );

  if (!triggerResponse.ok) {
    throw new Error("Failed to trigger analysis");
  }

  const { data } = await triggerResponse.json();
  return data.taskId;
}

async function processEventLine(
  line: string,
  result: AnalysisResult,
  currentEventType: string,
): Promise<string> {
  if (line.trim() === "") return currentEventType;

  if (line.startsWith("event: ")) {
    return line.slice(7).trim();
  }

  if (line.startsWith("data: ")) {
    const eventData = line.slice(6);
    try {
      const parsedData: EventData = JSON.parse(eventData);

      switch (currentEventType) {
        case "processing":
          result.status = (parsedData.status as TaskStatus) || "processing";
          break;
        case "completed":
          result.status = "completed";
          console.log("Received completion event");
          break;
        case "error":
          result.status = "error";
          throw new StreamProcessingError(
            parsedData.message || "Unknown error occurred",
          );
        default:
          console.error("unhandled event type: ", currentEventType);
      }
    } catch (e: any) {
      console.error("Failed to parse event data:", e);
      if (e.name !== "StreamProcessingError") {
        throw new StreamProcessingError("Failed to parse event data");
      }
      throw e;
    }
  }
  return currentEventType;
}

async function processEventStream(
  reader: ReadableStreamDefaultReader<Uint8Array>,
  result: AnalysisResult,
): Promise<void> {
  const decoder = new TextDecoder();
  let buffer = "";
  let currentEventType = "";

  try {
    while (result.status !== "completed" && result.status !== "error") {
      const { done, value } = await reader.read();

      if (done) {
        await processRemainingBuffer(buffer, result, currentEventType);
        validateFinalResult(result);
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      [buffer, currentEventType] = await processBuffer(
        buffer,
        result,
        currentEventType,
      );
    }
  } catch (error) {
    throw new StreamProcessingError(
      error instanceof Error ? error.message : "Stream processing failed",
    );
  }
}

async function processRemainingBuffer(
  buffer: string,
  result: AnalysisResult,
  currentEventType: string,
): Promise<void> {
  if (buffer.trim()) {
    const lines = buffer.split("\n");
    for (const line of lines) {
      currentEventType = await processEventLine(line, result, currentEventType);
    }
  }

  console.log("Stream ended. Current data state:", {
    hasRobustSummary: !!result.robustSummary,
    hasShortSummary: !!result.shortSummary,
    status: result.status,
  });
}

function validateFinalResult(result: AnalysisResult): void {
  if (result.robustSummary && result.shortSummary) {
    result.status = "completed";
    return;
  }

  const missing = [];
  if (!result.robustSummary) missing.push("robustSummary");
  if (!result.shortSummary) missing.push("shortSummary");

  throw new StreamProcessingError(
    `Stream ended before receiving: ${missing.join(", ")}`,
  );
}

async function processBuffer(
  buffer: string,
  result: AnalysisResult,
  currentEventType: string,
): Promise<[string, string]> {
  const lines = buffer.split("\n");
  buffer = lines.pop() || "";

  for (const line of lines) {
    currentEventType = await processEventLine(line, result, currentEventType);
  }

  return [buffer, currentEventType];
}

async function streamSummary(
  taskId: string,
  accessToken: string,
): Promise<AnalysisResult> {
  const summaryResponse = await fetch(
    `${NEARLANTIR_API}/api/v1/summary/stream/${taskId}`,
    {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        Authorization: `BEARER ${accessToken}`,
      },
    },
  );

  if (!summaryResponse.ok) {
    throw new Error("Failed to get summary stream");
  }

  const reader = summaryResponse.body?.getReader();
  if (!reader) {
    throw new Error("No reader available");
  }

  const result: AnalysisResult = {
    taskInfo: null,
    robustSummary: null,
    shortSummary: null,
    status: "processing",
  };

  try {
    const timeout = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("Operation timed out")), 120000);
    });

    // attempt to stream results, or timeout after 2 minutes
    await Promise.race([processEventStream(reader, result), timeout]);

    if (result.status === "completed") {
      if (!result.robustSummary || !result.shortSummary) {
        throw new StreamProcessingError(
          "Task completed but missing required data",
        );
      }
      return result;
    }

    throw new StreamProcessingError(`Task ended with status: ${result.status}`);
  } finally {
    reader.releaseLock();
  }
}
