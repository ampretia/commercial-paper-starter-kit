import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { HeaderComponent } from './header/header.component';
import { ProvisionNetworkComponent } from './provision-network/provision-network.component';
import { DidAssociatorComponent } from './did-associator/did-associator.component';
import { DidListComponent } from './did-list/did-list.component';
import { CreateDidComponent } from './create-did/create-did.component';

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    ProvisionNetworkComponent,
    DidAssociatorComponent,
    DidListComponent,
    CreateDidComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
