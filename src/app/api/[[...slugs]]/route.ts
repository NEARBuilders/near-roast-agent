import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

const app = new Elysia({ prefix: "/api", aot: false })
  .use(swagger())
  .get("/roast/:accountId", async ({ params: { accountId } }) => {
    // ROAST

    const prompt = `roast them`;

    // Make request to chain analysis

    // get summary 

    // run prompt on summary

    // return roast
  })
  .compile();

export const GET = app.handle;
export const POST = app.handle;
