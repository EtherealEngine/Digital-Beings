FROM nikolaik/python-nodejs:python3.8-nodejs16

# Create app directory
WORKDIR /digitalbeing

RUN apt-get install -y supervisor

# to make use of caching, copy only package files and install dependencies
COPY package.json .