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

## POST /is-connected
**Response 200**

    true


## POST /validate-address
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

## POST /get-account-address
**Body**

    {
        "accountName": ""   // name of the account
    }

**Response 200**

    qZEj5uvN7v8HCkZojCKC2NguPns8qnckKK
    

## GET /get-wallet-info
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
    
## GET /list-address-groupings
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

## GET /list-unspent
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

## POST /wallet-passphrase
**Body**

    {
        "passphrase": "mypassphrase",   // encrypted wallet passphrase
    	"timeout": 60                   // number of seconds to keep unlocked
    }
    
**Response 200**

    // empty if successful

## POST /wallet-lock    
**Response 200**

    // empty if successful

## POST /encrypt-wallet
**Body**

    {
        "passphrase": "mypassphrase"    // passphrase to encrypt wallet
    }
    
**Response 200**

    // TODO:

## POST /wallet-passphrase-change
**Body**

    {
        "oldPassphrase": "myoldpassphrase",
        "newPassphrase": "mynewpassphrase"
    }
    
**Response 200**

    // TODO:
    
## POST /backup-wallet
**Body**

    {
        "destination": "/path/to/backup"
    }
    
**Response 200**

    // TODO:
    
## POST /import-wallet
**Body**

    {
        "filename": "/path/to/wallet/file"
    }
    
**Response 200**

    // TODO:

## POST /get-block
**Body**

    {
        "blockHash": "9a7624907f032675b1132610a9cf655994b3c5efc9602639df4163e0061e9301"
    }
    
**Response 200**

    {
        "hash": "9a7624907f032675b1132610a9cf655994b3c5efc9602639df4163e0061e9301",
        "confirmations": 90211,
        "strippedsize": 1757,
        "size": 1793,
        "weight": 7064,
        "height": 110521,
        "version": 536870912,
        "versionHex": "20000000",
        "merkleroot": "af97275891255e9849355733f238a63ce193d0177f0ad5ca0425cb3a4fbdb0cc",
        "hashStateRoot": "202c54d58ef956e96284a8de83209914c18cedebe32107f7e01a6cffad49bc4a",
        "hashUTXORoot": "8b1349cfcec74651e997b099ae4bcf196625dfa2fcd99e9eca48efb09b2f4c19",
        "tx": [
            "8d3d4178d044b14e28e9a0f8f1f4c9f3822188ddc546ddbb83eff5324303e08f",
            "a3b098e2b8d86986d7f61e8c0d59130752a1c4b222b4de2576d901c779a7367d",
            "e88fd0a70d3351766589764943e3c600ce25ea278081fe2eca25a8bc85cd7973",
            "db3e5cb6e78cb725fe4109291204e46cb71533157f8f630e5718b5de82735221",
            "27b55126ce888c5990444f63482610aa107f998172c5cf9a51628047a8acd013"
        ],
        "time": 1522051552,
        "mediantime": 1522050368,
        "nonce": 0,
        "bits": "1a18d967",
        "difficulty": 675150.1521075284,
        "chainwork": "0000000000000000000000000000000000000000000000145be34a581c550d50",
        "previousblockhash": "4b50eb93cdc09c1bf9fb0850dc3816bf29b61a911eba906f054962cc01bb800a",
        "nextblockhash": "1e513e837b47dc02ac43fe0f6f1458062b7b050e00f3eabbf58d4daceabbd0d3",
        "flags": "proof-of-stake",
        "proofhash": "0000000000000000000000000000000000000000000000000000000000000000",
        "modifier": "259a841e0c60bf7f369ab6766686eb4a728adb1179731da91ce1ba4f1f2bbe4a",
        "signature": "3044022005e9f844a4432a3e5fb54f62e58acfb1d04dfa77de6b972ed722c80b45cb61a302205422f27c604ab82df161c9a5e1f126e1257935f4aa38f4c22d51ce9acaeb3921"
    }

## GET /get-blockchain-info
**Response 200**

    {
        "chain": "test",
        "blocks": 200731,
        "headers": 200731,
        "bestblockhash": "8d5b1489c0751d0551dcc96e9da6ec5e56361b9262c3c23de75c8bf989930428",
        "difficulty": 899938.817428201,
        "mediantime": 1535112624,
        "verificationprogress": 0.9999945923615153,
        "chainwork": "000000000000000000000000000000000000000000000028f68052a2c6134390",
        "pruned": false,
        "softforks": [
            {
                "id": "bip34",
                "version": 2,
                "reject": {
                    "status": true
                }
            },
            {
                "id": "bip66",
                "version": 3,
                "reject": {
                    "status": true
                }
            },
            {
                "id": "bip65",
                "version": 4,
                "reject": {
                    "status": true
                }
            }
        ],
        "bip9_softforks": {
            "csv": {
                "status": "active",
                "startTime": 0,
                "timeout": 999999999999,
                "since": 6048
            },
            "segwit": {
                "status": "active",
                "startTime": 0,
                "timeout": 999999999999,
                "since": 6048
            }
        }
    }

