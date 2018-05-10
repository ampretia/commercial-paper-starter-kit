
'use strict';

const BusinessNetworkConnection = require('composer-client').BusinessNetworkConnection;
const AdminConnection = require('composer-admin').AdminConnection;
const ns = 'org.example.commercialpaper';
const uuidv1 = require('uuid/v1');
const companyCardName = 'AAI@local';

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
    let cardName = options.user.substr(options.user.indexOf('@')+1)+'@local';
    if (!cardName) {
        cardName = companyCardName;
    }
    let bnd = await bnc.connect(cardName);
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
    let cardName = options.user.substr(options.user.indexOf('@')+1)+'@local';
    if (!cardName) {
        cardName = companyCardName;
    }
    let bnd = await bnc.connect(cardName);

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
    let bnc = new BusinessNetworkConnection();
    let cardName = options.user.substr(options.user.indexOf('@')+1)+'@local';
    if (!cardName) {
        cardName = companyCardName;
    }
    let bnd = await bnc.connect(cardName);

    let companiesRegistry = await bnc.getRegistry(`${ns}.Company`);
    let paperListingRegistry = await bnc.getRegistry(`${ns}.PaperListing`);
    let paperRegistry = await bnc.getRegistry(`${ns}.CommercialPaper`);
    let marketRegistry = await bnc.getRegistry(`${ns}.Market`);
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


    bnc.disconnect();
    return listingsTable;
};

module.exports.ownHoldings = async function(options={}){
    let bnc = new BusinessNetworkConnection();
    let cardName = options.user.substr(options.user.indexOf('@')+1)+'@local';
    if (!cardName) {
        cardName = companyCardName;
    }


    const adminConnection = new AdminConnection();
    await adminConnection.connect(cardName);
    let metaData = await adminConnection.ping();
    let participantId = metaData.participant.substr(metaData.participant.indexOf('#')+1);
    await adminConnection.disconnect();

    let bnd = await bnc.connect(cardName);

    let companiesRegistry = await bnc.getRegistry(`${ns}.Company`);
    let paperListingRegistry = await bnc.getRegistry(`${ns}.PaperListing`);
    let paperRegistry = await bnc.getRegistry(`${ns}.CommercialPaper`);
    let accountRegistry = await bnc.getRegistry(`${ns}.Account`);
    // let marketRegistry = await bnc.getRegistry(`${ns}.Market`);
    let paperOwnershipRegistry = await bnc.getRegistry(`${ns}.PaperOwnership`);
    if (!options.mid){
        options.mid = 'US_BLUE_ONE';
    }

    let company = await companiesRegistry.get(participantId);
    let listingsTable = [];

    for (const paperref of company.issuedNotTraded){
        let paperOwnership = await paperOwnershipRegistry.get(paperref.getIdentifier());
        let paper = await paperRegistry.get(paperOwnership.paper.getIdentifier());
        let entry = {
            issueDate:paper.issueDate,
            cusip:paper.CUSIP,
            ticker: paper.ticker,
            par: paper.par,
            quantity: 1,
            discount: 0.,
            maturity: paper.maturity,
            issuer: company.name,
            owner: 'na'
        };

        listingsTable.push(entry);
    }

    for (const accountRef of company.accountsManaged){
        let account = await accountRegistry.get(accountRef.getIdentifier());
        for (const paperRef of account.assets){
            let ownership = await paperOwnershipRegistry.get(paperRef.getIdentifier());
            let paper = await paperRegistry.get(ownership.paper.getIdentifier());

            let entry = {
                issueDate:paper.issueDate,
                cusip:paper.CUSIP,
                ticker: paper.ticker,
                par: paper.par,
                quantity: 1,
                discount: 0.,
                maturity: paper.maturity,
                issuer: company.name,
                owner: 'na'
            };

            listingsTable.push(entry);
        }



    }

    bnc.disconnect();
    return listingsTable;
};