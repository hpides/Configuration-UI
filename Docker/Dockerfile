# base image
FROM node:13.8.0-alpine as build

#needed by npm
RUN apk add apache2 git dumb-init

# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATH

# install and cache app dependencies
#copy only package*.jsons so this step does not have to be repeated for every build
COPY package*.json ./
RUN npm install
RUN npm install react-scripts -g
COPY . .
# start app
# dumb-init rewrites signals, so you can kill the container using ctrl-c
CMD ["dumb-init","sh","./buildAndRun.sh"]