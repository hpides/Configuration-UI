#!/bin/sh
npm run build
cp -r build/* /var/www/html
apachectl -D FOREGROUND