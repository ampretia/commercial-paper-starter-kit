#!/bin/bash
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"
cd "${DIR}" && npm start 1>"${DIR}"/output.log 2>&1 &