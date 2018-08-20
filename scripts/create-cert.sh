#!/bin/bash

echo 'Creating certificates with Certbot...'
certbot --nginx -d puti.io -d www.puti.io
