[![Build Status](https://travis-ci.org/bodhiproject/bodhi-server.svg?branch=master)](https://travis-ci.org/bodhiproject/bodhi-server)

# Prerequisites

1. Nix-based OS
2. Node 10 installed

# Installation

1. `git clone https://github.com/bodhiproject/bodhi-server.git`
2. `cd bodhi-server`
3. `npm install`

# Environment Setup

You must specify certain attributes in a `.env` file at the root folder.

```text
NETWORK=[mainnet|testnet] (required)
SSL=[true|false] (required)
SSL_KEY_PATH=/path/to/privkey.pem (only if SSL=true)
SSL_CERT_PATH=/path/to/cert.pem (only if SSL=true)
DATA_DIR=/path/to/bodhi/data/dir (optional)
LOG_LEVEL=debug (optional)
```

# Running Server

## Start Docker

```bash
cd docker
docker-compose up -d
```

## Stop Docker

```bash
cd docker
docker-compose stop
```

## Start Local

```bash
npm run start:mainnet
npm run start:testnet
```

# GraphQL

To play around in the GraphQL playground, go to:

1. Go to the GraphQL Playground at `localhost:8989/graphql` (port 6767 for testnet)

2. Click on `SCHEMA` button on the right side

3. Browse through all the queries, mutations, or subscriptions