## GET /get-block-count
**Response 200**

    200731

## POST /get-block-hash
**Body**

    {
        "blockNum": 0
    }
    
**Response 200**

    0000e803ee215c0684ca0d2f9220594d3f828617972aad66feb2ba51f5e14222

## POST /get-transaction-receipt
**Body**

    {
        "transactionId": "843bea0ad1b9df120bd6e819f43e2a181a5b54267115930876280eaf7176e5c1"
    }
    
**Response 200**

    [
        {
            "blockHash": "3e79d8401acce68cd66af7f013773fd1e8b65bcbf57e12382e0dab9e4280c866",
            "blockNumber": 112365,
            "transactionHash": "843bea0ad1b9df120bd6e819f43e2a181a5b54267115930876280eaf7176e5c1",
            "transactionIndex": 2,
            "from": "76a177b79b8ef37437dce27a38fa2653eb6d8241",
            "to": "f6177bc9812eeb531907621af6641a41133dea9e",
            "cumulativeGasUsed": 45693,
            "gasUsed": 45693,
            "contractAddress": "f6177bc9812eeb531907621af6641a41133dea9e",
            "excepted": "None",
            "log": [
                {
                    "address": "f6177bc9812eeb531907621af6641a41133dea9e",
                    "topics": [
                        "8c5be1e5ebec7d5bd14f71427d1e84f3dd0314c0f7b2291e5b200ac8c7c3b925",
                        "00000000000000000000000076a177b79b8ef37437dce27a38fa2653eb6d8241",
                        "0000000000000000000000007cde77dbe43dadea8a707858645f504ca7bf90ad"
                    ],
                    "data": "0000000000000000000000000000000000000000000000000000000000000001"
                }
            ]
        }
    ]

## POST /search-logs
**Body**

    {
        "fromBlock": 85000,
        "toBlock": 86000,
        "addresses": [],
        "topics": ["5f86751734872d7179519ded4087b938c7f8b03dd3511225a5fc97a687701126"]
    }
    
**Response 200**

    [
        {
            "blockHash": "8b744f912efdf85eecec6885ea687d8763aa410ab8c3d6b5217c9fc39869d880",
            "blockNumber": 85454,
            "transactionHash": "3d86c7a5d6194751ac0fda677f080c613f2df7ff919da641043f3426629f2743",
            "transactionIndex": 3,
            "from": "17e7888aa7412a735f336d2f6d784caefabb6fa3",
            "to": "c8182fd6a356fcc66b81f749285e5a1327f50cd7",
            "cumulativeGasUsed": 2742381,
            "gasUsed": 2686038,
            "contractAddress": "c8182fd6a356fcc66b81f749285e5a1327f50cd7",
            "excepted": "None",
            "log": [
                {
                    "0": "4",
                    "1": "0x17e7888aa7412a735f336d2f6d784caefabb6fa3",
                    "2": "5a815830",
                    "3": "5a815a14",
                    "4": "5a815a2a",
                    "5": "5a87efca",
                    "6": "2540be400",
                    "_numOfResults": "4",
                    "_oracle": "17e7888aa7412a735f336d2f6d784caefabb6fa3",
                    "_bettingStartTime": "5a815830",
                    "_bettingEndTime": "5a815a14",
                    "_resultSettingStartTime": "5a815a2a",
                    "_resultSettingEndTime": "5a87efca",
                    "_consensusThreshold": "2540be400",
                    "_version": "0",
                    "_contractAddress": "1c5410a340e202e9a351b2cc5bfd7830b5d3e733",
                    "_eventAddress": "84dca147e511b7356505f2530eccd78abba4b4dd",
                    "_eventName": "CentralizedOracleCreated"
                },
                {
                    "address": "c8182fd6a356fcc66b81f749285e5a1327f50cd7",
                    "topics": [
                        "5f86751734872d7179519ded4087b938c7f8b03dd3511225a5fc97a687701126",
                        "0000000000000000000000000000000000000000000000000000000000000000",
                        "00000000000000000000000084dca147e511b7356505f2530eccd78abba4b4dd"
                    ],
                    "data": "57686f2077696c6c2067657420746865206d6f7374206d6564616c73206174207468652077696e746572206f6c796d706963733f00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000496e76616c69640000000000000000000000000000000000000000000000000055534100000000000000000000000000000000000000000000000000000000004a6170616e0000000000000000000000000000000000000000000000000000004368696e6100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004"
                }
            ]
        }
    ]
