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
import { CommercialPaperService } from './CommercialPaper.service';
import 'rxjs/add/operator/toPromise';
@Component({
	selector: 'app-CommercialPaper',
	templateUrl: './CommercialPaper.component.html',
	styleUrls: ['./CommercialPaper.component.css'],
  providers: [CommercialPaperService]
})
export class CommercialPaperComponent implements OnInit {

  myForm: FormGroup;

  private allAssets;
  private asset;
  private currentId;
	private errorMessage;

  
      
          CUSIP = new FormControl("", Validators.required);
        
  
      
          ticker = new FormControl("", Validators.required);
        
  
      
          currency = new FormControl("", Validators.required);
        
  
      
          par = new FormControl("", Validators.required);
        
  
      
          maturity = new FormControl("", Validators.required);
        
  
      
          issuer = new FormControl("", Validators.required);
        
  
      
          issueDate = new FormControl("", Validators.required);
        
  


  constructor(private serviceCommercialPaper:CommercialPaperService, fb: FormBuilder) {
    this.myForm = fb.group({
    
        
          CUSIP:this.CUSIP,
        
    
        
          ticker:this.ticker,
        
    
        
          currency:this.currency,
        
    
        
          par:this.par,
        
    
        
          maturity:this.maturity,
        
    
        
          issuer:this.issuer,
        
    
        
          issueDate:this.issueDate
        
    
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceCommercialPaper.getAll()
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
      $class: "org.example.commercialpaper.CommercialPaper",
      
        
          "CUSIP":this.CUSIP.value,
        
      
        
          "ticker":this.ticker.value,
        
      
        
          "currency":this.currency.value,
        
      
        
          "par":this.par.value,
        
      
        
          "maturity":this.maturity.value,
        
      
        
          "issuer":this.issuer.value,
        
      
        
          "issueDate":this.issueDate.value
        
      
    };

    this.myForm.setValue({
      
        
          "CUSIP":null,
        
      
        
          "ticker":null,
        
      
        
          "currency":null,
        
      
        
          "par":null,
        
      
        
          "maturity":null,
        
      
        
          "issuer":null,
        
      
        
          "issueDate":null
        
      
    });

    return this.serviceCommercialPaper.addAsset(this.asset)
    .toPromise()
    .then(() => {
			this.errorMessage = null;
      this.myForm.setValue({
      
        
          "CUSIP":null,
        
      
        
          "ticker":null,
        
      
        
          "currency":null,
        
      
        
          "par":null,
        
      
        
          "maturity":null,
        
      
        
          "issuer":null,
        
      
        
          "issueDate":null 
        
      
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
      $class: "org.example.commercialpaper.CommercialPaper",
      
        
          
        
    
        
          
            "ticker":this.ticker.value,
          
        
    
        
          
            "currency":this.currency.value,
          
        
    
        
          
            "par":this.par.value,
          
        
    
        
          
            "maturity":this.maturity.value,
          
        
    
        
          
            "issuer":this.issuer.value,
          
        
    
        
          
            "issueDate":this.issueDate.value
          
        
    
    };

    return this.serviceCommercialPaper.updateAsset(form.get("CUSIP").value,this.asset)
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

    return this.serviceCommercialPaper.deleteAsset(this.currentId)
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

    return this.serviceCommercialPaper.getAsset(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "CUSIP":null,
          
        
          
            "ticker":null,
          
        
          
            "currency":null,
          
        
          
            "par":null,
          
        
          
            "maturity":null,
          
        
          
            "issuer":null,
          
        
          
            "issueDate":null 
          
        
      };



      
        if(result.CUSIP){
          
            formObject.CUSIP = result.CUSIP;
          
        }else{
          formObject.CUSIP = null;
        }
      
        if(result.ticker){
          
            formObject.ticker = result.ticker;
          
        }else{
          formObject.ticker = null;
        }
      
        if(result.currency){
          
            formObject.currency = result.currency;
          
        }else{
          formObject.currency = null;
        }
      
        if(result.par){
          
            formObject.par = result.par;
          
        }else{
          formObject.par = null;
        }
      
        if(result.maturity){
          
            formObject.maturity = result.maturity;
          
        }else{
          formObject.maturity = null;
        }
      
        if(result.issuer){
          
            formObject.issuer = result.issuer;
          
        }else{
          formObject.issuer = null;
        }
      
        if(result.issueDate){
          
            formObject.issueDate = result.issueDate;
          
        }else{
          formObject.issueDate = null;
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
      
        
          "CUSIP":null,
        
      
        
          "ticker":null,
        
      
        
          "currency":null,
        
      
        
          "par":null,
        
      
        
          "maturity":null,
        
      
        
          "issuer":null,
        
      
        
          "issueDate":null 
        
      
      });
  }

}
