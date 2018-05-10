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
import { TraderService } from './Trader.service';
import 'rxjs/add/operator/toPromise';
@Component({
	selector: 'app-Trader',
	templateUrl: './Trader.component.html',
	styleUrls: ['./Trader.component.css'],
  providers: [TraderService]
})
export class TraderComponent implements OnInit {

  myForm: FormGroup;

  private allParticipants;
  private participant;
  private currentId;
	private errorMessage;

  
      
          participantId = new FormControl("", Validators.required);
        
  
      
          firstName = new FormControl("", Validators.required);
        
  
      
          lastName = new FormControl("", Validators.required);
        
  
      
          worksFor = new FormControl("", Validators.required);
        
  
      
          manages = new FormControl("", Validators.required);
        
  
      
          traderdid = new FormControl("", Validators.required);
        
  


  constructor(private serviceTrader:TraderService, fb: FormBuilder) {
    this.myForm = fb.group({
    
        
          participantId:this.participantId,
        
    
        
          firstName:this.firstName,
        
    
        
          lastName:this.lastName,
        
    
        
          worksFor:this.worksFor,
        
    
        
          manages:this.manages,
        
    
        
          traderdid:this.traderdid
        
    
    });
  };

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): Promise<any> {
    let tempList = [];
    return this.serviceTrader.getAll()
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      result.forEach(participant => {
        tempList.push(participant);
      });
      this.allParticipants = tempList;
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
   * @param {String} name - the name of the participant field to update
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
   * only). This is used for checkboxes in the participant updateDialog.
   * @param {String} name - the name of the participant field to check
   * @param {any} value - the enumeration value to check for
   * @return {Boolean} whether the specified participant field contains the provided value
   */
  hasArrayValue(name: string, value: any): boolean {
    return this[name].value.indexOf(value) !== -1;
  }

  addParticipant(form: any): Promise<any> {
    this.participant = {
      $class: "org.example.commercialpaper.Trader",
      
        
          "participantId":this.participantId.value,
        
      
        
          "firstName":this.firstName.value,
        
      
        
          "lastName":this.lastName.value,
        
      
        
          "worksFor":this.worksFor.value,
        
      
        
          "manages":this.manages.value,
        
      
        
          "traderdid":this.traderdid.value
        
      
    };

    this.myForm.setValue({
      
        
          "participantId":null,
        
      
        
          "firstName":null,
        
      
        
          "lastName":null,
        
      
        
          "worksFor":null,
        
      
        
          "manages":null,
        
      
        
          "traderdid":null
        
      
    });

    return this.serviceTrader.addParticipant(this.participant)
    .toPromise()
    .then(() => {
			this.errorMessage = null;
      this.myForm.setValue({
      
        
          "participantId":null,
        
      
        
          "firstName":null,
        
      
        
          "lastName":null,
        
      
        
          "worksFor":null,
        
      
        
          "manages":null,
        
      
        
          "traderdid":null 
        
      
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


   updateParticipant(form: any): Promise<any> {
    this.participant = {
      $class: "org.example.commercialpaper.Trader",
      
        
          
        
    
        
          
            "firstName":this.firstName.value,
          
        
    
        
          
            "lastName":this.lastName.value,
          
        
    
        
          
            "worksFor":this.worksFor.value,
          
        
    
        
          
            "manages":this.manages.value,
          
        
    
        
          
            "traderdid":this.traderdid.value
          
        
    
    };

    return this.serviceTrader.updateParticipant(form.get("participantId").value,this.participant)
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


  deleteParticipant(): Promise<any> {

    return this.serviceTrader.deleteParticipant(this.currentId)
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

    return this.serviceTrader.getparticipant(id)
    .toPromise()
    .then((result) => {
			this.errorMessage = null;
      let formObject = {
        
          
            "participantId":null,
          
        
          
            "firstName":null,
          
        
          
            "lastName":null,
          
        
          
            "worksFor":null,
          
        
          
            "manages":null,
          
        
          
            "traderdid":null 
          
        
      };



      
        if(result.participantId){
          
            formObject.participantId = result.participantId;
          
        }else{
          formObject.participantId = null;
        }
      
        if(result.firstName){
          
            formObject.firstName = result.firstName;
          
        }else{
          formObject.firstName = null;
        }
      
        if(result.lastName){
          
            formObject.lastName = result.lastName;
          
        }else{
          formObject.lastName = null;
        }
      
        if(result.worksFor){
          
            formObject.worksFor = result.worksFor;
          
        }else{
          formObject.worksFor = null;
        }
      
        if(result.manages){
          
            formObject.manages = result.manages;
          
        }else{
          formObject.manages = null;
        }
      
        if(result.traderdid){
          
            formObject.traderdid = result.traderdid;
          
        }else{
          formObject.traderdid = null;
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
      
        
          "participantId":null,
        
      
        
          "firstName":null,
        
      
        
          "lastName":null,
        
      
        
          "worksFor":null,
        
      
        
          "manages":null,
        
      
        
          "traderdid":null 
        
      
      });
  }

}
