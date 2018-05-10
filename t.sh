export DIR=.
export NODE_CONFIG='{ "composer": { "wallet": { "type": "composer-wallet-filesystem",  
                   "options": { "storePath": "/home/matthew/github/cp-network-sk/_local/composer-store" } } } }'
echo $NODE_CONFIG > "${DIR}"/nodeconfig.json

npx boxen --padding=1 'export NODE_CONFIG=$(cat '${DIR}'/nodeconfig.json)'