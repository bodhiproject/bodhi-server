#!/bin/bash

# This script is meant for Linux-based systems only.
# It will install nginx and setup the port routing for the UI.

# install nginx
echo 'Installing nginx...'
sudo apt-get update &&
sudo apt-get install nginx &&

# remove the default sites-enabled config
echo 'Removing default sites-enabled...' &&
sudo rm /etc/nginx/sites-enabled/default &&

# copy nginx config to sites-available
echo 'Copying sites-enabled config...' &&
sudo cp -a ./nginx-sites/. /etc/nginx/sites-available/ &&

# add symlink to sites-available
echo 'Adding symlinks...' &&
sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node &&

echo 'Restarting nginx...' &&
sudo service nginx restart
