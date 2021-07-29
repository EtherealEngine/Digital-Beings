FROM python:3.8

# update the repository sources list
# and install dependencies
RUN apt-get update \
    && apt-get install -y curl \
    && apt-get -y autoclean

# install node 16 and npm using nvm
ENV NVM_DIR /usr/local/nvm
RUN mkdir -p /usr/local/nvm/ && \
        curl --silent -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash 
RUN /bin/bash -c "source $NVM_DIR/nvm.sh \
    && nvm install 16.4.2"
ENV NODE_PATH $NVM_DIR/v$NODE_VERSION/lib/node_modules
ENV PATH $NVM_DIR/versions/node/v$NODE_VERSION/bin:$PATH

# Create app directory
WORKDIR /digitalbeing

# to make use of caching, copy only package files and install dependencies
COPY package.json .

COPY . .

# supervisor to run multiple processes
RUN apt install -y supervisor
# Run npm install
Run pip install -r requirements.txt

CMD ["supervisord","-c","/app/service_script.conf"]