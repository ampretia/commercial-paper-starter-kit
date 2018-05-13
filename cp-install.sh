#!/bin/bash
if ! [ -x "$(command -v jq)" ]; then
  echo 'Error: jq is not installed.  https://stedolan.github.io/jq/download/' >&2
  exit 1
fi


DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )/." && pwd )"
git clone https://github.com/ampretia/commercial-paper-starter-kit.git 

cd commercial-paper-starter-kit
npm install

export NODE_CONFIG=$(cat ./nodeconfig.json)
npx gulp bootstrap
npx gulp startindy
npx gulp tradeapp
npx gulp didmanager


# Open the playground in a web browser.
URLS="http://localhost:3000 http://localhost:6002/"
case "$(uname)" in
"Darwin") open ${URLS}
          ;;
"Linux")  if [ -n "$BROWSER" ] ; then
	       	        $BROWSER $URLS
	        elif    which x-www-browser > /dev/null ; then
                  nohup x-www-browser ${URLS} < /dev/null > /dev/null 2>&1 &
          elif    which xdg-open > /dev/null ; then
                  for URL in ${URLS} ; do
                          xdg-open ${URL}
	                done
          elif  	which gnome-open > /dev/null ; then
	                gnome-open $URLS
	        else
    	            echo "Could not detect web browser to use - please launch Composer Playground URL using your chosen browser ie: <browser executable name> http://localhost:8080 or set your BROWSER variable to the browser launcher in your PATH"
	        fi
          ;;
*)        echo "Playground not launched - this OS is currently not supported "
          ;;
esac