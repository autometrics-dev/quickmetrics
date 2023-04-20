# Quickmetrics

> NOTE: This is for demonstration purposes only. Not intended for use in production infrastructure.

Quickly set up metrics with Prometheus and an Aggregation Gateway, so you can push metrics to Prometheus locally with [Autometrics](https://autometrics.dev/).

## Setup

To run, you need docker (and docker compose) installed locally, and a local copy of this repository.

```sh
# Start things up
docker compose up

# NOTE - If you ever make changes, e.g., to the api, you'll want to rebuild the docker images
docker compose up --build
```

- Prometheus runs locally on `localhost:9090`, and loads autometrics alerting rules from `prometheus/autometrics.rules.yml`
- Prometheus will try to scrape `localhost:8080/metrics` by default. You can change this under `scrape_configs` in `prometheus/prometheus.yml`
- The aggregation gateway runs on `localhost:8081`
- An API runs on `localhost:8082` and will proxy requests to `/metrics` to the aggregation gateway, setting proper CORS headers so you can push metrics from the browser

Prometheus will scrape the aggregation gateway every 5 seconds, but you can change this in the `prometheus/prometheus.yml` config file.

Go to http://localhost:9090/targets to check the health of the aggregation gateway.

## Configuration

You can configure the ports on which services are exposed by modifying the `.env` file:

- `FP_PROMETHEUS_PORT` - The port that Prometheus runs on
- `FP_PUSH_GATEWAY_PORT` - The port that the aggregation gateway runs on
- `FP_API_PORT` - The port that the api proxy to the aggregation gateway port runs on

To configure the scrape interval, modify the `prometheus/prometheus.yml` file

## Test it out

Once you've spun up the containers, you can push metrics to the api that's sitting in front of the aggregation gateway:

```sh
echo '
http_requests_total{result="ok", function="curl", module=""} 1027
http_errors_total{result="error", function="curl", module=""} 6
' | curl --data-binary @- http://localhost:8063/metrics/

```

Then, look for the metrics in Prometheus: http://localhost:9090/graph. Search for `http_requests_total{function="curl"}` or `http_errors_total{function="curl"}`.

## Thanks

This makes use of Zapier's [prom-aggregation-gateway](https://github.com/zapier/prom-aggregation-gateway) to support client-side (browser) metrics.
