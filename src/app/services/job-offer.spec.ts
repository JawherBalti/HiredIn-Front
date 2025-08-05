import { TestBed } from '@angular/core/testing';

import { JobOffer } from './job-offer';

describe('JobOffer', () => {
  let service: JobOffer;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JobOffer);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
