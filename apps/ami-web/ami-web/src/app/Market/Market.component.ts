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

import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MarketService } from './Market.service';
import 'rxjs/add/operator/toPromise';
@Component({
	selector: 'app-Market',
	templateUrl: './Market.component.html',
	styleUrls: ['./Market.component.css'],
  providers: [MarketService]
})
export class MarketComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  
      
          ID = new FormControl("", Validators.required);
        
  
      
          name = new FormControl("", Validators.required);
        
  
      
          currency = new FormControl("", Validators.required);
        
  
      
          papersForSale = new FormControl("", Validators.required);
        
  
      
          maxMaturityTime = new FormControl("", Validators.required);
        
  


  constructor(private serviceMarket:MarketService, fb: FormBuilder) {
    this.myForm = fb.group({
    
        
          ID:this.ID,
        
    
        
          name:this.name,
        
    
        
          currency:this.currency,
        
    
        
          papersForSale:this.papersForSale,
        
    
        
          maxMaturityTime:this.maxMaturityTime
        
    
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceMarket.getAll()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(asset => {
        tempList.push(asset);
      });
      this.allAssets = tempList;
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });
  }

	/**
   * Event handler for changing the checked state of a checkbox (handles array enumeration values)
   * @param {String} name - the name of the asset field to update
   * @param {any} value - the enumeration value for which to toggle the checked state
   */
  changeArrayValue(name: string, value: any): void {
    const index = this[name].value.indexOf(value);
    if (index === -1) {
      this[name].value.push(value);
    } else {
      this[name].value.splice(index, 1);
    }
  }

	/**
	 * Checkbox helper, determining whether an enumeration value should be selected or not (for array enumeration values
   * only). This is used for checkboxes in the asset updateDialog.
   * @param {String} name - the name of the asset field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified asset field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addAsset(form: any): Promise<any> {
    this.asset = {
      $class: "org.example.commercialpaper.Market",
      
        
          "ID":this.ID.value,
        
      
        
          "name":this.name.value,
        
      
        
          "currency":this.currency.value,
        
      
        
          "papersForSale":this.papersForSale.value,
        
      
        
          "maxMaturityTime":this.maxMaturityTime.value
        
      
    };

    this.myForm.setValue({
      
        
          "ID":null,
        
      
        
          "name":null,
        
      
        
          "currency":null,
        
      
        
          "papersForSale":null,
        
      
        
          "maxMaturityTime":null
        
      
    });

    return this.serviceMarket.addAsset(this.asset)
    .toPromise()
    .then(() => {
			this.errorMessage = null;
      this.myForm.setValue({
      
        
          "ID":null,
        
      
        
          "name":null,
        
      
        
          "currency":null,
        
      
        
          "papersForSale":null,
        
      
        
          "maxMaturityTime":null 
        
      
      });
    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else{
            this.errorMessage = error;
        }
    });
  }


   updateAsset(form: any): Promise<any> {
    this.asset = {
      $class: "org.example.commercialpaper.Market",
      
        
          
        
    
        
          
            "name":this.name.value,
          
        
    
        
          
            "currency":this.currency.value,
          
        
    
        
          
            "papersForSale":this.papersForSale.value,
          
        
    
        
          
            "maxMaturityTime":this.maxMaturityTime.value
          
        
    
    };

    return this.serviceMarket.updateAsset(form.get("ID").value,this.asset)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
		})
		.catch((error) => {
            if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
            else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
			}
			else{
				this.errorMessage = error;
			}
    });
  }


  deleteAsset(): Promise<any> {

    return this.serviceMarket.deleteAsset(this.currentId)
		.toPromise()
		.then(() => {
			this.errorMessage = null;
		})
		.catch((error) => {
            if(error == 'Server error'){
				this.errorMessage = "Could not connect to REST server. Please check your configuration details";
			}
			else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
			}
			else{
				this.errorMessage = error;
			}
    });
  }

  setId(id: any): void{
    this.currentId = id;
  }

  getForm(id: any): Promise<any>{

    return this.serviceMarket.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "ID":null,
          
        
          
            "name":null,
          
        
          
            "currency":null,
          
        
          
            "papersForSale":null,
          
        
          
            "maxMaturityTime":null 
          
        
      };



      
        if(result.ID){
          
            formObject.ID = result.ID;
          
        }else{
          formObject.ID = null;
        }
      
        if(result.name){
          
            formObject.name = result.name;
          
        }else{
          formObject.name = null;
        }
      
        if(result.currency){
          
            formObject.currency = result.currency;
          
        }else{
          formObject.currency = null;
        }
      
        if(result.papersForSale){
          
            formObject.papersForSale = result.papersForSale;
          
        }else{
          formObject.papersForSale = null;
        }
      
        if(result.maxMaturityTime){
          
            formObject.maxMaturityTime = result.maxMaturityTime;
          
        }else{
          formObject.maxMaturityTime = null;
        }
      

      this.myForm.setValue(formObject);

    })
    .catch((error) => {
        if(error == 'Server error'){
            this.errorMessage = "Could not connect to REST server. Please check your configuration details";
        }
        else if(error == '404 - Not Found'){
				this.errorMessage = "404 - Could not find API route. Please check your available APIs."
        }
        else{
            this.errorMessage = error;
        }
    });

  }

  resetForm(): void{
    this.myForm.setValue({
      
        
          "ID":null,
        
      
        
          "name":null,
        
      
        
          "currency":null,
        
      
        
          "papersForSale":null,
        
      
        
          "maxMaturityTime":null 
        
      
      });
  }

}
