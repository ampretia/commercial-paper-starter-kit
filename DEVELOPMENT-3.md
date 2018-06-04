# 'From soup to nuts'
## Stage 3 - Local Development

Everything is local within your machine; but using development versions of the real servers.

### Setup

0. *Clone*

Clone the repository and `npm install`

```
$ git clone https://github.com/ampretia/commercial-paper-starter-kit.git
$ cd commercial-paper-starter-kit && npm install
```

You can use the SSH approach to clone the repo should you wish. 

> You will need to have the 'jq' tool installed, and if you have gulp aready that's fine. If you don't have gulp it will be installed within this project. But remember to use `npx gulp` rather than just `gulp`

1. *Network*
We'll be running all the tools within docker containers, they all need to communicate so it has found
to be easier if we create a network ahead of time; in the docker-compose files we'll lock the services to defined
ip address, therefore create a newtork with a defined gateway

```
$  docker network create cp-stack-network --gateway 172.25.0.1 --subnet 172.25.0.0/16 
```

2. Hyperledger Composer Card Store
We need to chose a location to store the Composer Network Cards - these are the ids that are used to connect apps to the blockchain. 
Local filesystem is good for testing. Later on we'll migrate this to other solutions. 

All composer applications, and CLIs will pick up the location of the card store from the NODE_CONFIG environment variable

```
$ export NODE_CONFIG=$(gulp cardstore:fs --silent)
```

> Probably the single most important piece of configuration - if you open a new window make sure that this is set

Use `gulp env` to validate what is set

```
$ gulp env
[13:46:36] Using gulpfile ~/github/commercial-paper-starter-kit/gulpfile.js
[13:46:36] Starting 'env'...
Environment being used:

Composer - Wallet configuration
{
  type: "composer-wallet-filesystem",
  options: {
    storePath: "/home/matthew/github/commercial-paper-starter-kit/_localstore"
  }
}

Composer - Loggining configuration
None specified, will use default.


[13:46:36] Finished 'env' after 12 ms
```

3. Hyperledger Fabric
We need a blockchain - therefore we need to start up a Hyperledger Fabric instance

```
$ gulp fabric:provision
```

If you issue `docker ps` after this you'll see something like this

```
$ docker ps                                                                                                         
CONTAINER ID        IMAGE                                     COMMAND                  CREATED             STATUS              PORTS                                            NAMES
b9d5d2333bd1        hyperledger/fabric-peer:x86_64-1.1.0      "peer node start"        24 seconds ago      Up 22 seconds       0.0.0.0:7051->7051/tcp, 0.0.0.0:7053->7053/tcp   peer0.org1.example.com
a7ab22c64cc2        hyperledger/fabric-ca:x86_64-1.1.0        "sh -c 'fabric-ca-se…"   26 seconds ago      Up 25 seconds       0.0.0.0:7054->7054/tcp                           ca.org1.example.com
1d292c17d314        hyperledger/fabric-couchdb:x86_64-0.4.6   "tini -- /docker-ent…"   26 seconds ago      Up 25 seconds       4369/tcp, 9100/tcp, 0.0.0.0:5984->5984/tcp       couchdb
780f081f1e4a        hyperledger/fabric-orderer:x86_64-1.1.0   "orderer"                26 seconds ago      Up 24 seconds       0.0.0.0:7050->7050/tcp                           orderer.example.com
```

A single peer, single orderer and certificate authority are setup ready with CouchDb to handle queries on the worldstate.

Next we need to create the first of our Composer Network cards to represent the authority who can install smart contracts.

```
$ gulp fabric:card
```

That will create the PeerAdmin card in the wallet as specified by node config - spot the name of the card it prints out for 'PeerAdmin'

Need to deploy the smart contract to Fabric; depending on the fabric deployment (simulated, local or cloud) the initialy created card that has power to deploy networks will have different names - so that other scripts can handle this correctly set a local varaible. If using docker compose need to be careful about the hostnames of the cards. Would recommend not using localhost as this can creep in and will work locally, giving a false sense of security. Deployment then goes a bit wrong. 

```
$ export BLOCKCHAIN_NETWORK_CARD=PeerAdmin@hlfv1
$ export HL_COMPOSER_CLI=$(npm bin)/composer
```

We need to do the initial deploy, and then bootstrap data into it

```
$ gulp contract:deploy 
$ gulp contract:bootstrap
```

We now have data within the ledger; the Composer CLI is available, so lets look at the network cards that we have in place. 

```
$ npx composer card list
The following Business Network Cards are available:

Connection Profile: hlfv1
┌────────────────────────────────┬───────────┬──────────────────────────┐
│ Card Name                      │ UserId    │ Business Network         │
├────────────────────────────────┼───────────┼──────────────────────────┤
│ AAI@local                      │ AAI       │ commercial-paper-network │
├────────────────────────────────┼───────────┼──────────────────────────┤
│ BAH@local                      │ BAH       │ commercial-paper-network │
├────────────────────────────────┼───────────┼──────────────────────────┤
│ AMI@local                      │ AMI       │ commercial-paper-network │
├────────────────────────────────┼───────────┼──────────────────────────┤
│ admin@commercial-paper-network │ admin     │ commercial-paper-network │
├────────────────────────────────┼───────────┼──────────────────────────┤
│ PeerAdmin@hlfv1                │ PeerAdmin │                          │
└────────────────────────────────┴───────────┴──────────────────────────┘


Issue composer card list --card <Card Name> to get details a specific card

Command succeeded

```

### Useful commands

To reset all the data within the network - i.e. bring it back to the state after it was started
```
npx composer network reset --card admin@commercial-paper-network
```

To remind my self the setup that we have 
```
gulp env
```





