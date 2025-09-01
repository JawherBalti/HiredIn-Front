import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserCompanies } from './current-user-companies';

describe('CurrentUserCompanies', () => {
  let component: CurrentUserCompanies;
  let fixture: ComponentFixture<CurrentUserCompanies>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentUserCompanies]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentUserCompanies);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
