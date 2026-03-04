import { handle } from "hono/aws-lambda";
import app from "./index.js";

// This is the function AWS Lambda calls
export const handler = handle(app);
