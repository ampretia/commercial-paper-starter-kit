#!/bin/bash
# Grab the parent (root) directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

export PEERADMIN=PeerAdmin@hlfv1
#export PEERADMIN=admin@proxy
export HL_COMPOSER_CLI="${DIR}"/node_modules/.bin/composer

export NODE_CONFIG=$(jq .composer.wallet.options.storePath=\"${DIR}/_local/composer-store\" ${DIR}/.localtoolchain/cardstore-dir.json)          
echo $NODE_CONFIG


cd "${DIR}"/contracts/commercial-paper-network
npm version patch
npm run dist
cd -

export BNA_FILE="${DIR}"/contracts/commercial-paper-network/dist/*.bna

${HL_COMPOSER_CLI} --version

export NETWORK_NAME=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Name/ { print $2 }')
export NETWORK_VERSION=$( ${HL_COMPOSER_CLI} archive list -a ${BNA_FILE} | awk -F: '/Version/ { print $2 }')
${HL_COMPOSER_CLI} network install --card ${PEERADMIN} --archiveFile ${BNA_FILE} 
${HL_COMPOSER_CLI} network start  --card ${PEERADMIN}  -A admin -S adminpw  --file "${DIR}"/_local/admin.card --networkName ${NETWORK_NAME} --networkVersion ${NETWORK_VERSION}
${HL_COMPOSER_CLI} card import --file "${DIR}"/_local/admin.card --card admin@local

# echo 'NODE_CONFIG should be set to '
# echo "export NODE_CONFIG='"$(echo $NODE_CONFIG)"'"

echo $NODE_CONFIG > "${DIR}"/nodeconfig.json

npx boxen --padding=1 '# Remember to set

 export NODE_CONFIG=$(cat '${DIR}'/nodeconfig.json)'