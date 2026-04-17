import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchDmeComponent } from './search-dme.component';

describe('SearchDmeComponent', () => {
  let component: SearchDmeComponent;
  let fixture: ComponentFixture<SearchDmeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchDmeComponent]
    });
    fixture = TestBed.createComponent(SearchDmeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
