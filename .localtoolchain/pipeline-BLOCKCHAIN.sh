#!/bin/bash

set -ex

DIR=

# fabric

export BLOCKCHAIN_NETWORK_CARD=admin@blockchain-network


startFabric.sh
createPeerAdminCard.sh

# indy

docker-compose up indy