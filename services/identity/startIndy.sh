#!/bin/bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"
docker-compose -f "${DIR}"/getting-started/docker-compose.yml up

# this will start up a local Indy pool
