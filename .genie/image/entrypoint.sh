#!/bin/sh

# --------------------------------------------------------------------
# general
# --------------------------------------------------------------------
echo ". /etc/bashrc" >> /root/.bashrc

# --------------------------------------------------------------------
# httpd mode
# --------------------------------------------------------------------
if [[ $GENIE_PROC == 'httpd' ]]; then
  /usr/sbin/httpd
  /loop.sh
  exit 0
fi

# # --------------------------------------------------------------------
# # spec|zap mode
# # --------------------------------------------------------------------
# if [[ $GENIE_PROC == 'spec' ]] || [[ $GENIE_PROC == 'zap' ]]; then

#   # -- make nosend file
#   [[ $GENIE_PROC == 'spec' && $GENIE_SPEC_NO_SENDMAIL ]] && touch /tmp/nosend
#   [[ $GENIE_PROC == 'zap'  && $GENIE_ZAP_NO_SENDMAIL  ]] && touch /tmp/nosend

#   # -- dir copy
#   \cp -rpdfL /_/* /

#   # -- mount prefix
#   prefix_mount=/_
# fi

# --------------------------------------------------------------------
# mount mode is copy
# --------------------------------------------------------------------
if [[ $GENIE_CORE_DOCKER_MOUNT_MODE == 'copy' ]]; then
  # -- dir copy
  \cp -rpdfL /_/* /
fi

# --------------------------------------------------------------------
# dlsync mode
# --------------------------------------------------------------------
if [[ $GENIE_PROC == 'dlsync' ]]; then
  rm -f /tmp/mirror.cmd
  if [[ $GENIE_TRANS_DLSYNC_REMOTE_CHARSET ]]; then
    echo "set ftp:charset $GENIE_TRANS_DLSYNC_REMOTE_CHARSET" >> /tmp/mirror.cmd
  fi
  if [[ $GENIE_TRANS_DLSYNC_LOCAL_CHARSET ]]; then
    echo "set file:charset $GENIE_TRANS_DLSYNC_LOCAL_CHARSET" >> /tmp/mirror.cmd
  fi
  echo "set ftp:list-options -a" >> /tmp/mirror.cmd
  echo "set ssl:verify-certificate no" >> /tmp/mirror.cmd
  echo "open -u $GENIE_TRANS_DLSYNC_REMOTE_USER,$GENIE_TRANS_DLSYNC_REMOTE_PASS $GENIE_TRANS_DLSYNC_REMOTE_HOST" >> /tmp/mirror.cmd
  echo "mirror $GENIE_TRANS_DLSYNC_LFTP_OPTION $GENIE_TRANS_DLSYNC_REMOTE_DIR /sync" >> /tmp/mirror.cmd
  echo "close" >> /tmp/mirror.cmd
  echo "quit" >> /tmp/mirror.cmd
  echo "--------------------------------------------------------------"
  cat /tmp/mirror.cmd
  echo "--------------------------------------------------------------"
  lftp -f /tmp/mirror.cmd
  exit 0;
fi

# --------------------------------------------------------------------
# entrypoint.sh started
# --------------------------------------------------------------------
echo 'entrypoint.sh setup start.' >> /var/log/entrypoint.log

# --------------------------------------------------------------------
# sshd setup
# --------------------------------------------------------------------
if [[ $GENIE_TRANS_SSHD_ENABLED ]]; then
  genie_pass=`echo $GENIE_TRANS_SSHD_LOGIN_PASS | openssl passwd -1 -stdin`
  useradd $GENIE_TRANS_SSHD_LOGIN_USER -d $GENIE_TRANS_SSHD_LOGIN_PATH -M -l -R / -G docker -p $genie_pass
  ssh-keygen -A
  /usr/sbin/sshd -D -f /etc/ssh/sshd_config &
fi

# # --------------------------------------------------------------------
# # perl setup
# # --------------------------------------------------------------------
# if [[ $GENIE_LANG_PERL_VERSION != '' ]]; then
#   mkdir -p /genie/opt/perl
#   # -- tar restore
#   mkdir -p /perl/versions
#   tarfile="/genie/opt/perl/versions.tar"
#   if [ -e $tarfile ]; then
#     tar xf $tarfile -C /perl/versions
#   fi
#   # -- install
#   install_path="/perl/versions/$GENIE_LANG_PERL_VERSION"
#   link_to="/root/.anyenv/envs/plenv/versions/$GENIE_LANG_PERL_VERSION"
#   if [[ ! -e $install_path ]]; then
#     # -- perl install
#     /root/.anyenv/envs/plenv/plugins/perl-build/bin/perl-build $GENIE_LANG_PERL_VERSION ${install_path}
#     if [[ ! -e $install_path ]]; then
#       exit 1
#     fi
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/plenv/bin/plenv global $GENIE_LANG_PERL_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/plenv/bin/plenv rehash
#     cd /perl/versions
#     tar cf /genie/opt/perl/versions.tar ./
#   else
#     # -- perl relink
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/plenv/bin/plenv global $GENIE_LANG_PERL_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/plenv/bin/plenv rehash
#   fi
#   if [[ ! -L /usr/bin/perl ]]; then
#     unlink /usr/bin/perl
#     ln -s $install_path/bin/perl /usr/bin/perl
#   fi
#   echo 'Perl setup done.' >> /var/log/entrypoint.log
# fi

# # --------------------------------------------------------------------
# # Install perl modules from cpanfile
# # --------------------------------------------------------------------
# if [[ $GENIE_LANG_PERL_CPANFILE_ENABLED && -e /genie/opt/perl/cpanfile ]]; then
#   mkdir -p /genie/opt/perl
#   # -- tar restore
#   mkdir -p /perl/cpanfile-modules
#   tarfile="/genie/opt/perl/cpanfile-modules.tar"
#   if [ -e $tarfile ]; then
#     tar xf $tarfile -C /perl/cpanfile-modules
#   fi
#   # -- install
#   cd /genie/opt/perl/
#   carton install --path=/perl/cpanfile-modules/
#   cd /perl/cpanfile-modules
#   tar cf $tarfile ./
#   echo 'cpanfile setup done.' >> /var/log/entrypoint.log
# fi

# --------------------------------------------------------------------
# php setup
# --------------------------------------------------------------------
phpini=/etc/php.ini
if [[ $GENIE_LANG_PHP_PHPENV_IMAGE != '' ]]; then
	echo 'export PATH="$PATH:$PHPENV_ROOT/versions/${GENIE_LANG_PHP_PHPENV_VERSION}/bin"' >> ~/.bashrc
	. ~/.bashrc
	phpenv global $GENIE_LANG_PHP_PHPENV_VERSION
	phpenv rehash
	\cp -f $PHPENV_ROOT/versions/$GENIE_LANG_PHP_PHPENV_VERSION/httpd_modules/*.so /etc/httpd/modules/
	phpini=$PHPENV_ROOT/versions/$GENIE_LANG_PHP_PHPENV_VERSION/etc/php.ini
  # -- php7 config
  if expr $GENIE_LANG_PHP_PHPENV_VERSION : "^7" > /dev/null; then
    sed -i "s/LoadModule\ php5_module\ modules\/libphp5.so/LoadModule\ php7_module\ modules\/libphp7.so/" /etc/httpd/conf.modules.d/10-php.conf
  fi
fi
if [[ $GENIE_LANG_PHP_ERROR_REPORT == 1 ]]; then
	sed -i "s/^display_errors\ \=\ Off/display_errors\ \=\ On/" $phpini
fi
if [[ $GENIE_LANG_PHP_TIMEZONE != '' ]]; then
	echo "[Date]\ndate.timezone = \"$GENIE_LANG_PHP_TIMEZONE\"" >> $phpini
fi
echo 'PHP setup done.' >> /var/log/entrypoint.log

# # --------------------------------------------------------------------
# # ruby setup
# # --------------------------------------------------------------------
# if [[ $GENIE_LANG_RUBY_VERSION != '' ]]; then
#   mkdir -p /genie/opt/ruby
#   # -- tar restore
#   mkdir -p /ruby/versions
#   tarfile="/genie/opt/ruby/versions.tar"
#   if [ -e $tarfile ]; then
#     tar xf $tarfile -C /ruby/versions
#   fi
#   # -- install
#   install_path="/ruby/versions/$GENIE_LANG_RUBY_VERSION/"
#   link_to="/root/.anyenv/envs/rbenv/versions/$GENIE_LANG_RUBY_VERSION"
#   if [[ ! -e ${install_path} ]]; then
#     # -- ruby install
#     /root/.anyenv/envs/rbenv/plugins/ruby-build/bin/ruby-build $GENIE_LANG_RUBY_VERSION ${install_path}
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/rbenv/bin/rbenv global $GENIE_LANG_RUBY_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/rbenv/bin/rbenv rehash
#     cd /ruby/versions
#     tar cf /genie/opt/ruby/versions.tar ./
#   else
#     # -- ruby relink
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/rbenv/bin/rbenv global $GENIE_LANG_RUBY_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/rbenv/bin/rbenv rehash
#   fi
#   echo 'Ruby setup done.' >> /var/log/entrypoint.log
# fi

# # --------------------------------------------------------------------
# # Node.js setup
# # --------------------------------------------------------------------
# if [[ $GENIE_LANG_NODE_VERSION != '' ]]; then
#   mkdir -p /genie/opt/node
#   # -- tar restore
#   mkdir -p /node/versions
#   tarfile="/genie/opt/node/versions.tar"
#   if [ -e $tarfile ]; then
#     tar xf $tarfile -C /node/versions
#   fi
#   # -- install
#   install_path="/node/versions/$GENIE_LANG_NODE_VERSION/"
#   link_to="/root/.anyenv/envs/ndenv/versions/$GENIE_LANG_NODE_VERSION"
#   if [[ ! -e ${install_path} ]]; then
#     # -- node install
#     /root/.anyenv/envs/ndenv/plugins/node-build/bin/node-build $GENIE_LANG_NODE_VERSION ${install_path}
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/ndenv/bin/ndenv global $GENIE_LANG_NODE_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/ndenv/bin/ndenv rehash
#     cd /node/versions
#     tar cf /genie/opt/node/versions.tar ./
#   else
#     # -- node relink
#     ln -s ${install_path} ${link_to}
#     source ~/.bashrc && /root/.anyenv/envs/ndenv/bin/ndenv global $GENIE_LANG_NODE_VERSION
#     source ~/.bashrc && /root/.anyenv/envs/ndenv/bin/ndenv rehash
#   fi
#   echo 'Node.js setup done.' >> /var/log/entrypoint.log
# fi

# --------------------------------------------------------------------
# Apache
# --------------------------------------------------------------------
if [[ $GENIE_HTTP_APACHE_ENABLED ]]; then
#   passenv_string=`set | grep -i '^GENIE_' | perl -pe 'while(<>){ chomp; $_=~ /([^\=]+)/; print "$1 "; }'`
#   sed -i "/<__PASSENV__>/,/<\/__PASSENV__>/c\
# \ \ # <__PASSENV__>\n\
#   PassEnv $passenv_string\n\
#   # </__PASSENV__>" /etc/apache2/httpd.conf
#   sed -i "s/DocumentRoot \"\/var\/www\/localhost\/htdocs\"/DocumentRoot \"\/var\/www\/html\"/" /etc/apache2/httpd.conf
#   sed -i "s/ScriptAlias \/cgi\-bin\//#ScriptAlias \/cgi\-bin\//" /etc/apache2/httpd.conf
  if [[ $GENIE_HTTP_APACHE_NO_LOG_REGEX ]]; then
    sed -i "s/CustomLog logs\/access.log combined/CustomLog logs\/access.log combined env\=\!nolog/" /etc/apache2/httpd.conf
    echo "SetEnvIfNoCase Request_URI \"$GENIE_HTTP_APACHE_NO_LOG_REGEX\" nolog" >> /etc/apache2/httpd.conf
  fi
  if [[ $GENIE_HTTP_APACHE_REAL_IP_LOG_ENABLED ]]; then
    sed -i "s/\%h /\%\{X-Forwarded-For\}i /g" /etc/apache2/httpd.conf
  fi
  /usr/sbin/httpd
  echo 'Apache setup done.' >> /var/log/entrypoint.log
fi

# --------------------------------------------------------------------
# Nginx
# --------------------------------------------------------------------
if [[ $GENIE_HTTP_NGINX_ENABLED ]]; then
  if [[ $GENIE_HTTP_NGINX_HTTP_PORT ]]; then
    sed -i "s/80 default_server/$GENIE_HTTP_NGINX_HTTP_PORT default_server/" /etc/nginx/nginx.conf
  fi
  /usr/sbin/nginx
  echo 'Nginx setup done.' >> /var/log/entrypoint.log
fi

# --------------------------------------------------------------------
# Postfix
# --------------------------------------------------------------------
if [[ $GENIE_MAIL_POSTFIX_ENABLED ]]; then
  sed -i 's/inet_protocols = all/inet_protocols = ipv4/g' /etc/postfix/main.cf
  if [[ $GENIE_POSTFIX_FORCE_ENVELOPE != '' ]]; then
    echo "canonical_classes = envelope_sender, envelope_recipient" >> /etc/postfix/main.cf
    echo "canonical_maps = regexp:/etc/postfix/canonical.regexp" >> /etc/postfix/main.cf
    echo "/^.+$/ $GENIE_POSTFIX_FORCE_ENVELOPE" >> /etc/postfix/canonical.regexp
  fi
  /usr/sbin/postfix start
  echo 'Postfix setup done.' >> /var/log/entrypoint.log
fi

# --------------------------------------------------------------------
# MailDev
# --------------------------------------------------------------------
if [[ $GENIE_MAIL_MAILDEV_ENABLED ]]; then
  maildev -s 25 -w 9981 $GENIE_MAIL_MAILDEV_OPTION_STRING &
fi

# --------------------------------------------------------------------
# Fluentd
# --------------------------------------------------------------------
if [[ $GENIE_LOG_FLUENTD_ENABLED ]]; then
  td-agent --config=$GENIE_LOG_FLUENTD_CONFIG_FILE &
fi

# --------------------------------------------------------------------
# Copy directories other than /opt/
# --------------------------------------------------------------------
rsync -rltD --exclude /opt /genie/* /
if [[ -d /genie/etc/httpd ]]; then
  if [[ $GENIE_HTTP_APACHE_ENABLED ]]; then
    /usr/sbin/httpd -k restart
  fi
fi
if [[ -d /genie/etc/postfix ]]; then
  if [[ $GENIE_MAIL_POSTFIX_ENABLED ]]; then
    /usr/sbin/postfix reload
  fi
fi
if [[ -d /genie/etc/nginx ]]; then
  if [[ $GENIE_HTTP_NGINX_ENABLED ]]; then
    /usr/sbin/nginx -s reload
  fi
fi

# --------------------------------------------------------------------
# entrypoint.sh finished
# --------------------------------------------------------------------
echo 'entrypoint.sh setup done.' >> /var/log/entrypoint.log

# --------------------------------------------------------------------
# run init.sh
# --------------------------------------------------------------------
/genie/opt/init.sh
echo 'init.sh setup done.' >> /var/log/entrypoint.log

# --------------------------------------------------------------------
# daemon loop start
# --------------------------------------------------------------------
/loop.sh
