#!/bin/bash
set -e

# set the current directory and bring in fns from the pipeline-BLOCKCHAIN
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
source ${DIR}/.bluemix/pipeline-BLOCKCHAIN.sh

if [ -z "${BLOCKCHAIN_JSON}" ]; then
    BLOCKCHAIN_JSON="${DIR}"/blockchain.json
fi
        
if [ ! -f "${BLOCKCHAIN_JSON}" ]; then 
   echo blockchain.json file does not exist
   exit 1
fi

export BLOCKCHAIN_NETWORK_ID=$(jq --raw-output '.network_id' "${BLOCKCHAIN_JSON}")
export BLOCKCHAIN_KEY=$(jq --raw-output '.key' "${BLOCKCHAIN_JSON}")
export BLOCKCHAIN_SECRET=$(jq --raw-output '.secret' "${BLOCKCHAIN_JSON}")
export BLOCKCHAIN_URL=$(jq --raw-output '.url' "${BLOCKCHAIN_JSON}")
create_blockchain_network_card

# will need to use this node config for later operations
# Output the variables setup for later
env | grep BLOCKCHAIN | sed 's/^/export /'
env | grep BUSINESS | sed 's/^/export /'
