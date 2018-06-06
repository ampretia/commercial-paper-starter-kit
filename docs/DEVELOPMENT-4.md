# Onto Cloud

[Previously](./DEVELOPMENT-3.md) you've run the full Commercial Paper stack locally. But at some point you want to move on to cloud deployment - but how to deploy the Blockchain parts?

## IBM Cloud Blockchain Starter Plan   

- Head over to [IBM Cloud](https://console.bluemix.net) and signup for a FREE developer plan
- _Exchange emails etc._
- Click on the 'hamburger' menu icon top left, and click 'Create Resource'
- Select or search for 'Blockchain', and click on the service
- You can edit the service name (would suggest you do) but make sure that you've chosen the 'US South' region; as currently that's where the Blockchain service is (currently) available.
- Scroll down and select the 'Starter Membership Plan' and then click 'Create'
- After a few moments, the 'Network Created!' message is shown, and then you can Launch the management console. 
- A splash screen is shown with some links, that you may follow if you wish. Once dismissed that you'll be at the Overview page (worth booking marking this)
- The most important thing to do is head to the APIs tab, and make a note of the NetworkCredentials - including the secret.

> Put these credentials into a file called `blockchain.json` in the root of the root of the repo. 

There's an entry in the .gitignore to stop this being published.

You can minimise the browser window for the moment.

## Setup

Remember the previous set of steps? 

1. *Network*

Can jump over this we don't need this locally - it's in the cloud!

2. *Composer Card Store*

For the moment we can use the local card store

```
$ export NODE_CONFIG=$(gulp cardstore:fs --silent)
```

3. *Hyperledger Fabric*

You don't need to provision this (well you do but you've already done it in the cloud!)

4. *Get access*
But you do need the card, the target here will mean use the `blockchain.json` to create the card

```
$ gulp fabric:card --target=cloud
```

At the end of the previous output, there are a number of `export BLOCKCHAIN.....` when running locally we had to set the card name, likewise here we need to set that, but also the 'enroll secret' - locally this always defaults to adminpw, but with the cloud service it is random

```
$ export BLOCKCHAIN_NETWORK_CARD=admin@blockchain-network
$ export BLOCKCHAIN_NETWORK_ENROLL_SECRET=ea94251df5
$ export BLOCKCHAIN_NETWORK_ENROLL_ID=admin
```


5. *Deploy the contract*

We need to do the initial deploy, and then bootstrap data into it

```
$ gulp contract:deploy 
$ gulp contract:bootstrap
```

> Look carefully and there is no different in these commands.. and there is no difference in what the gulp script does either.  Once you have that first card everything follows.

We now have data within the ledger; the Composer CLI is available, so lets look at the network cards that we have in place. 

```
$ npx composer card list                                                   
The following Business Network Cards are available:

Connection Profile: Annapurna Network - A-6
┌────────────────────────────────┬────────┬──────────────────────────┐
│ Card Name                      │ UserId │ Business Network         │
├────────────────────────────────┼────────┼──────────────────────────┤
│ AAI@commercial-paper-network   │ AAI    │ commercial-paper-network │
├────────────────────────────────┼────────┼──────────────────────────┤
│ AMI@commercial-paper-network   │ AMI    │ commercial-paper-network │
├────────────────────────────────┼────────┼──────────────────────────┤
│ admin@commercial-paper-network │ admin  │ commercial-paper-network │
├────────────────────────────────┼────────┼──────────────────────────┤
│ BAH@commercial-paper-network   │ BAH    │ commercial-paper-network │
├────────────────────────────────┼────────┼──────────────────────────┤
│ admin@blockchain-network       │ admin  │                          │
└────────────────────────────────┴────────┴──────────────────────────┘


Issue composer card list --card <Card Name> to get details a specific card

Command succeeded

```

The differences here from the local case, are the suffix on the card name, and the name of the connection profile.. which in this case I didn't change from the default. 


6. *Applications*

Applications can run just the same way, the only thing to change is the name of the card - (as the suffixs are different).  The connection
information is held within the card.

