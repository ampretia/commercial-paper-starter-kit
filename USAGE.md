# How to trade in Commercial Paper?
> Just to say that is a simulation, and consider this a 'tech preview'

# Background
There are 3 parties in this scenario, two brokers, and one commercial firm. These firms will have multiple staff working for them, but in terms of the blockchain, there are only 3 participants who have indentities. These identies are used when issuing transactions to update the blockchain ledger. 

In Composer terms, this means we have modelled a participant of company, and issued it an identity (in the form of a Composer Network Card). 
an individual trader working for a broker for example has a participant but would not be issued a composer network card. In the companies own authentication system the would be granted permission to use this card. (as an anology, only some members of a small firm would be allowed use of the company credit card)

- Aardvark Investing, and Badge & Honey are the two brokers, referred to as AAI and BAH respectively
- Ampretia Industries is the commerical firm who primarily will be issuing the commerical paper to raise funds for short term obligations - eg to support a current large contract more short term staff have been required - more cash is needed for the payroll ahead of the contract being complete. 


# Setup

0. You will need Docker, Node and Git installed on your machine

1. Clone this repository
```
git clone https://github.com/ampretia/commercial-paper-starter-kit.git
```

2. Changed into the directory created and install
```
cd commerical-paper-starter-kit
npm install
```

The `npm install` will start up a local Hyperledger Fabric environment for you. In addition it will deploy the business network (built with Hyperledger Composer) to Fabric.

If you wish to re-run the Hyperledger Fabric installation, and deploy the network again . i.e. clean up but you don't want to reinstall all the npm modules issues

```
gulp startnetwork
```

> Tip:   just type `gulp` to get a help summary


3. It is then *strongly* recommended to put in some sample data and companies to get going. 
```
npx gulp bootstrap
```

4. Allmost - done; a locally running Hyperledger Fabric, deployed with a business network. Data for 2 brokers and an commercial company created. 
Identities for those companies have been created - and 'cards' for those identies have been created and stored. 

You will need copy the line that starts  `export NODE_CONFIG ` and paste that into a console window. Would suggesting opening a couple and entering this into both of them.

Once you've done that just type

```
npx composer card list
```

And verify that this is the output 

```
The following Business Network Cards are available:

Connection Profile: hlfv1
┌─────────────────┬───────────┬──────────────────────────┐
│ Card Name       │ UserId    │ Business Network         │
├─────────────────┼───────────┼──────────────────────────┤
│ AAI@local       │ AAI       │ commercial-paper-network │
├─────────────────┼───────────┼──────────────────────────┤
│ BAH@local       │ BAH       │ commercial-paper-network │
├─────────────────┼───────────┼──────────────────────────┤
│ admin@local     │ admin     │ commercial-paper-network │
├─────────────────┼───────────┼──────────────────────────┤
│ AMI@local       │ AMI       │ commercial-paper-network │
├─────────────────┼───────────┼──────────────────────────┤
│ PeerAdmin@hlfv1 │ PeerAdmin │                          │
└─────────────────┴───────────┴──────────────────────────┘


Issue composer card list --card <Card Name> to get details a specific card

Command succeeded

```

If you don't see the above, and there weren't any errors being reported it is most likey that the `NODE_CONFIG` envronment variable hasn't been set.. run `gulp env` to get a summary of what it is set to currently. 

# Paper trading

There is a cli application you will need to use the console to trade in commerical paper. In additional there are two web-based UIs for trading. One is specific to the scenario i.e. trading commercial paper. The second, is an example of how the Hyperleder Composer generator (that uses the Yeoman framework) can be used to create a 'starter' Angular-2 application. 

Firstly change to the directory that has the applications - ensure that you have the `NODE_CONFIG` set as above!

```
cd apps/cp-cli
```

Firstly we'll look at the information on Aardvark Investing and Ampretia Industries.

```
$ CP_COMPANY=AAI@local node company                                                                                                                          
info: [ResourceLoading-App] > Connecting business network connection
info: [ResourceLoading-App] > AAI@local

   ┌────────────────────────────┐
   │                            │
   │   AAI Aardvark Investing   │
   │                            │
   └────────────────────────────┘

Public DID did:sov:ai3ngBhByaxg35

Papers issued but not yet traded:
<none>

Trading Accounts:

[AAI-USD-001] US Trading account 1, USD, 1000000
┌────┬────────┬──────────┬─────┬──────────┬────────────┐
│ ID │ Ticker │ Currency │ Par │ Maturity │ Issue Date │
└────┴────────┴──────────┴─────┴──────────┴────────────┘


[AAI-GBP-001] UK Trading account 1, STERLING, 1000000
┌────┬────────┬──────────┬─────┬──────────┬────────────┐
│ ID │ Ticker │ Currency │ Par │ Maturity │ Issue Date │
└────┴────────┴──────────┴─────┴──────────┴────────────┘

```

