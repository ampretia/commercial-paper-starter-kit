# 'From soup to nuts'
## Stage 2 - Local Development

Everything is local within your machine; but using development versions of the real servers.

### Setup

1. *Network*
We'll be running all the tools within docker containers, they all need to communicate so it has found
to be easier if we create a network ahead of time; in the docker-compose files we'll lock the services to defined
ip address, therefore create a newtork with a defined gateway

```
$ docker network create cp-stack-network --gateway 
                    "Subnet": "172.25.0.0/16",
                    "Gateway": "172.25.0.1"

```

2. Hyperledger Composer Card Store
We need to chose a location to store the Composer Network Cards - these are the ids that are used to connect apps to the blockchain. 
Local filesystem is good for testing. Later on we'll migrate this to other solutions. 

All composer applications, and CLIs will pick up the location of the card store from the NODE_CONFIG environment variable

```
$ export NODE_CONFIG=$(gulp cardstore:fs --silent)
```
  
3. Hyperledger Fabric
We need a blockchain - therefore we need to start up a Hyperledger Fabric instance

```
$ gulp fabric:start
$ gulp fabric:card
```
That will create the PeerAdmin card in the wallet as specified by node config - spot the name of the card it prints out for 'PeerAdmin'

Need to deploy the smart contract to Fabric; depending on the fabric deployment (simulated, local or cloud) the initialy created
card that has power to deploy networks will have different names - so that other scripts can handle this correctly set a local varaible.
If using docker compose need to be careful about the hostnames of the cards. Would recommend not using localhost as this can creep in
and will work locally, giving a false sense of security. Deployment then goes a bit wrong. 

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





