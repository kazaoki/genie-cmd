#!/bin/sh

# Process start
# -------------
echo 'Process start' >> /var/log/init.log

# TimeZone set
# ------------
cp -p /usr/share/zoneinfo/Asia/Tokyo /etc/localtime
echo 'Asia/Tokyo' > /etc/timezone

# Conf files copy from host
# -------------------------
cp /opt/mysql/conf.d/* /etc/mysql/conf.d
sed -i "s/<__MYSQL_CHARSET__>/$MYSQL_CHARSET/" /etc/mysql/conf.d/*
chmod -R 0644 /etc/mysql/conf.d

# Set SQL mode to strict
# ----------------------
echo '\n[mysqld]' >> /etc/mysql/my.cnf
echo 'sql_mode=STRICT_TRANS_TABLES,NO_ENGINE_SUBSTITUTION' >> /etc/mysql/my.cnf

# Copy shell file
# ---------------
cp /opt/mysql/docker-entrypoint-initdb.d/* /docker-entrypoint-initdb.d

# Copy dump file
# --------------
cp /opt/mysql/dumps/$MYSQL_LABEL.* /docker-entrypoint-initdb.d

# Pass to true shell
# ------------------
exec /entrypoint.sh $@