Let's note the following:
 - Firstly the name of the company and it's 'id'  AAI
 - Next the Distributed Identifier 
 - This company hasn't itself issued any paper
 - It has two trading accounts, for UK and US currency but no papers held in either.

If you also issue `CP_COMPANY=AMI@local node company` then the output for Ampretia Industries will be simiar, different name and identifiers though.

Finally let's look at the current state of the market for commerical paper

```
$ CP_COMPANY=AAI@local node market                                                                                                                                     master  ✭ ✱

   ┌────────────────────────────────────────┐
   │                                        │
   │   Commerical Paper Trading - Markets   │
   │                                        │
   └────────────────────────────────────────┘

info: [ResourceLoading-App] > Connecting business network connection
info: [ResourceLoading-App] > AAI@local

Current listings in UK_BLUE_ONE
<none>

Current listings in US_BLUE_ONE
<none>

```

Here you can see that there are two markets (UK and US) but nothing there.

Typically Commerical Paper will be issued when a short term requirement for cash is needed, that Ampretia Industries now needs so will issue a Commerical Paper.


```
CP_COMPANY=AMI@local node issuePaper.js                         
info: [ResourceLoading-App] > Connecting business network connection AMI@local

   ┌──────────────────────────────────────────────┐
   │                                              │
   │   Commerical Paper Trading - Paper Issuing   │
   │                                              │
   └──────────────────────────────────────────────┘

? Enter ID of the Market to issue this paper into US_BLUE_ONE
? Enter "ticker" name of the paper to issue HAL_2
? Enter maturity time of this paper (in days) 120
? Enter par value of this paper  12000
? Enter number of copies of this paper to issue 1
info: [ResourceLoading-App] > Submitting transaction for new paper
info: [ResourceLoading-App] > Listing on market
info: [ResourceLoading-App] > Run   CP_COMPANY=AMI@local node market to see the listed paper
```

This has issued 1 piece of commerical paper, with a maturity date of 120 days, for $12000

This can be checked by viewing the market

```
$ CP_COMPANY=AMI@local node market                        

   ┌────────────────────────────────────────┐
   │                                        │
   │   Commerical Paper Trading - Markets   │
   │                                        │
   └────────────────────────────────────────┘

info: [ResourceLoading-App] > Connecting business network connection
info: [ResourceLoading-App] > AMI@local

Current listings in UK_BLUE_ONE
<none>

Current listings in US_BLUE_ONE
┌────────────────────────────────────────────────────┬──────────┬────────┬───────┬──────────┬──────────────────────────┐
│ ID                                                 │ Discount │ Ticker │ Par   │ Maturity │ Issuer                   │
├────────────────────────────────────────────────────┼──────────┼────────┼───────┼──────────┼──────────────────────────┤
│ US_BLUE_ONE=5dc619d0-4f72-11e8-92f4-3b2fca198819#0 │ 3.5      │ HAL    │ 12000 │ 120      │ Ampretia Industries Inc. │
└────────────────────────────────────────────────────┴──────────┴────────┴───────┴──────────┴──────────────────────────┘

```

What is now required is for somebody to buy this, (at 3.5% off the par value).

```
$ CP_COMPANY=AAI@local node tradePaper                            
info: [ResourceLoading-App] > Connecting business network connection AAI@local

   ┌──────────────────────────────────────────────┐
   │                                              │
   │   Commerical Paper Trading - Paper Trading   │
   │                                              │
   └──────────────────────────────────────────────┘

? Enter ID of the Market this paper is listed in US_BLUE_ONE
? Enter "ID" name of the paper to purchase US_BLUE_ONE=5dc619d0-4f72-11e8-92f4-3b2fca198819#0
? Enter the ID of the account to use for purchase AAI_USD_001
```

So Aardvark Investing have purchased this paper - that we can now see if they list their own company information.



## Web Application
Change to the directory `apps/aai-web` and enter

```
npm start
```

This will start up the web application - open a browser and navigate to `localhost:3000`

