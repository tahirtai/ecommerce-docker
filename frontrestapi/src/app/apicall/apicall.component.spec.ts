import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApicallComponent } from './apicall.component';

describe('ApicallComponent', () => {
  let component: ApicallComponent;
  let fixture: ComponentFixture<ApicallComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApicallComponent]
    });
    fixture = TestBed.createComponent(ApicallComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
