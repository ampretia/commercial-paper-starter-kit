#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "${DIR}"/contracts/commercial-paper-network
npm version patch
npm run dist
cd -


export BNA_FILE="${DIR}"/contracts/commercial-paper-network/dist/commercial-paper-network.bna

NETWORK_NAME=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Name/ { print $2 }')
NETWORK_VERSION=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Version/ { print $2 }')
${HL_COMPOSER_CLI} network install --card ${FABRIC_LEDGER_CARD} --archiveFile ${BNA_FILE} 

op="$(${HL_COMPOSER_CLI} network upgrade --card ${FABRIC_LEDGER_CARD} --networkName ${NETWORK_NAME} --networkVersion ${NETWORK_VERSION} 2>&1 )"
if [ $? -ne 0 ]; then
    if [[ "${op}" =~ "could not find chaincode" ]]; then
       echo "Need to start"
       "${HL_COMPOSER_CLI}" network start --card ${FABRIC_LEDGER_CARD}  -A admin -S adminpw  --file "${DIR}"/admin.card --networkName ${NETWORK_NAME} --networkVersion ${NETWORK_VERSION}
       "${HL_COMPOSER_CLI}" card import --file "${DIR}"/admin.card
       "${HL_COMPOSER_CLI}" card list       
    else 
       echo ${op}   
    fi
fi
