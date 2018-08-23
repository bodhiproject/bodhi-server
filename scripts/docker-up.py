import os
import os.path
# from subprocess import call

def dirExists(path):
    return os.path.isdir(path)

# Create qtum data dir if needed
path = '/root/.qtum'
if not dirExists(path):
    try:
        os.mkdir(path)
    except OSError:  
        print ('Error creating directory: %s' % path)
    else:  
        print ('Directory created: %s ' % path)


# # restart nginx
# print 'Restarting nginx...'
# call(['sudo', 'service', 'nginx', 'restart'])

# # add cert renew script to daily cronjob
# print 'Copying cert renew script to cron.daily...'
# shutil.copy('renew-cert.sh', '/etc/cron.daily')
