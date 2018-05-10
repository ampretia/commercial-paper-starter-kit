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

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
// import { TransactionComponent } from './Transaction/Transaction.component'
import { HomeComponent } from './home/home.component';

import { AccountComponent } from './Account/Account.component';
import { PaperOwnershipComponent } from './PaperOwnership/PaperOwnership.component';
import { PaperListingComponent } from './PaperListing/PaperListing.component';
import { CommercialPaperComponent } from './CommercialPaper/CommercialPaper.component';
import { MarketComponent } from './Market/Market.component';


  import { CompanyComponent } from './Company/Company.component';
  import { TraderComponent } from './Trader/Trader.component';


  import { RedeemPaperComponent } from './RedeemPaper/RedeemPaper.component';
  import { PurchasePaperComponent } from './PurchasePaper/PurchasePaper.component';
  import { CreatePaperComponent } from './CreatePaper/CreatePaper.component';
  import { ListOnMarketComponent } from './ListOnMarket/ListOnMarket.component';  
const routes: Routes = [
     //{ path: 'transaction', component: TransactionComponent },
    {path: '', component: HomeComponent},
		
		{ path: 'Account', component: AccountComponent},
    
		{ path: 'PaperOwnership', component: PaperOwnershipComponent},
    
		{ path: 'PaperListing', component: PaperListingComponent},
    
		{ path: 'CommercialPaper', component: CommercialPaperComponent},
    
		{ path: 'Market', component: MarketComponent},
    
    
      { path: 'Company', component: CompanyComponent},
      
      { path: 'Trader', component: TraderComponent},
      
      
        { path: 'RedeemPaper', component: RedeemPaperComponent},
        
        { path: 'PurchasePaper', component: PurchasePaperComponent},
        
        { path: 'CreatePaper', component: CreatePaperComponent},
        
        { path: 'ListOnMarket', component: ListOnMarketComponent},
        
		{path: '**', redirectTo:''}

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class AppRoutingModule { }
