#!/bin/bash
# Grab the parent (root) directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"

export PEERADMIN=PeerAdmin@hlfv1
#export PEERADMIN=admin@proxy
export HL_COMPOSER_CLI=composer

export BNA_FILE="${DIR}"/contracts/*.bna

${HL_COMPOSER_CLI} --version

export NETWORK_NAME=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Name/ { print $2 }')
export NETWORK_VERSION=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Version/ { print $2 }')
${HL_COMPOSER_CLI} network install --card ${PEERADMIN} --archiveFile ${BNA_FILE} 
${HL_COMPOSER_CLI} network start  --card ${PEERADMIN}  -A admin -S adminpw  --file "${DIR}"/admin.card --networkName ${NETWORK_NAME} --networkVersion ${NETWORK_VERSION}
${HL_COMPOSER_CLI} card import --file "${DIR}"/admin.card --card admin@local

${HL_COMPOSER_CLI} network list --card admin@local