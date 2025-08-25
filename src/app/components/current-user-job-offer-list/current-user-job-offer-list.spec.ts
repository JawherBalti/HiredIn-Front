import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CurrentUserJobOfferList } from './current-user-job-offer-list';

describe('CurrentUserJobOfferList', () => {
  let component: CurrentUserJobOfferList;
  let fixture: ComponentFixture<CurrentUserJobOfferList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CurrentUserJobOfferList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CurrentUserJobOfferList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
