import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAnalyseRequestComponent } from './create-analyse-request.component';

describe('CreateAnalyseRequestComponent', () => {
  let component: CreateAnalyseRequestComponent;
  let fixture: ComponentFixture<CreateAnalyseRequestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreateAnalyseRequestComponent]
    });
    fixture = TestBed.createComponent(CreateAnalyseRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
