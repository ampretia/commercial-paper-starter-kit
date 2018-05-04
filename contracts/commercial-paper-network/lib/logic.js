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
 * Sample transaction processor function.
 * @param {org.example.commercialpaper.PurchasePaper} tx The sample transaction instance.
 * @transaction
 */
async function purchasePaper(tx) {  // eslint-disable-line no-unused-vars

    let market = tx.market;
    let companyBuying = getCurrentParticipant();
    // validation
    // tbd
    // if (tx.qty > tx.listing.quantityForSale){
    //     throw new Error('Insufficient paper volume for this trade');
    // }

    // deprecate the holdings on that market by the right amount
    const listingRegistry = await getAssetRegistry(`${ns}.PaperListing`);
    const marketRegistry = await getAssetRegistry(`${ns}.Market`);
    let listing = tx.listing;
    // listing.quantityForSale -= tx.qty;
    await listingRegistry.remove(listing.getIdentifier());
    market.papersForSale = market.papersForSale.filter((e)=>{
        return e.getIdentifier() !== listing.getIdentifier();
    });
    await marketRegistry.update(market);

    console.log('Removed the listing');
    // change the paper to be held by the new owner
    let ownership = getFactory().newResource(ns,'PaperOwnership',companyBuying.symbol+'#'+listing.paper.CUSIP);
    const ownershipRegistry = await getAssetRegistry(`${ns}.PaperOwnership`);
    ownership.paper = listing.paper;
    ownership.owner = companyBuying;
    ownership.quantity = 1;//tx.qty;

    console.log('adding the ownerhsip');
    // add it to their listings.
    await ownershipRegistry.add(ownership);

    console.log('adding to the account');
    // now need to get the account that this was purchased via and update that
    tx.account.assets.push(getFactory().newRelationship(ns,'PaperOwnership',companyBuying.symbol+'#'+listing.paper.CUSIP));

    let accountRegistry = await getAssetRegistry(`${ns}.Account`);
    await accountRegistry.update(tx.account);
}

/**
 * Sample transaction processor function.
 * @param {org.example.commercialpaper.ListOnMarket} tx The sample transaction instance.
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
    for (const paper of tx.papersToList) {
        let id = market.getIdentifier()+'='+paper.CUSIP;
        let listing = getFactory().newResource(ns,'PaperListing',id);
        listing.paper = paper;
        listing.currentHolder = company;
        listing.quantityForSale = 1;
        listing.discount = tx.discount;

        await listingRegistry.add(listing);

        let listingRelationship = getFactory().newRelationship(ns,'PaperListing',id);
        market.papersForSale.push(listing);
        await marketRegistry.update(market);

        // todo - remove from the list in the companies array

        try {

            await request.post({ uri:  'https://api.pushover.net/1/messages.json',
                form: {
                    token:'ayq7zvsxc641sfna65njkik1x9y25b',
                    user:'u71fr7r5xvopowybac6pwt9ta39p2r',
                    message:'New Papers listed from '+company.name
                }
            });

        } catch (err){
            console.log(err);
        }
    }



}

/**
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
    for (let i=0; i<tx.numberToCreate; i++){
    // draft #1 create the paper and add ito the registry
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

        console.log('Added the new paper to the registry '+paperId);

        // add it to the ownership of the company that issues it
        // change the paper to be held by the new owner
        let ownership = getFactory().newResource(ns,'PaperOwnership',company.symbol+'#'+paperId);
        ownership.paper = paper;
        ownership.owner = company;
        ownership.quantity = 0;


        // add it to their listings.
        await ownershipRegistry.add(ownership);
        let ownershipRelation = getFactory().newRelationship(ns,'PaperOwnership',company.symbol+'#'+paperId);
        company.issuedNotTraded.push(ownershipRelation);
        await companyRegistry.update(company);
    }

}