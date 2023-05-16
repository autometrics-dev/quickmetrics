import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = 8080;
const AGGREGATION_GATEWAY_URL = process.env.AGGREGATION_GATEWAY_URL ?? "zzz";
const PROMETHEUS_URL = process.env.PROMETHEUS_URL ?? "zzz";

export const main = async () => {
  console.log("Starting api (proxy for /metrics, etc)...");

  const app = express();

  // Enable CORS on all routes, fixes a CORS issue that's not yet fixed in `ghcr.io/zapier/prom-aggregation-gateway:v0.7.0`
  app.use(cors());

  // Serve static files from the "build" folder
  app.use(express.static("/app/build"));

  app.use(
    "/metrics",
    createProxyMiddleware({
      target: AGGREGATION_GATEWAY_URL,
      // NOTE - enable this to use response interceptors
      // selfHandleResponse: true,
    })
  );

  app.use(
    "/",
    createProxyMiddleware({
      target: PROMETHEUS_URL,
    })
  );

  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
    console.log("We will proxy /metrics requests to", AGGREGATION_GATEWAY_URL);
    console.log("We will proxy all other requests to", PROMETHEUS_URL);
  });
};
