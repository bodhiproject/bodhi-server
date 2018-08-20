import os
import os.path
import shutil
from subprocess import call

def fileExists(path):
    return os.path.isfile(path) and os.access(path, os.R_OK)

# remove the default sites-available config
path = '/etc/nginx/sites-available/default'
if fileExists(path):
    print 'Removing default sites-available...'
    os.remove(path)

# remove the default sites-enabled config
path = '/etc/nginx/sites-enabled/default'
if fileExists(path):
    print 'Removing default sites-enabled...'
    os.remove(path)

# copy nginx server block files to sites-available
sites_dir = './nginx-sites'
for filename in os.listdir(sites_dir):
    full_filename = os.path.join(sites_dir, filename)
    if (os.path.isfile(full_filename)):
        shutil.copy(full_filename, '/etc/nginx/sites-available/')

# add symlink to sites-available
path = '/etc/nginx/sites-enabled/website'
if not fileExists(path):
    print 'Adding website symlink...'
    call(['sudo', 'ln', '-s', '/etc/nginx/sites-available/website', '/etc/nginx/sites-enabled/website'])

# restart nginx
print 'Restarting nginx...'
call(['sudo', 'service', 'nginx', 'restart'])

# add cert renew script to daily cronjob
print 'Copying cert renew script to cron.daily...'
shutil.copy('renew-cert.sh', '/etc/cron.daily')
