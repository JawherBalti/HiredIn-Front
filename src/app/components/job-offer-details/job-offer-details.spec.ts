import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JobOfferDetails } from './job-offer-details';

describe('JobOfferDetails', () => {
  let component: JobOfferDetails;
  let fixture: ComponentFixture<JobOfferDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobOfferDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobOfferDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
