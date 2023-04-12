import express from "express";
import cors from "cors";
import { createProxyMiddleware } from "http-proxy-middleware";

const PORT = 8080;
const PROXY_URL = process.env.PROXY_URL ?? "zzz";

export const main = async () => {
  console.log("Starting api (proxy for /metrics)...");

  const app = express();

  // Enable CORS on all routes, fixes a CORS issue that's not yet fixed in `ghcr.io/zapier/prom-aggregation-gateway:v0.7.0`
  app.use(cors());

  app.use(
    "/metrics",
    createProxyMiddleware({
      target: PROXY_URL,
      // NOTE - enable this to use response interceptors
      // selfHandleResponse: true,
    })
  );

  app.listen(PORT, () => {
    console.log(`Listening on http://localhost:${PORT}`);
    console.log("We will proxy /metrics requests to", PROXY_URL);
  });
};
