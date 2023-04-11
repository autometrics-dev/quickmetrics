# Fibermetheus

Quickly set up Prometheus and an aggregation gateway, so you can push metrics to Prometheus locally with autometrics.

## Setup

To run, you need docker and docker compose installed locally, then execute the following:

```sh
# Start
docker compose up --build
```

Prometheus runs locally on `localhost:8061` and the aggregation gateway runs on `localhost:8062`.

Prometheus will scrape the aggregation gateway every 5 seconds.

Go to http://localhost:8061/targets to check the health of the aggregation gateway.

## Configuration

To configure the local Prometheus port, modify the `FP_PROMETHEUS_PORT` environment variable in the .env file

To configure the local aggregation gateway port, modify the `FP_PUSH_GATEWAY_PORT` environment variable in the .env file

To configure the scrape interval, modify the `prometheus/prometheus.yml` file and re-run docker compose

## TODO

- [ ] Configure the aggregation gateway to listen on a specific port (so pushing metrics should hopefully work out of the box)

- [ ] Configure prometheus to scrape an app running on a specific port (so we can then tell someone to run their metrics endpoint on that port and it’ll just work)

- [ ] Set the scrape interval

- [ ] Use the Autometrics alerting rules file

- [x] Configure Prometheus to scrape the aggregation gateway
