/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
'use strict';

/* global getAssetRegistry getFactory emit currentParticipant request*/

const ns = 'org.example.commercialpaper';

/**
 * This creates a new Commerical Paper instance, and creates an ownership record for the company
 * that issued it. This is held in a specific account that the issuing company can use to tracks it's liabilities
 *
 * @param {org.example.commercialpaper.CreatePaper} tx - the   transaction instance
 * @transaction
 */
async function createPaper(tx) {  // eslint-disable-line no-unused-vars

    // Get the registry to store this new asset in
    const assetRegistry = await getAssetRegistry(`${ns}.CommercialPaper`);
    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);
    let company =  getCurrentParticipant();
    const accountRegistry = await getAssetRegistry(`${ns}.Account`);

    for (let i=0; i<tx.numberToCreate; i++) {
        // create the paper and add ito the registry
        let paperId= `${tx.CUSIP}#${i}`;
        let paper = getFactory().newResource(ns, 'CommercialPaper', paperId);
        paper.ticker = tx.ticker;
        paper.currency = tx.workingCurrency;
        paper.par = tx.par;
        paper.maturity = tx.maturity;
        paper.issueDate = tx.timestamp;

        // set the issuer and owner to be company that the current participant works for
        paper.issuer = company;
        paper.owner = company;

        // set the owning account to the issuedPaperAccount of the issuing company
        paper.owningAccount = company.issuedPaperAccount;

        // Update the asset in the asset registry.
        await assetRegistry.add(paper);

        // Update the Company participant and its Account asset
        let c = await companyRegistry.get(company.getIdentifier());
        let ac = await accountRegistry.get(c.issuedPaperAccount.getIdentifier());
        ac.assets.push(paper);
        await companyRegistry.update(c);
        await accountRegistry.update(ac);

        // emit event
        const createEvent = getFactory().newEvent(ns, 'CreatePaperEvent');
        createEvent.paper = paper;
        emit(createEvent);
    }
}

/**
 * This lists an already created Commercial Paper instance on a market. This could be
 * either one just created by a company to raise funds, or could be being traded
 *
 * @param {org.example.commercialpaper.ListOnMarket} tx - the transaction instance
 * @transaction
 */
async function listOnMarket(tx) {  // eslint-disable-line no-unused-vars
    let market = tx.market;
    // validation
    // market can accept the papers to be listed, currency correct etc etc.

    const marketRegistry = await getAssetRegistry(`${ns}.Market`);
    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);

    for (const paper of tx.papersToList) {
        let company = await companyRegistry.get(paper.owner.getIdentifier());

        let listing = getFactory().newConcept(ns,'PaperListing');
        listing.ID = market.getIdentifier()+'='+paper.getIdentifier();
        listing.paper = getFactory().newRelationship(ns, 'CommercialPaper', paper.CUSIP);
        listing.currentOwner = getFactory().newRelationship(ns, 'Company', company.symbol);
        listing.discount = tx.discount;

        market.papersForSale.push(listing);
    }
    await marketRegistry.update(market);

    // emit event
    const listEvent = getFactory().newEvent(ns, 'ListOnMarketEvent');
    listEvent.market = market;
    emit(listEvent);
}

/**
 * This purchases a paper from a market
 * @param {org.example.commercialpaper.PurchasePaper} tx - the transaction instance.
 * @transaction
 */
async function purchasePaper(tx) {  // eslint-disable-line no-unused-vars

    let market = tx.market;
    let newOwner = getCurrentParticipant();

    const marketRegistry = await getAssetRegistry(`${ns}.Market`);
    const paperRegistry = await getAssetRegistry(`${ns}.CommercialPaper`);
    const accountRegistry = await getAssetRegistry(`${ns}.Account`);
    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);

    let paperListing;
    market.papersForSale.map((listing) => {
        if (listing.ID === tx.listingID) {
            paperListing =  listing;
        }
    });
    let paper = await paperRegistry.get(paperListing.paper.getIdentifier());
    let currentOwner = await companyRegistry.get(paperListing.currentOwner.getIdentifier());
    let currentAccount = await accountRegistry.get(paper.owningAccount.getIdentifier());
    let newAccount = await accountRegistry.get(tx.account.getIdentifier());

    // first check that the new account is valid and has enough money to purchase the paper
    if (newAccount.cashBalance < (paper.par * (100-paperListing.discount) / 100)) {
        throw new Error ('Not enough money is Account ' + tx.account.getIdentifier() + ' to purchase this commercial paper');
    }

    // this is being purchased so we need to remove the PaperListing asset
    market.papersForSale = market.papersForSale.filter((e) => {
        return e.ID !== tx.listingID;
    });
    await marketRegistry.update(market);

    // make sure the previously owning company doesn't have it any more in their accounts
    currentAccount.assets = currentAccount.assets.filter((e) => {
        return e.getIdentifier() !== paper.CUSIP;
    });

    // now need to get the account that this was purchased via and update that
    newAccount.assets.push(getFactory().newRelationship(ns, 'CommercialPaper', paper.getIdentifier()));

    // money transfer
    let discountedValue = paper.par * (100-paperListing.discount) / 100;
    // remove that from account 'buying'
    currentAccount.cashBalance += discountedValue;
    // add that to the account 'selling'
    newAccount.cashBalance -= discountedValue;

    // TODO - this doesn't work, figure out why
    await accountRegistry.update(currentAccount);
    await accountRegistry.update(newAccount);

    // update the owner of the commercial paper
    paper.owner = newOwner;
    paper.owningAccount = newAccount;
    await paperRegistry.update(paper);

    // emit event
    const purchaseEvent = getFactory().newEvent(ns, 'PurchasePaperEvent');
    purchaseEvent.paper = paper;
    emit(purchaseEvent);
}

/**
 * Paper has matured and now it can be redeemed
 * @param {org.example.commercialpaper.RedeemPaper} tx - the transaction instance
 * @transaction
 */
async function redeemPaper(tx){
    let maturedPaper = tx.maturedPaper;

    let parValue = maturedPaper.par;
    let issuer = maturedPaper.issuer;

    let owningAccount = maturedPaper.owningAccount;
    owningAccount.cashBalance += parValue;

    let issuingAccount = issuer.issuedPaperAccount;
    issuingAccount.cashBalance -= parValue;

    const accountRegistry = await getAssetRegistry(`${ns}.Account`);

    // remove the paper from the holders accounts
    owningAccount.assets = owningAccount.assets.filter((e)=> {
        return e.getIdentifier() !== maturedPaper.getIdentifier();
    });

    await accountRegistry.update(owningAccount);
    await accountRegistry.update(issuingAccount);

    // emit event
    const redeemEvent = getFactory().newEvent(ns, 'RedeemPaperEvent');
    redeemEvent.maturedPaper = maturedPaper;
}

/**
 * Assign the supplied DID to the participant
 * @param {org.example.commercialpaper.AssignDid} tx - the transaction instance
 * @transaction
 */
async function assignDid(tx) {

    let assignee = tx.targetCompany;

    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);
    assignee.publicdid = tx.publicdid;

    await companyRegistry.update(assignee);

    // emit event
    const didEvent = getFactory().newEvent(ns, 'AssignDidEvent');
    didEvent.targetCompany = assignee;
    emit(didEvent);
}
