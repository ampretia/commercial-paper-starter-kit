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
import { AccountService } from './Account.service';
import 'rxjs/add/operator/toPromise';
@Component({
	selector: 'app-Account',
	templateUrl: './Account.component.html',
	styleUrls: ['./Account.component.css'],
  providers: [AccountService]
})
export class AccountComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  
      
          ID = new FormControl("", Validators.required);
        
  
      
          summary = new FormControl("", Validators.required);
        
  
      
          workingCurrency = new FormControl("", Validators.required);
        
  
      
          cashBalance = new FormControl("", Validators.required);
        
  
      
          assets = new FormControl("", Validators.required);
        
  


  constructor(private serviceAccount:AccountService, fb: FormBuilder) {
    this.myForm = fb.group({
    
        
          ID:this.ID,
        
    
        
          summary:this.summary,
        
    
        
          workingCurrency:this.workingCurrency,
        
    
        
          cashBalance:this.cashBalance,
        
    
        
          assets:this.assets
        
    
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceAccount.getAll()
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
      $class: "org.example.commercialpaper.Account",
      
        
          "ID":this.ID.value,
        
      
        
          "summary":this.summary.value,
        
      
        
          "workingCurrency":this.workingCurrency.value,
        
      
        
          "cashBalance":this.cashBalance.value,
        
      
        
          "assets":this.assets.value
        
      
    };

    this.myForm.setValue({
      
        
          "ID":null,
        
      
        
          "summary":null,
        
      
        
          "workingCurrency":null,
        
      
        
          "cashBalance":null,
        
      
        
          "assets":null
        
      
    });

    return this.serviceAccount.addAsset(this.asset)
    .toPromise()
    .then(() => {
			this.errorMessage = null;
      this.myForm.setValue({
      
        
          "ID":null,
        
      
        
          "summary":null,
        
      
        
          "workingCurrency":null,
        
      
        
          "cashBalance":null,
        
      
        
          "assets":null 
        
      
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
      $class: "org.example.commercialpaper.Account",
      
        
          
        
    
        
          
            "summary":this.summary.value,
          
        
    
        
          
            "workingCurrency":this.workingCurrency.value,
          
        
    
        
          
            "cashBalance":this.cashBalance.value,
          
        
    
        
          
            "assets":this.assets.value
          
        
    
    };

    return this.serviceAccount.updateAsset(form.get("ID").value,this.asset)
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

    return this.serviceAccount.deleteAsset(this.currentId)
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

    return this.serviceAccount.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "ID":null,
          
        
          
            "summary":null,
          
        
          
            "workingCurrency":null,
          
        
          
            "cashBalance":null,
          
        
          
            "assets":null 
          
        
      };



      
        if(result.ID){
          
            formObject.ID = result.ID;
          
        }else{
          formObject.ID = null;
        }
      
        if(result.summary){
          
            formObject.summary = result.summary;
          
        }else{
          formObject.summary = null;
        }
      
        if(result.workingCurrency){
          
            formObject.workingCurrency = result.workingCurrency;
          
        }else{
          formObject.workingCurrency = null;
        }
      
        if(result.cashBalance){
          
            formObject.cashBalance = result.cashBalance;
          
        }else{
          formObject.cashBalance = null;
        }
      
        if(result.assets){
          
            formObject.assets = result.assets;
          
        }else{
          formObject.assets = null;
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
        
      
        
          "summary":null,
        
      
        
          "workingCurrency":null,
        
      
        
          "cashBalance":null,
        
      
        
          "assets":null 
        
      
      });
  }

}
