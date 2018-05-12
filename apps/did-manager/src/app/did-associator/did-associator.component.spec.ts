import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DidAssociatorComponent } from './did-associator.component';

describe('DidAssociatorComponent', () => {
  let component: DidAssociatorComponent;
  let fixture: ComponentFixture<DidAssociatorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DidAssociatorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DidAssociatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
