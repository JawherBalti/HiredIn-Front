import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOfferList } from './job-offer-list';

describe('JobOfferList', () => {
  let component: JobOfferList;
  let fixture: ComponentFixture<JobOfferList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOfferList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOfferList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
