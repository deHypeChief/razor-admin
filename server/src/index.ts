import { Elysia } from "elysia";
import routes from "./routes";
import utils from "./utils";
import { allowedOrigins } from './configs/origin.config';
import swaggerConfig from "./configs/swagger.config";
import swagger from "@elysiajs/swagger";
import cors from "@elysiajs/cors";
import { connectDb } from "./configs/db.config";
import { errorHandler } from "./middlewares/error.middleware";
import { performance } from "perf_hooks";
import chalk from "chalk";

console.log(chalk.blue("🔧 Initializing application..."));
const startTime = performance.now(); // Record the start time

connectDb(); // Log handled within the function

const app = new Elysia()
  .use(errorHandler)
  .use(swagger(swaggerConfig))
  .use(cors({ credentials: true, origin: allowedOrigins }))
  .use(routes)
  .use(utils)
  .get("/", () => ("🚀 Server is up and running!")) // Added emoji to response message
  .listen(process.env.PORT || 3000);

const endTime = performance.now(); // Record the end time
const startupTime = (endTime - startTime).toFixed(2); // Calculate startup duration

console.log(
  chalk.cyanBright(
    `🦊 Elysia server is running at ${chalk.underline.blueBright(`http://${app.server?.hostname}:${app.server?.port}`)} 🚀`
  )
);
console.log(chalk.yellowBright(`⏱️ Server started in ${startupTime} ms`));

console.log(
  chalk.magenta(
    `📖 Swagger documentation is enabled at ${chalk.underline.blueBright(`http://${app.server?.hostname}:${app.server?.port}/docs`)}`
  )
);
console.log(chalk.greenBright("🌐 CORS is configured for allowed origins:"));
allowedOrigins.forEach((origin) => console.log(`   🌍 ${chalk.blue(origin)}`));
console.log(chalk.green.bold("✅ All systems initialized successfully!"));
