import { Elysia } from "elysia";
import utils from "./utils";
import pc from "picocolors";
import cors from "@elysiajs/cors"
import swagger from "@elysiajs/swagger"
import { allowedOrigins } from './configs/origin.config';
import {swaggerOps} from './configs/swagger.config'


import { connectDb } from "./configs/db.config";

// mongoose setup
// connectDb();

// server setup
export const app = new Elysia();

app
  .use(cors({ origin: allowedOrigins }))
  .use(swagger(swaggerOps))
  .use(utils)
  .get("/", () => "🦊 Server is up and running")
  .listen(Bun.env.PORT || 3002);


console.log(
  `🦊 Elysia is running at ` +
  pc.yellow(`${app.server?.hostname}:${app.server?.port}`)
);
