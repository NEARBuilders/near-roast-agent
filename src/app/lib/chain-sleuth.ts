// const NEARLANTIR_API = "https://filepile.ai";
const NEARLANTIR_API = "http://localhost:3005";
const NEARLANTIR_API_KEY = "a77218d1ea343e98167ed59d6fbccd7dd8883f95de4ec177b16cd500400d6b5c"

async function getAccessToken() {
  console.log("getting token");
  const authResponse = await fetch(`${NEARLANTIR_API}/api/v1/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'x-api-key': NEARLANTIR_API_KEY
    },
  });

  if (!authResponse.ok) {
    throw new Error('Failed to get token');
  }

  const { token } = await authResponse.json();
  return token.accessToken;
}

export async function processAccount(accountId: string) {
  try {
    // get token
    const accessToken = await getAccessToken();

    // trigger analysis
    const triggerResponse = await fetch(`${NEARLANTIR_API}/api/v1/trigger/${accountId}`, {
      method: 'POST',
      headers: {
        "Authorization": `BEARER ${accessToken}`
      }
    });

    if (!triggerResponse.ok) {
      throw new Error('Failed to trigger analysis');
    }

    const { data } = await triggerResponse.json();
    const { taskId } = data;

    let retryCount = 0;
    const maxRetries = 3;

    while (retryCount < maxRetries) {
      try {
        // Get SSE response
        const summaryResponse = await fetch(`${NEARLANTIR_API}/api/v1/summary/stream/${taskId}`, {
          method: 'GET',
          headers: {
            'Accept': 'text/event-stream',
            "Authorization": `BEARER ${accessToken}`
          }
        });

        if (!summaryResponse.ok) {
          throw new Error('Failed to get summary stream');
        }

        const reader = summaryResponse.body?.getReader();
        if (!reader) {
          throw new Error('No reader available');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let currentEventType = '';
        const result = {
          taskInfo: null,
          robustSummary: null,
          shortSummary: null,
          graphLink: null,
          status: 'processing'
        };

        // Add timeout of 2 minutes
        const timeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Operation timed out')), 120000);
        });

        const processLine = async (line: string, result: any, currentEventType: string) => {
          if (line.trim() === '') return currentEventType;

          if (line.startsWith('event: ')) {
            return line.slice(7).trim();
          }

          if (line.startsWith('data: ')) {
            const eventData = line.slice(6);
            try {
              console.log("got eventData", eventData)
              const parsedData = JSON.parse(eventData);
              console.log(`Processing event: ${currentEventType}`);

              switch (currentEventType) {
                case 'task_info':
                  result.taskInfo = parsedData;
                  result.status = parsedData.status;
                  break;
                case 'robust_summary':
                  result.robustSummary = parsedData.summary;
                  console.log('Received robust summary');
                  break;
                case 'short_summary':
                  result.shortSummary = parsedData.summary;
                  console.log('Received short summary');
                  break;
                case 'graph_link':
                  result.graphLink = parsedData.url;
                  console.log('Received graph link');
                  break;
                case 'complete':
                  result.status = 'completed';
                  console.log('Received completion event');
                  break;
                case 'error':
                  result.status = 'error';
                  throw new Error(parsedData.message || 'Unknown error occurred');
              }
            } catch (e: any) {
              console.error('Failed to parse event data:', e);
              if (e.message !== 'Unknown error occurred') {
                throw e;
              }
            }
          }
          return currentEventType;
        };

        const processEvents = async () => {
          try {
            while (result.status !== 'completed' && result.status !== 'error') {
              const { done, value } = await reader.read();

              if (done) {
                // Process any remaining data in the buffer
                if (buffer.trim()) {
                  const lines = buffer.split('\n');
                  for (const line of lines) {
                    currentEventType = await processLine(line, result, currentEventType);
                  }
                }

                // Log what data we have and what's missing
                const missing = [];
                if (!result.robustSummary) missing.push('robustSummary');
                if (!result.shortSummary) missing.push('shortSummary');
                if (!result.graphLink) missing.push('graphLink');

                console.log('Stream ended. Current data state:', {
                  hasRobustSummary: !!result.robustSummary,
                  hasShortSummary: !!result.shortSummary,
                  hasGraphLink: !!result.graphLink,
                  status: result.status,
                  missing
                });

                // If we have all required data despite not getting a completion event, consider it complete
                if (result.robustSummary && result.shortSummary && result.graphLink) {
                  result.status = 'completed';
                  break;
                }

                // If we don't have all data, throw an error with specific missing items
                throw new Error(`Stream ended before receiving: ${missing.join(', ')}`);
              }

              // Append new chunk to buffer
              buffer += decoder.decode(value, { stream: true });

              // Process complete events in buffer
              const lines = buffer.split('\n');
              // Keep last incomplete line in buffer
              buffer = lines.pop() || '';

              // Process complete lines
              for (const line of lines) {
                currentEventType = await processLine(line, result, currentEventType);
              }
            }
          } finally {
            reader.releaseLock();
          }
        };

        // Race between the processing and timeout
        await Promise.race([processEvents(), timeout]);

        if (result.status === 'completed') {
          if (!result.robustSummary || !result.shortSummary || !result.graphLink) {
            throw new Error('Task completed but missing required data');
          }

          return new Response(JSON.stringify(result), {
            headers: {
              'Content-Type': 'application/json'
            }
          });
        } else {
          throw new Error(`Task ended with status: ${result.status}`);
        }

      } catch (error) {
        console.error(`Attempt ${retryCount + 1} failed:`, error);
        retryCount++;

        if (retryCount === maxRetries) {
          throw error;
        }

        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, retryCount) * 1000));
      }
    }

    throw new Error('All retry attempts failed');

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error(errorMessage);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}