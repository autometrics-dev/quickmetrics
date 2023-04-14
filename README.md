# Fibermetheus + Autometrics

- The `service` folder contains a Docker compose setup
- The `cli` folder contains a CLI tool that can spin up the prometheus setup in `service`, as well as configure an autometrics-enabled app to use the prometheus setup

Both folders have READMEs to explain what they do.

## Requirements

- Docker
- Docker Compose
- Node.js v16 or higher

## Setup

- Install all the requirements above (Docker, Docker Compose, Node.js)
- `cd cli` and run `npm install` to install the CLI tool dependencies.
- Add an alias to the cli `alias autometrics="node /path/to/fibermetheus/cli/autometrics-cli.js"`
- Run `autometrics init` to
