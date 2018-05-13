#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"
docker-compose -f "${DIR}"/getting-started/docker-compose.yml up 1>"${DIR}"/indy.log 2>&1 &

# this will start up a local Indy pool
