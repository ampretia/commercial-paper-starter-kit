import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'create-did',
  templateUrl: './create-did.component.html',
  styleUrls: ['./create-did.component.css']
})
export class CreateDidComponent implements OnInit {
  private did = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
  }

  generate() {
    this.did = 'loading';
    this.http.post('/api/did', {}, {observe: 'response'}).subscribe((resp) => {
      if (resp.status === 200) {
        this.did = 'Generated DID: ' + resp.body['did'];
      } else {
        this.did = 'Error: Error creating DID';
        console.error(resp);
      }
    }, (err) => {
      this.did = 'Error: Error creating DID';
      console.error(err);
    });
  }
}
