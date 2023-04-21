FROM node:18-bullseye-slim

WORKDIR /app

COPY *.json ./
COPY src ./src/
COPY entrypoint.sh ./

RUN npm install

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
