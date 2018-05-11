#!/bin/bash
# Grab the parent (root) directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
echo "${DIR}/.localtoolchain/fabric-tools"
if [[ -d "${DIR}/.localtoolchain/fabric-tools" && ! -L "${DIR}/.localtoolchain/fabric-tools" ]] ; then
    echo "Fabric tools already present"
else    

  # For simple cases these 'fabric-dev-servers' scripts create the simplest possible Hyperleder Fabric setup
  mkdir -p ${DIR}/.localtoolchain/fabric-tools
  cd ${DIR}/.localtoolchain/
  curl -O https://raw.githubusercontent.com/hyperledger/composer-tools/master/packages/fabric-dev-servers/fabric-dev-servers.zip
  unzip -q fabric-dev-servers.zip -d fabric-tools 
  cd -
fi


export HL_FABRIC_VERSION=hlfv11 
export HL_COMPOSER_CLI="${DIR}"/node_modules/.bin/composer

rm -rf "${DIR}/_local/"
mkdir -p "${DIR}/_local/"

export NODE_CONFIG=$(jq .composer.wallet.options.storePath=\"${DIR}/_local/composer-store\" ${DIR}/.localtoolchain/cardstore-dir.json)          
echo $NODE_CONFIG

# These two scrtips firstly start the Fabric, and create a Peer Admin network card
(docker kill $(docker ps -q) && docker rm $(docker ps -qa) --force) || true
docker rmi $(docker images 'dev-*' -q) || true

"${DIR}"/.localtoolchain/fabric-tools/startFabric.sh
"${DIR}"/.localtoolchain/fabric-tools/createPeerAdminCard.sh

