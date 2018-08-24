[![Build Status](https://travis-ci.org/bodhiproject/bodhi-server.svg?branch=master)](https://travis-ci.org/bodhiproject/bodhi-server)

## Prerequisites
1. Node 9 installed
2. You will need the Qtum client for the OS you are testing on (or building against). Download the [Qtum client](https://github.com/qtumproject/qtum/releases) for the correct OS and put the `bin/` folder in the corresponding dir:

        bodhi-server/qtum/mac/bin         qtum-0.14.16-osx64.tar.gz 
        bodhi-server/qtum/win64/bin       qtum-0.14.16-win64.zip
        bodhi-server/qtum/win32/bin       qtum-0.14.16-win32.zip
        bodhi-server/qtum/linux64/bin     qtum-0.14.16-x86_64-linux-gnu.tar.gz
        bodhi-server/qtum/linux32/bin     qtum-0.14.16-i686-pc-linux-gnu.tar.gz

## Install
1. `git clone https://github.com/bodhiproject/bodhi-server.git`
2. `cd bodhi-server`
3. `npm install`

## Running Server

### Acceptable Flags

    --dev                       // Runs development environment. /dev data dir and no Papertrail logging.
    --local                     // Does not host webserver and uses http protocol. Use this if you will run Bodhi-UI separately.
    --testnet                   // Use testnet blockchain
    --mainnet                   // Use mainnet blockchain
    --rpcpassword=myPassword    // Force starting qtumd with this rpc pw
    --qtumpath=/path/to/bin     // Path to the qtumd binaries
    --passphrase=myPassphrase   // Passphrase used to unlock the your wallet

### Local

    // Run local environment. Meant with usage with bodhi-ui dev server.
    // dev data dir, no Papertrail, no webserver, HTTP protocol
    npm run localtest // testnet
    npm run localmain // mainnet

    // UI at localhost:4000
    // API at localhost:6767
    // GraphQL Playground at localhost:6767/graphql

### Staging

    // Run staging environment. Meant for usage on remote server.
    // dev data dir, no Papertrail, hosts webserver, HTTPS protocol
    npm run stagetest // testnet
    npm run stagemain // mainnet

    // UI at localhost:4000
    // API at localhost:6767
    // GraphQL Playground at localhost:6767/graphql

### Production

    // Running production environment. Meant for usage on remote server.
    // data dir, Papertrail enabled, hosts webserver, HTTPS protocol
    npm run prodtest // testnet
    npm run prodmain // mainnet

    // UI at localhost:3000
    // API at localhost:8989
    // GraphQL Playground at localhost:8989/graphql

### Docker

    // Install Docker
    apt install docker

    // Install Docker-Compose
    sudo curl -L https://github.com/docker/compose/releases/download/1.18.0/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose

    // Start Docker container
    docker-compose up -d

    // Stop Docker container
    docker-compose stop

## Environment Setup
You can specify certain attributes in a `.env` file at the root folder. `QTUM_PATH` in `.env` will take priority over the flag `--qtumpath=/path/to/bin`.

    QTUM_PATH=./qtum/linux64/bin
    QTUM_DATA_DIR=/path/to/qtum/data/dir
    DATA_DIR=/path/to/bodhi/data/dir
    SSL_KEY_PATH=/etc/letsencrypt/live/puti.io/privkey.pem
    SSL_CERT_PATH=/etc/letsencrypt/live/puti.io/fullchain.pem
    LOG_LEVEL=debug

## First Time Setup for Remote Server
This is meant to be setup on an Linux-based OS. This will remove the default config files for `nginx` and add the server block config for routing to the website. It will also add a daily cronjob script to renew the TLS certificate.

### Instructions
1. Install nginx

        sudo apt-get update
        sudo apt-get install nginx

2. Follow the instructions here: https://www.digitalocean.com/community/tutorials/how-to-secure-nginx-with-let-s-encrypt-on-ubuntu-16-04 to secure the server with a TLS certificate with `Certbot`.

3. Run setup script (requires Python 2.7)

        cd scripts
        python setup.py

## GraphQL
To view the entire schema, go to:
- Local/Staging Server: `localhost:6767/graphql`
- Production Server: `localhost:8989/graphql`
- Puti.io: `https://puti.io:8989/graphql`
- Click on `SCHEMA` button on the right side
- Browse through all the queries, mutations, or subscriptions

## API

### POST /is-connected
**Response 200**

    true


### POST /validate-address
**Body**

    {
	    "address": "qMZK8FNPRm54jvTLAGEs1biTCgyCkcsmna"
    }

**Response 200**

    {
        "isvalid": true,
        "address": "qMZK8FNPRm54jvTLAGEs1biTCgyCkcsmna",
        "scriptPubKey": "76a9142bdd237124cd69d2e2e15dea8d9537eebdd2b7bf88ac",
        "ismine": true,
        "iswatchonly": false,
        "isscript": false,
        "pubkey": "03e9a15471175bf84315e7d3d41290562a212d654772d6523054d0dd79fa96c18d",
        "iscompressed": true,
        "account": "",
        "timestamp": 1523913008,
        "hdkeypath": "m/88'/0'/1'",
        "hdmasterkeyid": "bdaa41c1c27632679040f9f92763f97a395864cf"
    }

### POST /get-account-address
**Body**

    {
        "accountName": ""   // name of the account
    }

**Response 200**

    qZEj5uvN7v8HCkZojCKC2NguPns8qnckKK
    

### GET /get-wallet-info
**Response 200**

    {
        "walletname": "wallet.dat",
        "walletversion": 130000,
        "balance": 730082.985266,
        "stake": 53789.73537221,
        "unconfirmed_balance": 0,
        "immature_balance": 0,
        "txcount": 3194,
        "keypoololdest": 1523913717,
        "keypoolsize": 1000,
        "unlocked_until": 1535714484,
        "paytxfee": 0,
        "hdmasterkeyid": "ad53676a8050991dbc8313ebcc606af6d00081b4"
    }
    
### GET /list-address-groupings
**Response 200**

    [
        [
            [
                "qMZK8FNPRm54jvTLAGEs1biTCgyCkcsmna",
                730082.985266,
                ""
            ]
        ]
    ]

### GET /list-unspent
**Response 200**

    [
        {
            "txid": "389f0f1a4a560f90455a979633f39b2be636326551800abdea7bc3a9619d240f",
            "vout": 1,
            "address": "qMZK8FNPRm54jvTLAGEs1biTCgyCkcsmna",
            "account": "",
            "scriptPubKey": "2103e9a15471175bf84315e7d3d41290562a212d654772d6523054d0dd79fa96c18dac",
            "amount": 1927.89,
            "confirmations": 23797,
            "spendable": true,
            "solvable": true,
            "safe": true
        }
    ]

### POST /wallet-passphrase
**Body**

    {
        "passphrase": "mypassphrase",   // encrypted wallet passphrase
    	"timeout": 60                   // number of seconds to keep unlocked
    }
    
**Response 200**

    // empty if successful

### POST /wallet-lock    
**Response 200**

    // empty if successful

### POST /encrypt-wallet
**Body**

    {
        "passphrase": "mypassphrase"    // passphrase to encrypt wallet
    }
    
**Response 200**

    // TODO:

### POST /wallet-passphrase-change
**Body**

    {
        "oldPassphrase": "myoldpassphrase",
        "newPassphrase": "mynewpassphrase"
    }
    
**Response 200**

    // TODO:
    
### POST /backup-wallet
**Body**

    {
        "destination": "/path/to/backup"
    }
    
**Response 200**

    // TODO:
    
### POST /import-wallet
**Body**

    {
        "filename": "/path/to/wallet/file"
    }
    
**Response 200**

    // TODO:
