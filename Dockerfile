FROM ubuntu:20.04

RUN apt-get update && \
    apt-get install --no-install-recommends -y \
    python3.8 python3-pip python3.8-dev

# install node 16 and npm using nvm
# replace shell with bash so we can source files
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# nvm environment variables
ENV NVM_DIR /usr/local/nvm
ENV NODE_VERSION 16.11.1

# install nvm
# https://github.com/creationix/nvm#install-script
RUN curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.2/install.sh | bash

# install node and npm LTS
RUN source $NVM_DIR/nvm.sh \
    && nvm install $NODE_VERSION \
    && nvm alias default $NODE_VERSION \
    && nvm use default \
    && nvm install 16.4.2 \
    && nvm use 16.4.2

# add node and npm to path so the commands are available
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

RUN npm install --global yarn

RUN yarn add global "@types/node"
RUN yarn add global "typescript"
RUN yarn add global ts-node


# Create app directory
WORKDIR /DigitalBeing

# to make use of caching, copy only package and pip requirement files and install dependencies
COPY package.json .
COPY requirements.txt .
COPY editor.sh .

RUN pip install -r requirements.txt --no-cache-dir

CMD ["sh", "./bootstrap.sh"]
