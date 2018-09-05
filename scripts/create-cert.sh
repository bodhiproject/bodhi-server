#!/bin/bash

echo 'Creating SSL certificates with Certbot...'
certbot --nginx -d puti.io -d www.puti.io -d test.puti.io
