FROM hyperledger/composer-cli
USER root
RUN apk add --no-cache bash && apk add --no-cache bash-completion

RUN mkdir -p /home/composer/contracts
COPY ./dist/commercial-paper-network.bna /home/composer/contracts
COPY ./data.json /home/composer/data.json
COPY ./loadAssets.js /home/composer/loadAssets.js
COPY ./bootstrap.sh /home/composer/bootstrap.sh
COPY ./start-network.sh /home/composer/start-network.sh

RUN npm install --production -g composer-wallet-redis
ENV NODE_CONFIG='{ "composer": { "wallet": {"type": "composer-wallet-redis","desc": "Uses a local redis instance", "options":{"host":"composer-wallet-redis"} }  } }'

# map a volume here to pass in the PeerAdmin card to import
# will need to map the profile.json updates. 

ENTRYPOINT ["/bin/bash"]