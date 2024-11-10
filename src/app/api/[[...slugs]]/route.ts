import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/roast/:accountId", async ({ params: { accountId } }) => {
    try {
      // Make request to chain analysis agent to trigger analysis
      const triggerResponse = await fetch(`http://localhost:3000/api/v1/trigger/${accountId}`, {
        method: 'POST',
        headers: {
          "Authorization": "BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImNsaWVudDIiLCJ0eXBlIjoiYWNjZXNzIiwic2NvcGVzIjpbImFjY291bnQ6cHJvY2VzcyIsInF1ZXJ5OmV4ZWN1dGUiXSwiaWF0IjoxNzMxMjM1MTY0LCJleHAiOjE3MzEyMzY5NjQsImF1ZCI6ImFwaS1jbGllbnRzIiwiaXNzIjoibmVhcmxhbnRpcy1hcGkifQ.uAgSwF-RXKHSooAxCVk9d5EpXlTdwxEMD4z3FuSfrDU"
        }
      });

      if (!triggerResponse.ok) {
        throw new Error('Failed to trigger analysis');
      }

      const { data } = await triggerResponse.json();
      const { taskId } = data;

      // Get SSE response
      const summaryResponse = await fetch(`http://localhost:3000/api/v1/summary/stream/${taskId}`, {
        method: 'GET',
        headers: {
          'Accept': 'text/event-stream',
          "Authorization": "BEARER eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJjbGllbnRJZCI6ImNsaWVudDIiLCJ0eXBlIjoiYWNjZXNzIiwic2NvcGVzIjpbImFjY291bnQ6cHJvY2VzcyIsInF1ZXJ5OmV4ZWN1dGUiXSwiaWF0IjoxNzMxMjM1MTY0LCJleHAiOjE3MzEyMzY5NjQsImF1ZCI6ImFwaS1jbGllbnRzIiwiaXNzIjoibmVhcmxhbnRpcy1hcGkifQ.uAgSwF-RXKHSooAxCVk9d5EpXlTdwxEMD4z3FuSfrDU"
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

      try {
        while (result.status !== 'completed' && result.status !== 'failed') {
          const { done, value } = await reader.read();
          
          if (done) {
            if (result.status !== 'completed' && result.status !== 'failed') {
              throw new Error('Stream ended before task completion');
            }
            break;
          }

          // Append new chunk to buffer and process
          buffer += decoder.decode(value, { stream: true });
          
          // Process complete events in buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep last incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('event: ')) {
              currentEventType = line.slice(7).trim();
              continue;
            }
            
            if (line.startsWith('data: ')) {
              const eventData = line.slice(6); // Remove 'data: ' prefix
              try {
                const parsedData = JSON.parse(eventData);
                
                // Process different types of events
                switch (currentEventType) {
                  case 'task_info':
                    result.taskInfo = parsedData;
                    result.status = parsedData.status;
                    break;
                  case 'robust_summary':
                    result.robustSummary = parsedData.summary;
                    break;
                  case 'short_summary':
                    result.shortSummary = parsedData.summary;
                    break;
                  case 'graph_link':
                    result.graphLink = parsedData.url;
                    break;
                  case 'complete':
                    result.status = 'completed';
                    break;
                  case 'error':
                    result.status = 'failed';
                    throw new Error(parsedData.message || 'Unknown error occurred');
                }
              } catch (e) {
                console.error('Failed to parse event data:', e);
                if (e.message !== 'Unknown error occurred') {
                  throw e;
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

      // Only return if we have all the required data
      if (result.status === 'completed') {
        if (!result.robustSummary || !result.shortSummary || !result.graphLink) {
          throw new Error('Task completed but missing required data');
        }
        
        // Return the accumulated data as a single JSON response
        return new Response(JSON.stringify(result), {
          headers: {
            'Content-Type': 'application/json'
          }
        });
      } else {
        throw new Error(`Task ended with status: ${result.status}`);
      }

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 500,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  }
  ).compile();

export const GET = app.handle;
export const POST = app.handle;
