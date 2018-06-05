#!/bin/bash
set -v

## check any prerequs to ensure that everything is installed
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.  https://stedolan.github.io/jq/download/' >&2
  exit 1
fi

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"

rm -rf "${DIR}"/_localstore

OUTPUT=$(docker network create cp-stack-network --gateway 172.25.0.1 --subnet 172.25.0.0/16 2>&1 )
retVal=$?
if [ $retVal -ne 0 ]; then  
        if [[ "${OUTPUT}" = *"network with name cp-stack-network already exists"* ]]
        then
                echo Network already exists
        else
                echo failed to start docket network ${OUTPUT}
                exit 1
        fi
fi
export NODE_CONFIG=$(gulp cardstore:fs --silent)

gulp fabric:provision
gulp fabric:card

export BLOCKCHAIN_NETWORK_CARD=PeerAdmin@hlfv1
export HL_COMPOSER_CLI=$(npm bin)/composer

gulp contract:deploy
gulp contract:bootstrap

# Open the playground in a web browser.
# URLS="http://localhost:3000 http://localhost:6002/"
# case "$(uname)" in
# "Darwin") open ${URLS}
#           ;;
# "Linux")  if [ -n "$BROWSER" ] ; then
# 	       	        $BROWSER $URLS
# 	        elif    which x-www-browser > /dev/null ; then
#                   nohup x-www-browser ${URLS} < /dev/null > /dev/null 2>&1 &
#           elif    which xdg-open > /dev/null ; then
#                   for URL in ${URLS} ; do
#                           xdg-open ${URL}
# 	                done
#           elif  	which gnome-open > /dev/null ; then
# 	                gnome-open $URLS
# 	        else
#     	            echo "Could not detect web browser to use - please launch Composer Playground URL using your chosen browser ie: <browser executable name> http://localhost:8080 or set your BROWSER variable to the browser launcher in your PATH"
# 	        fi
#           ;;
# *)        echo "Playground not launched - this OS is currently not supported "
#           ;;
# esac