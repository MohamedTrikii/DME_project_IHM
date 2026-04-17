import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateOrdonnanceComponent } from './create-ordonnance.component';

describe('CreateOrdonnanceComponent', () => {
  let component: CreateOrdonnanceComponent;
  let fixture: ComponentFixture<CreateOrdonnanceComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateOrdonnanceComponent]
    });
    fixture = TestBed.createComponent(CreateOrdonnanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
