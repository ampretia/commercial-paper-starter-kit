#!/bin/bash

# start the LDAP server
PM2_HOME=.pm2 pm2 start --wait-ready ldap.js
#    "stop_ldap": "

export COMPOSER_PROVIDERS=$(jq .ldap.server.url=\"ldap://localhost:$(cat ldap.port)\" ./COMPOSER_PROVIDERS.json)   
export COMPOSER_DATASOURCES=$(cat COMPOSER_DATASOURCES.json)


# mongo start up
(docker rm -f mongo || true) && docker run -d --name mongo -p 27017:27017 mongo
PM2_HOME=.pm2 pm2 start --wait-ready npx composer-rest-server --card admin@local -m -n required

