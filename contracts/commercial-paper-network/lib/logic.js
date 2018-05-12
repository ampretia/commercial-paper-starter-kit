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
 * This purchases a paper from a market
 *
 * transaction PurchasePaper {
 *  --> Market market
 *	--> PaperListing listing
 *  --> Account account
 * }
 *
 * @param {org.example.commercialpaper.PurchasePaper} tx The sample transaction instance.
 * @transaction
 */
async function purchasePaper(tx) {  // eslint-disable-line no-unused-vars

    let market = tx.market;
    let companyBuying = getCurrentParticipant();


    const listingRegistry = await getAssetRegistry(`${ns}.PaperListing`);
    const marketRegistry = await getAssetRegistry(`${ns}.Market`);
    const ownershipRegistry = await getAssetRegistry(`${ns}.PaperOwnership`);
    const accountRegistry = await getAssetRegistry(`${ns}.Account`);

    let listingId = tx.listing.getIdentifier();
    let currentHolder = tx.listing.paperOwnership.owner;
    let currentAccount = tx.listing.paperOwnership.owningAccount;
    let paper = tx.listing.paperOwnership.paper;

    // this is being purchased so we need to remove the PaperListing asset
    await listingRegistry.remove(listingId);
    market.papersForSale = market.papersForSale.filter((e)=>{
        return e.getIdentifier() !== listingId;
    });
    await marketRegistry.update(market);

    // Create a new ownership asset and add
    let ownership = getFactory().newResource(ns,'PaperOwnership',companyBuying.symbol+'#'+paper.CUSIP);
    ownership.paper = paper;
    ownership.owner = companyBuying;
    ownership.owningAccount = tx.account;
    await ownershipRegistry.add(ownership);

    // remove the ownership asset that previously existed
    await ownershipRegistry.remove(tx.listing.paperOwnership.getIdentifier());

    // make sure the previously owning company doesn't have it any more in their accounts
    currentAccount.assets = currentAccount.assets.filter((e)=> {
        console.log(e);
        return e.getIdentifier() !== tx.listing.paperOwnership.getIdentifier();
    });
    console.log('2');
    console.log(tx.account);
    // now need to get the account that this was purchased via and update that
    tx.account.assets.push(
        getFactory().newRelationship(ns,'PaperOwnership',companyBuying.symbol+'#'+paper.CUSIP));

    // money transfer
    let discountedValue = paper.par * (100-tx.listing.discount) / 100;
    // remove that from account 'buying'
    // add that to the account 'selling'
    currentAccount.cashBalance += discountedValue;
    tx.account.cashBalance -= discountedValue;


    await accountRegistry.update(currentAccount);
    await accountRegistry.update(tx.account);
}

/**
 * This lists an already created Commercial Paper instance on a market. This could be
 * either one just created by a company to raise funds, or could be being traded
 *
 * @param {org.example.commercialpaper.ListOnMarket} tx transaction instance
 * @transaction
 */
async function listOnMarket(tx) {  // eslint-disable-line no-unused-vars

    let market = tx.market;
    let company =  getCurrentParticipant();
    // validation
    // market can accept the papers to be listed, currency correct etc etc.
    const marketRegistry = await getAssetRegistry(`${ns}.Market`);
    const listingRegistry = await getAssetRegistry(`${ns}.PaperListing`);

    //
    for (const paperListing of tx.papersToList) {
        let paper = paperListing.paper;
        let id = market.getIdentifier()+'='+paper.getIdentifier();
        let listing = getFactory().newResource(ns,'PaperListing',id);
        listing.paperOwnership = paperListing;
        listing.discount = tx.discount;

        await listingRegistry.add(listing);

        let listingRelationship = getFactory().newRelationship(ns,'PaperListing',id);
        market.papersForSale.push(listingRelationship);
        await marketRegistry.update(market);

        // to do - issue an event here

    }
}

/**
 * This creates a new Commerical Paper instance, and creates an ownership record for the company
 * that issued it. This is held in a specific account that the issuing company can use to tracks it's liabilities
 *
 *
 * @param {org.example.commercialpaper.CreatePaper} tx create new paper(s)
 * @transaction
 */
async function createPaper(tx) {  // eslint-disable-line no-unused-vars

    // Get the registry to store this new asset in
    let regName = `${ns}.CommercialPaper`;
    const assetRegistry = await getAssetRegistry(regName);
    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);
    let company =  getCurrentParticipant();
    const ownershipRegistry = await getAssetRegistry(`${ns}.PaperOwnership`);
    const accountRegistry = await getAssetRegistry(`${ns}.Account`);

    for (let i=0; i<tx.numberToCreate; i++){
        // create the paper and add ito the registry
        let paperId= `${tx.CUSIP}#${i}`;
        let paper = getFactory().newResource(ns,'CommercialPaper',paperId);
        paper.ticker = tx.ticker;
        paper.par = tx.par;
        paper.currency = tx.workingCurrency;
        paper.maturity = tx.maturity;
        paper.issueDate = tx.timestamp;

        // set the issuer and owner to be company that the current participant works for
        paper.issuer = company;

        // Update the asset in the asset registry.
        await assetRegistry.add(paper);

        // add it to the ownership of the company that issues it
        // change the paper to be held by the new owner
        let ownership = getFactory().newResource(ns,'PaperOwnership',company.symbol+'#'+paperId);
        ownership.paper = paper;
        ownership.owner = company;
        ownership.owningAccount = getFactory().newRelationship(ns,'Account',company.issuedPaperAccount.getIdentifier());

        // add it to their listings.
        await ownershipRegistry.add(ownership);

        let ownershipRelation = getFactory().newRelationship(ns,'PaperOwnership',company.symbol+'#'+paperId);

        let c = await companyRegistry.get(company.getIdentifier());
        let ac = await accountRegistry.get(c.issuedPaperAccount.getIdentifier());
        console.log(ac);
        ac.assets.push(ownershipRelation);
        await companyRegistry.update(c);
        await accountRegistry.update(ac);
    }
}



/**
 * Paper has matured and now it can be redeemed
 * @param {org.example.commercialpaper.RedeemPaper} tx transaction
 * @transaction
 */
async function redeem(tx){
    let currentOwnership = tx.maturedPaper;

    let parValue = currentOwnership.paper.par;
    let issuer = currentOwnership.paper.issuer;

    let accountOfCurrentHolder = currentOwnership.owningAccount;
    accountOfCurrentHolder.cashBalance += parValue;

    let accountOfIssuer = issuer.issuedPaperAccount;
    accountOfIssuer.cashBalance -= parValue;

    const accountRegistry = await getAssetRegistry(`${ns}.Account`);


    // remove the paper from the holders accounts
    accountOfCurrentHolder.assets = accountOfCurrentHolder.assets.filter((e)=> {
        console.log(e);
        return e.getIdentifier() !== currentOwnership.getIdentifier();
    });

    await accountRegistry.update(accountOfCurrentHolder);
    await accountRegistry.update(accountOfIssuer);
}

/**
 *
 * Assign the supplied DID to the participant
 *
 * @param {org.example.commercialpaper.AssignDid} tx assign DID tx
 * @transaction
 */
async function assignDid(tx) {

    let assignee = tx.targetCompany;

    const companyRegistry = await getParticipantRegistry(`${ns}.Company`);
    assignee.publicdid = tx.publicdid;

    await companyRegistry.update(assignee);

}


