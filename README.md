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

    npm run start-test // testnet
    npm run start-main // mainnet
    // API at `127.0.0.1:8989` or GraphiQL at `127.0.0.1:8989/graphiql`

### Docker

    // Build image
    docker build -t bodhi-server .

    // Run in container
    docker run -p 3000:3000 -d bodhi-server
