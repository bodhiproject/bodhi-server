FROM node:10

RUN apt-get update && apt-get install -y vim

WORKDIR /root/bodhi-server

COPY . .

RUN npm install

ENTRYPOINT ["node", "src/index.js"]

EXPOSE 8888
