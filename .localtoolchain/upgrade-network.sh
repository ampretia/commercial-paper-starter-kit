#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "${DIR}"/contracts/commercial-paper-network
npm version patch
npm run dist
cd -

# export PEERADMIN=PeerAdmin@hlfv1
export PEERADMIN=admin@proxy

export HL_COMPOSER_CLI="${DIR}"/contracts/commercial-paper-network/node_modules/.bin/composer
export BNA_FILE="${DIR}"/contracts/commercial-paper-network/dist/commercial-paper-network.bna
docker rmi $(docker images 'dev-*' -q) || true
NETWORK_NAME=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Name/ { print $2 }')
NETWORK_VERSION=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Version/ { print $2 }')
${HL_COMPOSER_CLI} network install --card ${PEERADMIN} --archiveFile ${BNA_FILE} 
${HL_COMPOSER_CLI} network upgrade --card ${PEERADMIN} --networkName ${NETWORK_NAME} --networkVersion ${NETWORK_VERSION}