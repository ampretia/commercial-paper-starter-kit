#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/.." && pwd )"

cd "${DIR}"/contracts/commercial-paper-network
npm install

cd "${DIR}"/apps/cp-cli
npm install

cd "${DIR}"/apps/aai-web
npm install

cd "${DIR}"/apps/ami-web
npm install

cd "${DIR}"/apps/ami-web
npm install



