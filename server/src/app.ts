import cors from "cors";
import express, {
  type Express,
  type NextFunction,
  type Request,
  type Response
} from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import { env } from "./config/env.js";

export const app: Express = express();

app.use(helmet());
app.use(
  cors({
    origin: env.CLIENT_ORIGIN
  })
);
app.use(express.json({ limit: "1mb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: "draft-8",
    legacyHeaders: false
  })
);

app.get("/api/health", (_request: Request, response: Response) => {
  response.status(200).json({ status: "ok" });
});

app.use((_request: Request, response: Response) => {
  response.status(404).json({ error: "Not found" });
});

app.use(
  (
    error: unknown,
    _request: Request,
    response: Response,
    next: NextFunction
  ) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(500).json({ error: "Internal server error" });
  }
);
