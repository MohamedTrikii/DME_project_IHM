import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDiagnosticComponent } from './add-diagnostic.component';

describe('AddDiagnosticComponent', () => {
  let component: AddDiagnosticComponent;
  let fixture: ComponentFixture<AddDiagnosticComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AddDiagnosticComponent]
    });
    fixture = TestBed.createComponent(AddDiagnosticComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
