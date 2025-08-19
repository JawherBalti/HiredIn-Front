// src/app/components/schedule-interview-dialog/schedule-interview-dialog.component.ts
import { Component, Inject } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContainer,
  MatDialogContent,
  MatDialogRef,
} from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import moment from 'moment';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-schedule-interview-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatDialogContent,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatDialogActions,
    MatInputModule, // Add MatInputModule here
  ], // Add DragDropModule here],
  templateUrl: './schedule-interview-dialog.html',
  styleUrls: ['./schedule-interview-dialog.css'],
})
export class ScheduleInterviewDialogComponent {
  interviewForm: FormGroup;
  isEditMode = false;

  constructor(
    public dialogRef: MatDialogRef<ScheduleInterviewDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private fb: FormBuilder
  ) {
    this.isEditMode = !!data.existingInterview;

    this.interviewForm = this.fb.group({
      scheduled_time: [
        this.isEditMode
          ? moment(data.existingInterview.scheduled_time).format(
              'YYYY-MM-DDTHH:mm'
            )
          : moment().add(1, 'day').format('YYYY-MM-DDTHH:mm'),
        Validators.required,
      ],
      location: [
        this.isEditMode ? data.existingInterview.location : '',
        Validators.required,
      ],
      notes: [this.isEditMode ? data.existingInterview.notes : ''],
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.interviewForm.valid) {
      const result = {
        data: {
          scheduled_time: moment(
            this.interviewForm.value.scheduled_time
          ).toISOString(),
          location: this.interviewForm.value.location,
          notes: this.interviewForm.value.notes,
        },
        isUpdate: this.isEditMode,
        interview: this.isEditMode ? this.data.existingInterview : null,
      };
      this.dialogRef.close(result);
    }
  }
}
