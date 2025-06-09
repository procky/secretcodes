FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json yarn.lock ./

COPY . .

# Not running yarn install here.
# The image will be built with the source code and package definitions,
# but dependencies will be installed via a make command into a mounted volume.
