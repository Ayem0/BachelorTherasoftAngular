import { Component, computed, inject, OnInit, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { catchError, of, tap } from 'rxjs';
import { ParticipantCategory } from '../../../participant-category/models/participant-category';
import { ParticipantCategoryStore } from '../../../participant-category/services/participant-category.store';
import { Participant, ParticipantForm } from '../../models/participant';
import { ParticipantStore } from '../../services/participant.store';

@Component({
  selector: 'app-participant-dialog',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatProgressSpinner,
    MatInputModule,
    MatButton,
    MatSelectModule,
    FormsModule,
    MatDatepickerModule,
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss',
})
export class ParticipantDialogComponent implements OnInit {
  private readonly participantStore = inject(ParticipantStore);
  private readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<ParticipantDialogComponent>);
  private readonly matDialogData: {
    workspaceId: string;
    participant: Participant | null;
  } = inject(MAT_DIALOG_DATA);

  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public participant = signal<Participant | null>(
    this.matDialogData.participant
  ).asReadonly();
  public isUpdate = computed(() => !!this.participant());
  public participantCategories = signal<ParticipantCategory[]>([]);
  public disabled = computed(
    () => this.participantStore.updating() || this.participantStore.creating()
  );

  public form = new FormGroup<ParticipantForm>({
    firstName: new FormControl(
      { value: this.participant()?.firstName || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    lastName: new FormControl(
      { value: this.participant()?.lastName || '', disabled: this.disabled() },
      { nonNullable: true, validators: [Validators.required] }
    ),
    participantCategoryId: new FormControl(
      {
        value: this.participant()?.participantCategory?.id || '',
        disabled: this.disabled(),
      },
      { nonNullable: true, validators: [Validators.required] }
    ),
    description: new FormControl(
      { value: this.participant()?.description, disabled: this.disabled() },
      { nonNullable: true }
    ),
    email: new FormControl(
      { value: this.participant()?.country, disabled: this.disabled() },
      { nonNullable: true }
    ),
    phoneNumber: new FormControl(
      { value: this.participant()?.phoneNumber, disabled: this.disabled() },
      { nonNullable: true }
    ),
    address: new FormControl(
      { value: this.participant()?.address, disabled: this.disabled() },
      { nonNullable: true }
    ),
    city: new FormControl(
      { value: this.participant()?.city, disabled: this.disabled() },
      { nonNullable: true }
    ),
    country: new FormControl(
      { value: this.participant()?.country, disabled: this.disabled() },
      { nonNullable: true }
    ),
    dateOfBirth: new FormControl(
      { value: this.participant()?.dateOfBirth, disabled: this.disabled() },
      { nonNullable: true }
    ),
  });

  public ngOnInit(): void {
    this.participantCategoryStore
      .getParticipantCategoriesByWorkspaceId(this.workspaceId())
      .subscribe((participantCategories) => {
        this.participantCategories.set(participantCategories);
      });
  }

  public submit() {
    if (this.form.valid) {
      const req = this.form.getRawValue();
      if (this.participant()) {
        this.participantStore
          .updateParticipant(this.participant()!.id, req)
          .pipe(
            tap((res) => {
              this.dialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      } else {
        this.participantStore
          .createParticipant(this.workspaceId(), req)
          .pipe(
            tap((res) => {
              this.dialogRef.close(res);
            }),
            catchError((err) => {
              console.log(err);
              return of();
            })
          )
          .subscribe();
      }
    }
  }
}
