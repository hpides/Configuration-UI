# base image
FROM node:13.8.0-alpine as build

#needed by npm
RUN apk add git
# set working directory
WORKDIR /app

# add `/app/node_modules/.bin` to $PATH
ENV PATH /app/node_modules/.bin:$PATHff

# install and cache app dependencies
#copy only package*.jsons so this step does not have to be repeated for every build
COPY package*.json ./
RUN npm install
RUN npm install react-scripts -g
COPY . .
# start app
CMD ["npm", "start"]