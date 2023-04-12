FROM node:16-bullseye

RUN mkdir /app
WORKDIR /app

COPY *.json ./
COPY src ./src/
COPY entrypoint.sh ./

RUN npm install

ENTRYPOINT ["/bin/bash", "entrypoint.sh"]
