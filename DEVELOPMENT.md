#

`npm run` standard scripts

- `npm install`
- `npm test`
- `npm start`  -- runs the application locally
- `npm run build:dev` -- developer build, including live reload if available
- `npm run build:prod` -- production build ahead of publishing
- `npm run deploy` -- deploy to primary destination

# Initial Setup

docker network create cp-network

- Choose the card store to use for the Fabric Ledger
  - Local filesystem
```
$ export NODE_CONFIG=$(gulp --silent cardstore:fs)
```
  - REDIS

- Start up the Fabric

```
$ gulp fabric:start
```
  - that will create the PeerAdmin card in the wallet as specified by node config - spot the name of the card it prints out for 'PeerAdmin'

Need to deploy the smart contract to Fabric; depending on the fabric deployment (simulated, local or cloud) the initialy created
card that has power to deploy networks will have different names - so that other scripts can handle this correctly set a local varaible.
If using docker compose need to be careful about the hostnames of the cards. Would recommend not using localhost as this can creep in
and will work locally, giving a false sense of security. Deployment then goes a bit wrong. 

```
$ export FABRIC_LEDGER_CARD=<name>
$ export HL_COMPOSER_CLI=$(npm bin)/composer

```

We need to do the initial deploy, and then bootstrap data into it

```
$ gulp contract:deploy 
$ gulp contract:bootstrap
```

npx composer network reset --card admin@commercial-paper-network

We now have the Fabric setup with the Smart Contract. Now we need an application setup to use iet. 

Can bring them all up via docker-compose script. 



## contracts
This has a single smart contract in the form of a Composer Business Network.

`npm install` - purely for the setup
`npm test`
`npm run build:dev` && `npm run build:prod` synonymous - and package up the BNA with an autoincrement of versions
`npm run deploy` will do the start and install of the network - requries the peeradmin (or equivalant card), and defined cardstore as
NODE_CONFIG

## apps

### commerical-financing-webui


### paper-trading-webui

Audience: for traders in commerical paper

