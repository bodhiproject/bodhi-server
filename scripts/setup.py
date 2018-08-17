import os
import os.path
import shutil
from subprocess import call

# remove the default sites-available config
path = '/etc/nginx/sites-available/default'
if os.path.isfile(path) and os.access(path, os.R_OK):
    print 'Removing default sites-available...'
    os.remove(path)

# remove the default sites-enabled config
path = '/etc/nginx/sites-enabled/default'
if os.path.isfile(path) and os.access(path, os.R_OK):
    print 'Removing default sites-enabled...'
    os.remove(path)

# copy nginx server block files to sites-available
SITES = os.listdir('./nginx-sites')
for filename in SITES:
    full_filename = os.path.join(src, filename)
    if (os.path.isfile(full_filename)):
        shutil.copy(full_filename, '/etc/nginx/sites-available/')

# add symlink to sites-available
print 'Adding symlinks...'
call(['sudo', 'ln', '-s', '/etc/nginx/sites-available/node', '/etc/nginx/sites-enabled/node'])

# restart nginx
print 'Restarting nginx...'
call(['sudo', 'service', 'nginx', 'restart'])

# add cert renew script to daily cronjob
print 'Copying cert renew script to cron.daily...'
shutil.copy('renew-cert.sh', '/etc/cron.daily')
