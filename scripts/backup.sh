#!/bin/bash

mkdir -p /root/.bodhi/mainnet/archive
mkdir -p /root/.bodhi/testnet/archive

echo 'Backing up Bodhi DB Mainnet...'
cd /root/.bodhi/mainnet/archive
zip -r "bodhiarchive-$(date +"%Y-%m-%d").zip" /var/lib/docker/volumes/bodhi-server_bodhi-mainnet/_data/.bodhi

echo 'Removing Mainnet archives older than 14 days...'
find /root/.bodhi/mainnet/archive -mindepth 1 -mtime +14 -delete

echo 'Backing up Bodhi DB Testnet...'
cd /root/.bodhi/testnet/archive
zip -r "bodhiarchive-$(date +"%Y-%m-%d").zip" /var/lib/docker/volumes/bodhi-server_bodhi-testnet/_data/.bodhi

echo 'Removing Testnet archives older than 14 days...'
find /root/.bodhi/testnet/archive -mindepth 1 -mtime +14 -delete
