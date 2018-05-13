#!/bin/bash
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.  https://stedolan.github.io/jq/download/' >&2
  exit 1
fi


git clone https://github.com/ampretia/commercial-paper-starter-kit.git
npm install

export NODE_CONFIG=$(cat /home/matthew/github/cp-network-sk/nodeconfig.json)
gulp bootstrap

gulp 