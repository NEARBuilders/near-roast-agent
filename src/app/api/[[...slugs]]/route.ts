import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/roast/:accountId", async ({ params: { accountId } }) => {
    // ROAST

    const prompt = `read this summary and roast them`;
    
    // check KV store if accountId has already been analyzed

    // if not
      // make request to chain analysis agent (dleer)
      // save summary to kv store

    // run prompt on summary

    // return roast
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;
