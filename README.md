# Fibermetheus

Quickly set up Prometheus and an Aggregation Gateway, so you can push metrics to Prometheus locally with Autometrics.

## Setup

To run, you need docker (and docker compose) installed locally.

```sh
# Start things up
docker compose up

# NOTE - If you ever make changes, e.g., to the api, you'll want to rebuild the docker images
docker compose up --build
```

- Prometheus runs locally on `localhost:8061`, and loads autometrics alerting rules from `prometheus/autometrics.rules.yml`
- Prometheus will try to scrape `localhost:8080/metrics` by default. You can change this under `scrape_configs` in `prometheus/prometheus.yml`
- The aggregation gateway runs on `localhost:8062`
- An API runs on `localhost:8063` and will proxy requests to `/metrics` to the aggregation gateway, setting proper CORS headers so you can push metrics from the browser

Prometheus will scrape the aggregation gateway every 5 seconds, but you can change this in the `prometheus/prometheus.yml` config file.

Go to http://localhost:8061/targets to check the health of the aggregation gateway.

## Configuration

To configure the local Prometheus port, modify the `FP_PROMETHEUS_PORT` environment variable in the .env file

To configure the local aggregation gateway port, modify the `FP_PUSH_GATEWAY_PORT` environment variable in the .env file

To configure the api proxy to the aggregation gateway port, modify the `FP_API_PORT` environment variable in the .env file

To configure the scrape interval, modify the `prometheus/prometheus.yml` file

## Test it out

Once you've spun up the containers, you can push metrics to the api that's sitting in front of the aggregation gateway:

```sh
echo '
http_requests_total{result="ok", function="curl", module=""} 1027
http_errors_total{result="error", function="curl", module=""} 6
' | curl --data-binary @- http://localhost:8063/metrics/

```

Then, look for the metrics in Prometheus: http://localhost:8061/graph. Search for `http_requests_total{function="curl"}` or `http_errors_total{function="curl"}`.
