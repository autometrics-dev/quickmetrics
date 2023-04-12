# Fibermetheus

Quickly set up Prometheus and an Aggregation Gateway, so you can push metrics to Prometheus locally with Autometrics.

## Setup

To run, you need docker and docker compose installed locally, then execute the following:

```sh
# Start things up
docker compose up

# NOTE - If you ever make changes, e.g., to the api, you'll want to rebuild the docker images
docker compose up --build
```

- Prometheus runs locally on `localhost:8061`, and loads the rules from `prometheus/autometrics.rules.yml`
- Aggregation gateway runs on `localhost:8062`
- API that proxies to the aggregation gateway runs on `localhost:8063`

Prometheus will scrape the aggregation gateway every 5 seconds, but you can change this in the `prometheus/prometheus.yml` config file.

Go to http://localhost:8061/targets to check the health of the aggregation gateway.

## Configuration

To configure the local Prometheus port, modify the `FP_PROMETHEUS_PORT` environment variable in the .env file

To configure the local aggregation gateway port, modify the `FP_PUSH_GATEWAY_PORT` environment variable in the .env file

To configure the api proxy to the aggregation gateway port, modify the `FP_API_PORT` environment variable in the .env file

To configure the scrape interval, modify the `prometheus/prometheus.yml` file

## Test it out

Push metrics to the api that's sitting in front of the aggregation gateway:

```sh
echo '
http_requests_total{result="ok", function="curl", module=""} 1027
http_errors_total{result="error", function="curl", module=""} 6
' | curl --data-binary @- http://localhost:8063/metrics/

```

Look for the metrics in Prometheus: http://localhost:8061/graph. Search for `http_requests_total{function="curl"}` or `http_errors_total{function="curl"}`.

## TODO

- [ ] Configure Prometheus to scrape an app running on a specific port (so we can then tell someone to run their metrics endpoint on that port and it’ll just work)

- [x] Configure the Aggregation gateway to listen on a specific port (so pushing metrics should hopefully work out of the box)

- [x] Set the scrape interval

- [x] Use the Autometrics alerting rules file

- [x] Configure Prometheus to scrape the aggregation gateway
