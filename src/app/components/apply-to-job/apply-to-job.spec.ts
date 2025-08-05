import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyToJob } from './apply-to-job';

describe('ApplyToJob', () => {
  let component: ApplyToJob;
  let fixture: ComponentFixture<ApplyToJob>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyToJob]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyToJob);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
