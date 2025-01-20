import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { ParticipantCategory } from '../../../participant-category/participant-category';
import { ParticipantCategoryStore } from '../../../participant-category/participant-category.store';
import { Participant } from '../../participant';
import { ParticipantStore } from '../../participant.store';

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
    MatDatepickerModule
  ],
  providers: [provideNativeDateAdapter()],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss'
})
export class ParticipantDialogComponent implements OnInit {
  private readonly participantStore = inject(ParticipantStore);
  private readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<ParticipantDialogComponent>);
  private readonly matDialogData : { workspaceId: string, participant: Participant | null } = inject(MAT_DIALOG_DATA);

  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public participant = signal<Participant | null>(this.matDialogData.participant).asReadonly();
  public isUpdate = computed(() => !!this.participant());
  public participantCategories = signal<ParticipantCategory[]>([]);
  public disabled = computed(() => this.participantStore.updating() || this.participantStore.creating());


  public form = new FormGroup({
    firstName: new FormControl({ value: this.participant()?.firstName || "", disabled: this.disabled() }, [Validators.required]),
    lastName: new FormControl({ value: this.participant()?.lastName || "", disabled: this.disabled() }, [Validators.required]),
    participantCategory: new FormControl({ value: this.participant()?.participantCategoryId, disabled: this.disabled() }, [Validators.required]),
    description: new FormControl({ value: this.participant()?.description || "", disabled: this.disabled() }),
    email: new FormControl({ value: this.participant()?.country || "", disabled: this.disabled() }),
    phoneNumber: new FormControl({ value: this.participant()?.phoneNumber || "", disabled: this.disabled() }),
    address: new FormControl({ value: this.participant()?.address || "", disabled: this.disabled() }),
    city: new FormControl({ value: this.participant()?.city || "", disabled: this.disabled() }),
    country: new FormControl({ value: this.participant()?.country || "", disabled: this.disabled() }),
    dateOfBirth: new FormControl({ value: this.participant()?.dateOfBirth, disabled: this.disabled() }),
  });

  public ngOnInit(): void {
    this.participantCategoryStore.getParticipantCategoriesByWorkspaceId(this.workspaceId()).subscribe(participantCategories => {
      this.participantCategories.set(participantCategories);
    });
  }

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.firstName && this.form.value.lastName && this.form.value.participantCategory) {
      const { firstName, lastName, participantCategory, description, email, phoneNumber, address, city, country, dateOfBirth } = this.form.value;
      if (this.participant()) {
        this.participantStore.updateParticipant(
          this.participant()!.id, 
          firstName, 
          lastName, 
          participantCategory,
          email ?? undefined, 
          phoneNumber ?? undefined, 
          address ?? undefined, 
          city ?? undefined, 
          country ?? undefined, 
          description ?? undefined, 
          dateOfBirth ?? undefined, 
        ).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      } else {
        this.participantStore.createParticipant(
          this.workspaceId(), 
          firstName, 
          lastName, 
          participantCategory,
          email ?? undefined, 
          phoneNumber ?? undefined, 
          address ?? undefined, 
          city ?? undefined, 
          country ?? undefined, 
          description ?? undefined, 
          dateOfBirth ?? undefined
        ).pipe(
          tap(res => {
            this.dialogRef.close(res);
          }),
          catchError((err) => {
            console.log(err);
            return of()
          })
        ).subscribe();
      }
    }
  }
}
