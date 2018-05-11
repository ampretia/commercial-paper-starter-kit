import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'provision-network',
  templateUrl: './provision-network.component.html',
  styleUrls: ['./provision-network.component.css']
})
export class ProvisionNetworkComponent implements OnInit {

  @Input() loaded = false;
  @Input()  running = false;

  constructor() { }

  ngOnInit() {
  }

}
