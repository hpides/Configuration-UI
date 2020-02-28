#!/bin/sh
npm run build
cp -r build/* /var/www/localhost/htdocs
/usr/sbin/httpd -D FOREGROUND