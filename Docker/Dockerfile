# base image
FROM node:13.8.0 as build

#needed by npm
RUN apt update && apt install -y apache2 git dumb-init

#Apache modules for reverse proxying
RUN a2enmod proxy proxy_http proxy_wstunnel rewrite

# set working directory
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


#contains proxying config
COPY ./Docker/000-default.conf /etc/apache2/sites-available/000-default.conf

# log errors to stderr
#RUN sed "s\ErrorLog.*\ErrorLog /dev/stdout\g" /etc/apache2/apache2.conf -i

#log transfers to stdout
#RUN sed "s\TransferLog.*\TransferLog /dev/stdout\g" /etc/apache2/apache2.conf -i

# start app
# dumb-init rewrites signals, so you can kill the container using ctrl-c
CMD ["dumb-init","sh","./buildAndRun.sh"]