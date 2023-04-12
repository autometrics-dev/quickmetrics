import express from "express";
import cors from "cors";
import {
  createProxyMiddleware,
  // responseInterceptor,
  Options,
} from "http-proxy-middleware";

const PORT = process.env.PORT ?? 8080;
const PROXY_URL =
  process.env.PROXY_URL ?? "http://prometheus-push-gateway:80/metrics";

const proxyOptions: Options = {
  target: PROXY_URL,
  selfHandleResponse: true,
};

export const main = async () => {
  console.log("Starting api proxy...");

  const app = express();

  // Enable CORS on all routes
  app.use(cors());

  app.use((req, res, next) => {
    console.log("Request received: ", req.method, req.path);
    next();
  });

  app.use(
    "/metrics",
    (req, res, next) => {
      console.log("Received request: ", req.method, req.path);
      next();
    },
    createProxyMiddleware({
      ...proxyOptions,
      // on: {
      //   proxyRes: responseInterceptor(
      //     async (responseBuffer, _proxyRes, _req, res) => {
      //       // res.setHeader('Access-Control-Allow-Origin', '*');
      //       const response = responseBuffer.toString("utf8"); // convert buffer to string
      //       return response.replace("Hello", "Goodbye"); // manipulate response and return the result
      //     }
      //   ),
      // },
    })
  );

  const onListeningHandler = () => {
    console.log(`Listening on http://localhost:${PORT}`);
    console.log("We will proxy requests to", PROXY_URL);
  };

  app.listen(PORT, onListeningHandler);
};
