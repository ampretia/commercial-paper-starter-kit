#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"
cd "${DIR}"/contracts/commercial-paper-network
npm run dist
cd -

export PATH="${DIR}/node_modules/.bin":$PATH
source "${DIR}"/.bluemix/pipeline-DEPLOY.sh
deploy_contracts

