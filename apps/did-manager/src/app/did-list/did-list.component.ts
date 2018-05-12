import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'did-list',
  templateUrl: './did-list.component.html',
  styleUrls: ['./did-list.component.css']
})
export class DidListComponent implements OnInit {

  private dids: any = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/api/did/all').subscribe((data) => {
      this.dids = data;
    }, (err) => {
      console.error('ERROR GETTING ALL DIDS', err);
    });
  }

  splitDIDs() {
    const split = this.dids.map((did) => {
      const spl = did.split(':');
      return {
        scheme: spl[0],
        method: spl[1],
        identifier: spl[2]
      };
    });
    return split;
  }
}
