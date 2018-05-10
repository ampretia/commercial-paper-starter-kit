import {Asset} from './org.hyperledger.composer.system';
import {Participant} from './org.hyperledger.composer.system';
import {Transaction} from './org.hyperledger.composer.system';
import {Event} from './org.hyperledger.composer.system';
// export namespace org.example.commercialpaper{
   export enum Currency {
      EURO,
      STERLING,
      USD,
      YEN,
      CHF,
      CAD,
   }
   export class DID {
      scheme: string;
      method: string;
      identifier: string;
   }
   export class Company extends Participant {
      symbol: string;
      name: string;
      publicdid: DID;
      accountsManaged: Account[];
      issuedNotTraded: PaperOwnership[];
   }
   export class Account extends Asset {
      ID: string;
      summary: string;
      workingCurrency: Currency;
      cashBalance: number;
      assets: PaperOwnership[];
   }
   export class PaperOwnership extends Asset {
      ID: string;
      paper: CommercialPaper;
      owner: Company;
      quantity: number;
   }
   export class PaperListing extends Asset {
      ID: string;
      paper: CommercialPaper;
      currentHolder: Company;
      quantityForSale: number;
      discount: number;
   }
   export class CommercialPaper extends Asset {
      CUSIP: string;
      ticker: string;
      currency: Currency;
      par: number;
      maturity: number;
      issuer: Company;
      issueDate: Date;
   }
   export class Trader extends Participant {
      participantId: string;
      firstName: string;
      lastName: string;
      worksFor: Company;
      manages: Account[];
      traderdid: DID;
   }
   export class Market extends Asset {
      ID: string;
      name: string;
      currency: Currency;
      papersForSale: PaperListing[];
      maxMaturityTime: number;
   }
   export class RedeemPaper extends Transaction {
      maturedPaper: CommercialPaper;
   }
   export class PurchasePaper extends Transaction {
      market: Market;
      listing: PaperListing;
      qty: number;
      account: Account;
   }
   export class CreatePaper extends Transaction {
      CUSIP: string;
      ticker: string;
      qty: number;
      maturity: number;
      workingCurrency: Currency;
      par: number;
      numberToCreate: number;
   }
   export class ListOnMarket extends Transaction {
      market: Market;
      qty: number;
      discount: number;
      papersToList: CommercialPaper[];
   }
// }
