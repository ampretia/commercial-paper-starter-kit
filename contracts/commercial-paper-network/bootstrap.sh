#!/bin/bash
# Grab the parent (root) directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"

node "${DIR}"/loadAssets.js

#ADMIN_CARD=admin@local
ADMIN_CARD=admin@commercial-paper-network
SUFFIX=${BLOCKCHAIN_NETWORK_CARD#*@}
if [ -z "${SUFFIX} "]; then
  SUFFIX=local
fi

npx composer identity issue --card "${ADMIN_CARD}" -u AAI -a org.example.commercialpaper.Company#AAI --file "${DIR}"/AAI@commercial-paper-network.card
npx composer card import --file "${DIR}"/AAI@commercial-paper-network.card --card AAI@${SUFFIX}
npx composer network ping --card AAI@${SUFFIX}

npx composer identity issue --card "${ADMIN_CARD}" -u BAH -a org.example.commercialpaper.Company#BAH --file "${DIR}"/BAH@commercial-paper-network.card
npx composer card import --file "${DIR}"/BAH@commercial-paper-network.card --card BAH@${SUFFIX}
npx composer network ping --card BAH@${SUFFIX}

npx composer identity issue --card "${ADMIN_CARD}" -u AMI -a org.example.commercialpaper.Company#AMI --file "${DIR}"/AMI@commercial-paper-network.card
npx composer card import --file "${DIR}"/AMI@commercial-paper-network.card --card AMI@${SUFFIX}
npx composer network ping --card AMI@${SUFFIX}