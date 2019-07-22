# Bodhi Server

[![Build Status](https://travis-ci.org/bodhiproject/bodhi-server.svg?branch=master)](https://travis-ci.org/bodhiproject/bodhi-server)

## Prerequisites

1. Nix-based OS
2. Node 10
3. Docker (if running containerized version)

## Installation

1. `git clone https://github.com/bodhiproject/bodhi-server.git`
2. `cd bodhi-server`
3. `npm install`

## Run Locally

### Environment Setup

You must specify certain attributes in an `.env` file at the root folder.

```text
NETWORK=[mainnet|testnet] (required)
NAKABASE_API_KEY=your_api_key (required)
SSL=[true|false] (required)
SSL_KEY_PATH=/path/to/privkey.pem (only if SSL=true)
SSL_CERT_PATH=/path/to/cert.pem (only if SSL=true)
PROVIDER=[ipc|ws|http] (optional. use ws or http for local)
DATA_DIR=/path/to/bodhi/data/dir (optional)
LOG_LEVEL=debug (optional)
```

### Start Local

```bash
npm start
```

### Local GraphQL Playground

To play around in the GraphQL playground, go to:

1. Go to the GraphQL Playground at `localhost:8888/graphql` (port 9999 for testnet)

2. Click on `SCHEMA` button on the right side

3. Browse through all the queries, mutations, or subscriptions

## Run Docker

The docker-compose files are configured to be run on an Ubuntu Linux server. The servers run with a bound volume mount to your host machine at `/home/ubuntu/.bodhi`. It also uses the IPC Web3 provider so if you don't have a local geth node running with the IPC file at `/home/ubuntu/.naka/[mainnet|testnet]/geth.ipc` then it won't sync. [Running it locally](#run-locally) is preferred for development environments.

### Start Docker

```bash
cd docker/mainnet
docker-compose up -d
```

### Stop Docker

```bash
cd docker/mainnet
docker-compose down
```

### Remote GraphQL Playground

See URLs [here](https://docs.nakachain.org/docs/bodhi-metadata/#graphql).

## Copy Server Data From AWS

These instructions are for copying the data from the remote AWS EC2 server to your local machine. Use [scp (secure copy)](https://haydenjames.io/linux-securely-copy-files-using-scp/) to copy the files directly to your local machine.

```bash
# -r recursively copies all the files.
# -i ~/.ssh/bodhi_server.pem is the path to your .pem key.
# ubuntu@52.8.119.5:/home/ubuntu/.bodhi is the remote destination to copy the files from.
# . is the local destination to copy the files to. in this case, it will copy it to your current dir.
$ scp -r -i ~/.ssh/bodhi_server.pem ubuntu@52.8.119.5:/home/ubuntu/.bodhi .
```
