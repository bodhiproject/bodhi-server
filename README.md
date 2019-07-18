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
PROVIDER=[ipc|ws|http] (optional. use ws or http for local)
SSL=[true|false] (required)
SSL_KEY_PATH=/path/to/privkey.pem (only if SSL=true)
SSL_CERT_PATH=/path/to/cert.pem (only if SSL=true)
DATA_DIR=/path/to/bodhi/data/dir (optional)
LOG_LEVEL=debug (optional)
```

# Running Server

## Start Docker

```bash
cd docker/mainnet
docker-compose up -d
```

## Stop Docker

```bash
cd docker/mainnet
docker-compose stop
```

## Start Local

```bash
npm start
```

# Copying Server Data

These instructions are for copying the data from the remote server to your local machine.

1. Login to remote server

2. `cd bodhi-server/scripts`

3. I've been copying to `~/.bodhi`. The following example will copy the entire Docker volume's data to ~/.bodhi.

        # Example: ./backup-volume.sh $DOCKER_VOL_NAME $DEST_PATH
        $ ./backup-volume.sh testnet_bodhi-server-testnet ~/.bodhi

4. In your local terminal instance, go to the path you want to copy the files to. This example is going to copy the `nedb` folder to my `bodhi-server/data/testnet/nedb`.

        $ cd bodhi-server/data/testnet
        $ rm -rf nedb

        # The -i ~/.ssh/nakabase.pem should point to where you keep your server credentials key
        $ scp -r -i ~/.ssh/nakabase.pem ubuntu@54.67.22.227:/home/ubuntu/.bodhi/_data/testnet/nedb .

5. You should now have the copied files in your folder.


# GraphQL

To play around in the GraphQL playground, go to:

1. Go to the GraphQL Playground at `localhost:8888/graphql` (port 9999 for testnet)

2. Click on `SCHEMA` button on the right side

3. Browse through all the queries, mutations, or subscriptions
