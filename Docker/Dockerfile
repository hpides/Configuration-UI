# base image
FROM node:13.8.0-alpine as build

#needed by npm
RUN apk add git python g++ make

WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
#copy only package*.jsons so this step does not have to be repeated for every build
COPY package*.json ./

#build and run dependencies
RUN npm install

RUN npm install react-scripts -g

COPY . .

#creates a static asset containing all html, css, javascript that can be served by a simple webserver
RUN npm run build

FROM alpine:3

#Apache modules for reverse proxying come as separate packages
#alpine does not have a2enmod, but there are additional packages for mods
RUN apk add apache2 apache2-proxy

#this comes by default, needs to enabled manually; other modules are enabled by package installer
RUN echo "LoadModule rewrite_module modules/mod_rewrite.so" >> /etc/apache2/httpd.conf

RUN echo "include /etc/apache2/000-default.conf" >> /etc/apache2/httpd.conf

WORKDIR /app

COPY --from=build /app/build/ /var/www/localhost/htdocs

#contains proxying config
COPY ./Docker/000-default.conf  /etc/apache2/000-default.conf
#blocking call, so container terminates if and only if apache terminates; also logs access and error log to stdout and stderr respetively
CMD ["httpd", "-DFOREGROUND"]
