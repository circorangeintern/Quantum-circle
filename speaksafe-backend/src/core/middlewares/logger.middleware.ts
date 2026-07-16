import morgan from "morgan";
import logger from "../utils/logger.util";
import { Request } from "express";

// Morgan stream that uses Winston
const stream = {
  write: (message: string) => {
    logger.info(message.trim());
  },
};

// Custom format for morgan
const format = ":method :url :status :res[content-length] - :response-time ms";

export const morganMiddleware = morgan(format, {
  stream,
  skip: (req: Request) => req.path === "/health" || req.path === "/",
});
