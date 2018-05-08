
'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const ns = 'org.example.commercialpaper';
const uuidv1 = require('uuid/v1');
const companyCardName = 'AMI@local';

/**
 * { ticker: 'ASDFSDAF',
  par: 100000,
  qty: 1,
  discount: 3.25,
  maturity: 15,
  owner: [],
  issuer: 'fred',
  issueDate: '1525785847143' }

 */
module.exports.issueCP = async function(cp,options={}){
    let bnc = new BusinessNetworkConnection();
    let bnd = await bnc.connect(companyCardName);
    //options.user is the specific trader that needs to be authenticated by in house systems,
    // and then set to use this card.
    let factory = bnd.getFactory();

    let createTx = factory.newTransaction(ns,'CreatePaper');
    createTx.ticker = cp.ticker;
    createTx.qty = parseInt(cp.qty);
    createTx.numberToCreate = parseInt(cp.qty);
    createTx.maturity = parseInt(cp.maturity);
    createTx.par = parseInt(cp.par);
    createTx.CUSIP = uuidv1();

    await bnc.submitTransaction(createTx);

    let listTx = factory.newTransaction(ns,'ListOnMarket');
    listTx.qty = parseInt(cp.qty);
    listTx.discount = parseInt(cp.discount);
    if (!cp.marketId){
        cp.marketId = 'US_BLUE_ONE';
    }
    listTx.market = factory.newRelationship(ns,'Market',cp.marketId);
    listTx.papersToList = [];
    // need to create the references for the papers created
    for (let i=0; i<cp.qty;i++){
        listTx.papersToList.push(factory.newRelationship(ns,'CommercialPaper',`${createTx.CUSIP}#${i}`));
    }

    await bnc.submitTransaction(listTx);
    await bnc.disconnect();
};

/**
 *
 */
module.exports.transferCP = async function(cp,options={}){
    let bnc = new BusinessNetworkConnection();
    let bnd = await bnc.connect(companyCardName);

    let resource = bnd.getFactory().newTransaction(ns,'TransferCP');
    await bnc.submitTransaction(Object.assign(cp,resource));
    bnc.disconnect();
};

/**
 * Expected format of the data is
 * [
            {
                issueDate:'issueDate',
                cusip: 'paper.cusip',
                ticker: 'paper.ticker',
                par: 'paper.par',
                quantity: 'paper.owner[owner].quantity',
                discount: 'paper.discount',
                maturity: 'paper.maturity',
                issuer: 'paper.issuer',
                owner: 'paper.owner[owner].company'
            }

        ]
 */
module.exports.showMarket = async function(options={}){
    console.log((options));
    let businessNetworkConnection = new BusinessNetworkConnection();
    await businessNetworkConnection.connect(companyCardName);

    let companiesRegistry = await businessNetworkConnection.getRegistry(`${ns}.Company`);
    let paperListingRegistry = await businessNetworkConnection.getRegistry(`${ns}.PaperListing`);
    let paperRegistry = await businessNetworkConnection.getRegistry(`${ns}.CommercialPaper`);
    let marketRegistry = await businessNetworkConnection.getRegistry(`${ns}.Market`);
    if (!options.mid){
        options.mid = 'US_BLUE_ONE';
    }
    let market = await marketRegistry.get(options.mid);
    let listingsTable = [];
    console.log('got market' );
    for (const paperListingRef of market.papersForSale) {

        let paperListing = await paperListingRegistry.get(paperListingRef.getIdentifier());

        let paper = await paperRegistry.get(paperListing.paper.getIdentifier());

        let issuer = await companiesRegistry.get(paper.issuer.getIdentifier());
        let owner;
        if  (paperListing.owner){
            owner = await companiesRegistry.get(paperListing.currentOwner.getIdentifier());
        } else {
            owner=issuer;
        }

        let entry = {
            issueDate:paper.issueDate,
            cusip: paperListing.ID,
            ticker: paper.ticker,
            par: paper.par,
            quantity: 1,
            discount:  paperListing.discount,
            maturity: paper.maturity,
            issuer: issuer.name,
            owner: owner.name
        };

        listingsTable.push(entry);
        console.log(entry);
    }


    businessNetworkConnection.disconnect();
    return listingsTable;
};