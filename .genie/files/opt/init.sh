#!/bin/sh

# The following script will be executed after the startup of the container.

# -- Permission setting
# find /var/www/html/ -type d -exec chmod 0777 {} \;
# find /var/www/html/ -type f -exec chmod 0666 {} \;
# find /var/www/html/ -type f -name *.cgi -exec chmod 0755 {} \;

# -- Apache tuning
# cat - << EOS >> /etc/httpd/conf/httpd.conf
# <IfModule prefork.c>
#   StartServers     256
#   MinSpareServers  128
#   MaxSpareServers  256
#   ServerLimit      256
#   MaxClients       256
#   MaxRequestsPerChild  4000
# </IfModule>
# Timeout 60
# HostnameLookups Off
# EOS
# httpd -k graceful

# -- etc...




# -- Print log
echo 'init.sh setup done.' >> /var/log/entrypoint.log
