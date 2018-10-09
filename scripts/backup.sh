#!/bin/bash

mkdir -p /root/.bodhi/mainnet/archive
mkdir -p /root/.bodhi/testnet/archive

echo 'Backing up Bodhi DB Mainnet...'
cd /root/.bodhi/mainnet/archive
zip -r "bodhiarchive-$(date +"%Y-%m-%d").zip" /var/lib/docker/volumes/bodhi-server_bodhi-mainnet/_data/.bodhi

echo 'Backing up Bodhi DB Testnet...'
cd /root/.bodhi/testnet/archive
zip -r "bodhiarchive-$(date +"%Y-%m-%d").zip" /var/lib/docker/volumes/bodhi-server_bodhi-testnet/_data/.bodhi
