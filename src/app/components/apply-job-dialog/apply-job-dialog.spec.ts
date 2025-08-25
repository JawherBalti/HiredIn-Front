import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApplyJobDialog } from './apply-job-dialog';

describe('ApplyJobDialog', () => {
  let component: ApplyJobDialog;
  let fixture: ComponentFixture<ApplyJobDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyJobDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyJobDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
