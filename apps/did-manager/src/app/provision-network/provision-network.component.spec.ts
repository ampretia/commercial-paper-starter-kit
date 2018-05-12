import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisionNetworkComponent } from './provision-network.component';

describe('ProvisionNetworkComponent', () => {
  let component: ProvisionNetworkComponent;
  let fixture: ComponentFixture<ProvisionNetworkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvisionNetworkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisionNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
