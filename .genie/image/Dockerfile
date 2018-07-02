FROM alpine
LABEL maintainer "kazaoki lab."

# Set timezone
# --------------------------------------------------------------------------------------------------
RUN apk --update add tzdata && \
    cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime && \
    apk del tzdata && \
    rm -rf /var/cache/apk/*

# Add packages
# --------------------------------------------------------------------------------------------------
RUN apk --update add \
    bash git tar curl lftp nodejs ca-certificates shadow nginx openssh-server logrotate multitail sudo \
    php7 php7-sqlite3 php7-mysqlnd php7-gd php7-imagick php7-mailparse php7-pdo php7-phar php7-pgsql php7-mysqli php7-mcrypt php7-json php7-ftp php7-session php7-mbstring php7-ctype \
    apache2 apache2-ssl php7-apache2 \
    perl perl-libwww perl-dbi perl-dbd-pg perl-dbd-mysql perl-dbd-sqlite perl-carp perl-cgi perl-cgi-fast perl-net-ssleay perl-gd \
    ruby ruby-irb && \
    rm -rf /var/cache/apk/*

# bash run
# --------------------------------------------------------------------------------------------------
ADD bashrc /etc/bashrc
RUN bash

# Install anyenv
# --------------------------------------------------------------------------------------------------
ENV PATH /root/.anyenv/bin:$PATH
RUN git clone https://github.com/riywo/anyenv ~/.anyenv \
    && echo 'export PATH="$HOME/.anyenv/bin:$PATH"' >> ~/.bashrc \
    && echo 'eval "$(anyenv init -)"' >> ~/.bashrc \
    && . ~/.bashrc \
    && anyenv install rbenv \
    && anyenv install plenv \
    && anyenv install phpenv \
    && anyenv install ndenv \
    && . ~/.bashrc

# Setup default PHP
# --------------------------------------------------------------------------------------------------
RUN ln -s /etc/php7/php.ini /etc/php.ini && \
    sed -i 's/\;date\.timezone\ \=/date\.timezone\ \=\ Asia\/Tokyo/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.language\ \=\ Japanese/mbstring\.language\ \=\ Japanese/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.internal_encoding\ \=/mbstring\.internal_encoding\ \=\ UTF-8/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.http_input\ \=/mbstring\.http_input\ \=\ pass/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.http_output\ \=/mbstring\.http_output\ \=\ pass/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.encoding_translation\ \=\ Off/mbstring\.encoding_translation\ \=\ Off/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.detect_order\ \=\ auto/mbstring\.detect_order\ \=\ UTF-8\,SJIS\,EUC-JP\,JIS\,ASCII/g' /etc/php.ini \
    && sed -i 's/\;mbstring\.func_overload\ \=\ 0/mbstring\.func_overload\ \=\ 0/g' /etc/php.ini

# Setup Apache
# --------------------------------------------------------------------------------------------------
RUN sed -i 's/\#AddHandler\ cgi\-script\ \.cgi/AddHandler\ cgi\-script\ \.cgi/g' /etc/apache2/httpd.conf \
    && sed -i 's/#LoadModule cgi_module modules\/mod_cgi.so/LoadModule cgi_module modules\/mod_cgi.so/' /etc/apache2/httpd.conf \
    && sed -i 's/AddDefaultCharset\ UTF\-8/AddDefaultCharset\ Off/g' /etc/apache2/httpd.conf \
    && sed -i 's/^User apache$/User docker/' /etc/apache2/httpd.conf \
    && sed -i 's/^Group apache$/Group docker/' /etc/apache2/httpd.conf \
    && sed -i 's/DocumentRoot "\/var\/www\/localhost\/htdocs"/DocumentRoot "\/var\/www\/html"/' /etc/apache2/httpd.conf \
    && sed -i 's/ScriptAlias \/cgi\-bin\//#ScriptAlias \/cgi\-bin\//' /etc/apache2/httpd.conf \
    && sed -i 's/\#ServerName www\.example\.com\:80/ServerName genie/g' /etc/apache2/httpd.conf \
    && sed -i 's/^Listen 80/Listen 0.0.0.0:80/g' /etc/apache2/httpd.conf \
    && echo '<Directory /var/www/html>' >> /etc/apache2/httpd.conf \
    && echo '  Options FollowSymLinks ExecCGI' >> /etc/apache2/httpd.conf \
    && echo '  AllowOverride All' >> /etc/apache2/httpd.conf \
    && echo '  Require all granted' >> /etc/apache2/httpd.conf \
    && echo '  DirectoryIndex index.cgi index.php index.html index.htm' >> /etc/apache2/httpd.conf \
    && echo '  SetEnv PERL5LIB /perl/cpanfile-modules/lib/perl5' >> /etc/apache2/httpd.conf \
    && echo '  EnableMMAP Off' >> /etc/apache2/httpd.conf \
    && echo '  EnableSendfile Off' >> /etc/apache2/httpd.conf \
    && echo '  # <__PASSENV__>' >> /etc/apache2/httpd.conf \
    && echo '  # </__PASSENV__>' >> /etc/apache2/httpd.conf \
    && echo '</Directory>' >> /etc/apache2/httpd.conf \
	&& mkdir /run/apache2/

# # Install ngrok
# # --------------------------------------------------------------------------------------------------
# RUN mkdir /tmp/ngrok/ \
#     && cd /tmp/ngrok/ \
#     && curl -L -O https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip \
#     && unzip ngrok-stable-linux-amd64.zip \
#     && mv ngrok /usr/local/bin \
#     && rm -fr /tmp/ngrok/ \
#     && cd

# # Install suPHP
# # --------------------------------------------------------------------------------------------------
# ADD suphp-0.7.2-1.src.rpm /tmp/suphp/suphp-0.7.2-1.src.rpm
# RUN cd /tmp/suphp/ \
#     && rpm -ivh suphp-0.7.2-1.src.rpm \
#     && rpmbuild -ba /root/rpmbuild/SPECS/suphp.spec \
#     && rpm -ivh /root/rpmbuild/RPMS/x86_64/suphp-0.7.2-1.x86_64.rpm \
#     && echo 'IncludeOptional /etc/apache2/conf/extra/httpd-suphp.conf' >> /etc/apache2/httpd.conf

# # Install Fluentd
# # --------------------------------------------------------------------------------------------------
# RUN apk add --no-cache --virtual .build-deps build-base ruby-dev gnupg \
#     && update-ca-certificates \
#     && echo 'gem: --no-document' >> /etc/gemrc \
#     && gem install oj -v 2.18.3 \
#     && gem install json -v 2.1.0 \
#     && gem install fluentd -v 0.12.43 \
# 	&& fluent-gem install fluent-plugin-elasticsearch \
#     && apk del .build-deps \
#     && rm -rf /var/cache/apk/* \
#     && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem

# Node.js config
# --------------------------------------------------------------------------------------------------
RUN echo '{ "allow_root": true }' > /root/.bowerrc \
    && npm install bower maildev -g

# Install box
# --------------------------------------------------------------------------------------------------
RUN cd /tmp \
    && curl -LSs https://box-project.github.io/box2/installer.php | php \
    && mv box.phar /usr/bin/box \
    && chmod +x /usr/bin/box \
    && sed -i "s/;phar.readonly = On/phar.readonly = Off/" /etc/php.ini

# Add files
# ---------
ADD loop.sh /loop.sh
ADD entrypoint.sh /entrypoint.sh
RUN chmod +x /*.sh

# Add docker user
# ---------------
RUN groupadd -g 1000 docker \
    && useradd -g docker -m -s /bin/bash docker \
    && usermod -aG apache,nginx docker

# Entry point
# -----------
ENTRYPOINT /entrypoint.sh
