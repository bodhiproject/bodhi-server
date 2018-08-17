#!/bin/bash

# This script is meant for Linux-based systems only.
# It will install nginx and setup the port routing for the UI.

# install nginx
sudo apt-update
sudo apt-get install nginx

# remove the default sites-enabled config
sudo rm /etc/nginx/sites-enabled/default
