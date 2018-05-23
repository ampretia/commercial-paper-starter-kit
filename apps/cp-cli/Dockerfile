FROM node:carbon

# Reset npm logging to default level.
ENV NPM_CONFIG_LOGLEVEL warn

# Make the working directory and copy the application across into it
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .

# npm install to set everything up. 

RUN npm install && \
    npm cache clean --force
   
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.1/dumb-init_1.2.1_amd64
RUN chmod +x /usr/local/bin/dumb-init


ENTRYPOINT ["/usr/local/bin/dumb-init"]
CMD ["/bin/bash"]
# CMD ["node","cli.js"]