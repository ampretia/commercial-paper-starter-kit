import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'did-associator',
  templateUrl: './did-associator.component.html',
  styleUrls: ['./did-associator.component.css']
})
export class DidAssociatorComponent implements OnInit {

  private participants: any = [];

  private dids: any = [];

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('/api/did/all').subscribe((data) => {
      this.dids = data;
    }, (err) => {
      console.error('ERROR GETTING ALL DIDS', err);
    });

    this.http.get('/api/participants').subscribe((data) => {
      console.log('DATA', data);
      this.participants = data;
    }, (err) => {
      console.error('ERROR GETTING ALL PARTICIPANTS', err);
    });
  }

  submit(e) {
    const selectHolder = e.target.previousSibling;
    const participant = selectHolder.previousSibling.innerHTML;
    const did = selectHolder.getElementsByTagName('select')[0].value;

    this.http.post('/api/participant', {
      participant: participant,
      did: did
    }, {observe: 'response'}).subscribe((resp) => {
      if (resp.status === 200) {
        window.location.reload();
      } else {
        console.error(resp);
      }
    }, (err) => {
      console.error(err);
    });
  }

  participantsWithDID() {
    const returnObj = [];

    this.participants.forEach((participant) => {
      if (participant.hasOwnProperty('did')) {
        returnObj.push(participant);
      }
    });

    return returnObj;
  }

  participantsWithoutDID() {
    const returnObj = [];

    this.participants.forEach((participant) => {
      if (!participant.hasOwnProperty('did')) {
        returnObj.push(participant);
      }
    });

    return returnObj;
  }

  didsWithoutParticipants() {
    let participantsWithDIDs = this.participantsWithDID();
    participantsWithDIDs = participantsWithDIDs.map((participant) => {
      return participant.did;
    });

    const freeDids = [];

    this.dids.forEach((did) => {
      if (!participantsWithDIDs.includes(did)) {
        freeDids.push(did);
      }
    });

    return freeDids;
  }

}
