#!/bin/bash

# This script is meant for Linux-based systems only.
# It will install nginx and setup the port routing for the UI.
# Meant for first-time usage.

# install nginx if necessary
if [ "$(dpkg-query -W nginx)" == "dpkg-query: no packages found matching nginx" ]
    echo 'Installing nginx...' &&
    sudo apt-get update &&
    sudo apt-get install nginx &&
fi

# remove the default sites-available config
if [ "$(ls /etc/nginx/sites-available/default)" == "/etc/nginx/sites-available/default" ]
    echo 'Removing default sites-available...' &&
    sudo rm /etc/nginx/sites-available/default &&
fi

# remove the default sites-enabled config
if [ "$(ls /etc/nginx/sites-enabled/default)" == "/etc/nginx/sites-enabled/default" ]
    echo 'Removing default sites-enabled...' &&
    sudo rm /etc/nginx/sites-enabled/default &&
fi

# copy nginx server block files to sites-available
echo 'Copying sites-enabled config...' &&
sudo cp -a ./nginx-sites/. /etc/nginx/sites-available/ &&

# add symlink to sites-available
if [ "$(ls /etc/nginx/sites-enabled/node)" == "ls: cannot access '/etc/nginx/sites-enabled/node': No such file or directory" ]
    echo 'Adding symlinks...' &&
    sudo ln -s /etc/nginx/sites-available/node /etc/nginx/sites-enabled/node &
fi

# restart nginx
echo 'Restarting nginx...' &&
sudo service nginx restart &&

# add cert renew script to daily cronjob
echo 'Copying cert renew script to cron.daily...' &&
sudo cp renew-cert.sh /etc/cron.daily
