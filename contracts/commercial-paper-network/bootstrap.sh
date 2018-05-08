#!/bin/bash
# Grab the parent (root) directory.
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"

node "${DIR}"/loadAssets.js


npx composer identity issue --card admin@local -u AAI -a org.example.commercialpaper.Company#AAI --file "${DIR}"/AAI@commercial-paper-network.card
npx composer card import --file "${DIR}"/AAI@commercial-paper-network.card --card AAI@local
npx composer network ping --card AAI@local

npx composer identity issue --card admin@local -u BAH -a org.example.commercialpaper.Company#BAH --file "${DIR}"/BAH@commercial-paper-network.card
npx composer card import --file "${DIR}"/BAH@commercial-paper-network.card --card BAH@local
npx composer network ping --card BAH@local 

npx composer identity issue --card admin@local -u AMI -a org.example.commercialpaper.Company#AMI --file "${DIR}"/AMI@commercial-paper-network.card
npx composer card import --file "${DIR}"/AMI@commercial-paper-network.card --card AMI@local
npx composer network ping --card AMI@local 