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

import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { DataService }     from './data.service';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
// import { TransactionComponent } from './Transaction/Transaction.component'

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
@NgModule({
  declarations: [
    AppComponent,
		HomeComponent,
    // TransactionComponent,
    AccountComponent,
    PaperOwnershipComponent,
    PaperListingComponent,
    CommercialPaperComponent,
    
    MarketComponent
    ,

    CompanyComponent,
      
      TraderComponent
      ,

    RedeemPaperComponent,
        PurchasePaperComponent,
        CreatePaperComponent,
        
        ListOnMarketComponent
        
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DataService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
