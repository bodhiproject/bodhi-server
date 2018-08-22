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

### Local

    // Acceptable flags
    --dev                       // Runs development environment
    --noweb                     // Does not host website. Use this if you will run Bodhi-UI separately.
    --testnet                   // Use testnet
    --mainnet                   // Use mainnet
    --rpcpassword=myPassword    // Force starting qtumd with this rpc pw
    --qtumpath=/path/to/bin     // Path to the qtumd binaries
    --passphrase=myPassphrase   // Passphrase used to unlock the your wallet

    // Running development environment: dev data dir and no papertrail logging
    npm run devtest // dev testnet
    npm run devmain // dev mainnet

    // Running production environment
    npm run prodtest // prod testnet
    npm run prodmain // prod mainnet

    // API at `localhost:8989`
    // GraphQL Playground at `localhost:8989/graphql`

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