### Moving the cards to the cloud

So we've deployed a Blockchain instance to a cloud hosted service. Applications such rest servers etc, can be pushed to the cloud as Cloud Foundary applications, or container based docker images.

Or by using Cloud Functions (OpenWhisk) servless architectures.  However none of those are going to work unless the cards are available.

1. *Get the card files*

Make a new directory and extract the cards from the local card store.

```
$ mkdir cards && cd cards                                                                        
$ # you could list the cards as well here for a memory jog

$ npx composer card export --card AMI@commercial-paper-network                                                                 
Successfully exported business network card
	Card file: AMI@commercial-paper-network.card
	Card name: AMI@commercial-paper-network

Command succeeded

$ npx composer card export --card AAI@commercial-paper-network                                                                 

Successfully exported business network card
	Card file: AAI@commercial-paper-network.card
	Card name: AAI@commercial-paper-network

Command succeeded

$ npx composer card export --card BAH@commercial-paper-network                                                                 

Successfully exported business network card
	Card file: BAH@commercial-paper-network.card
	Card name: BAH@commercial-paper-network

Command succeeded

```

2. *Setup a Cloud Store*
You have options here, eg REDIS, S3, Cloudant - but the IBM Cloud Object Store (uses S3 API) is well suited. (will call it COS from now on).  Follow the notes here to create a new bucket....

3. *Create the Wallet Configuration*

We need to setup a NODE_CONFIG JSON structure that references COS.
```
{
  "composer": {
    "wallet": {
      "type": "@ampretia/composer-wallet-ibmcos",
      "desc": "Uses the IBM Cloud Object Store",
      "options": {
        "bucketName": "commercial-paper-demo",
        "endpoint": "s3-api.us-geo.objectstorage.softlayer.net",
        "apikey": "WmKck6T----------ldfJ4zfSTl-Id5oqhx",
        "serviceInstanceId": "crn:v1:bluemix:public:cloud-object-storage:global:a/f312377c8--------------------------------54cfd::"
      }
    }
  }
}
```
Create this structure in a json file, here I've called it ` ~/github/_tmp/cardstore-ibmcos.json`

- Put this into a environment variable 
```
export CLOUD_NODE_CONFIG=$(cat ~/github/_tmp/cardstore-ibmcos.json) 
```

- Then we can run a docker image top help push the images. 
```
$ docker run -it -v $(pwd):/home/composer/cards --env NODE_CONFIG=${CLOUD_NODE_CONFIG} calanais/composer-cloud-card-wallet

 
   ┌─────────────────────────────────────────────────────────────────────┐
   │                                                                     │
   │   Cloud Wallet implementation: "@ampretia/composer-wallet-ibmcos"   │
   │                                                                     │
   └─────────────────────────────────────────────────────────────────────┘

The following Business Network Cards are available:

Connection Profile: Annapurna Network - A-6
┌──────────────────────────────┬────────┬──────────────────────────┐
│ Card Name                    │ UserId │ Business Network         │
├──────────────────────────────┼────────┼──────────────────────────┤
│ AAI@commercial-paper-network │ AAI    │ commercial-paper-network │
└──────────────────────────────┴────────┴──────────────────────────┘

```

Here I've got one card already loaded. But I can now put in the other cards

```
ibp-composer cards $ ls cards
AAI@commercial-paper-network.card  AMI@commercial-paper-network.card  BAH@commercial-paper-network.card
ibp-composer cards $ composer card import --file ./cards/AMI\@commercial-paper-network.card 

Successfully imported business network card
	Card file: ./cards/AMI@commercial-paper-network.card
	Card name: AMI@commercial-paper-network

Command succeeded
```

> **Why use a Docker Image?**
> You could create a new command shell and do it there. Using a docker image to me gave an isolation that was appealing when dealing with the cards. Plus locally I can create a Docker image that builds on this, with specific cloud store details burnt in. That makes it very easy to have dedicated 'composer cli shells' that reference given cloud wallets.

Your applications are now ready to be pushed to the cloud.

