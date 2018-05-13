#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"


echo Commercial Paper Network
cd "${DIR}"/contracts/commercial-paper-network
npm install

echo Command line apps
cd "${DIR}"/apps/cp-cli
npm install

echo Commercial Paper Web UI
cd "${DIR}"/apps/aai-web
npm install

echo DID-manger
cd "${DIR}"/apps/did-manager
npm install

echo Angular2 generated app 
cd "${DIR}"/apps/ami-web/ami-web
npm install



