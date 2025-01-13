import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ParticipantStore } from '../../participant.store';
import { FormGroup, FormControl, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { tap, catchError, of } from 'rxjs';
import { Participant } from '../../participant';
import { MatButton } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { ParticipantCategoryStore } from '../../../participant-category/participant-category.store';
import { ParticipantCategory } from '../../../participant-category/participant-category';

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
    FormsModule
  ],
  templateUrl: './participant-dialog.component.html',
  styleUrl: './participant-dialog.component.scss'
})
export class ParticipantDialogComponent implements OnInit {
  readonly participantStore = inject(ParticipantStore);
  readonly participantCategoryStore = inject(ParticipantCategoryStore);
  private readonly dialogRef = inject(MatDialogRef<ParticipantDialogComponent>);
  private readonly matDialogData : { workspaceId: string, participant: Participant | null } = inject(MAT_DIALOG_DATA);

  public workspaceId = signal(this.matDialogData.workspaceId).asReadonly();
  public participant = signal<Participant | null>(this.matDialogData.participant).asReadonly();
  public isUpdate = computed(() => !!this.participant());
  public participantCategories = signal<ParticipantCategory[]>([]);

  public form = new FormGroup({
    firstName: new FormControl({ value: this.participant()?.firstName || "", disabled: this.participantStore.updating() || this.participantStore.creating() }, [Validators.required]),
    lastName: new FormControl({ value: this.participant()?.lastName || "", disabled: this.participantStore.updating() || this.participantStore.creating() }, [Validators.required]),
    participantCategory: new FormControl({ value: this.participant()?.participantCategory?.id, disabled: this.participantStore.updating() || this.participantStore.creating() }, [Validators.required]),
    description: new FormControl({ value: this.participant()?.description || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    email: new FormControl({ value: this.participant()?.country || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    phoneNumber: new FormControl({ value: this.participant()?.phoneNumber || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    address: new FormControl({ value: this.participant()?.address || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    city: new FormControl({ value: this.participant()?.city || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    country: new FormControl({ value: this.participant()?.country || "", disabled: this.participantStore.updating() || this.participantStore.creating() }),
    dateOfBirth: new FormControl({ value: this.participant()?.dateOfBirth, disabled: this.participantStore.updating() || this.participantStore.creating() }),
  });

  public ngOnInit(): void {
    this.participantCategoryStore.getParticipantCategoriesByWorkspaceId(this.workspaceId()).subscribe(participantCategories => {
      this.participantCategories.set(participantCategories);
    });
    // this.form.controls.participantCategory.setValue)
  }

  public submit() {
    if(this.form.valid && this.form.value && this.form.value.firstName && this.form.value.lastName && this.form.value.participantCategory) {
      const { firstName, lastName, participantCategory, description, email, phoneNumber, address, city, country, dateOfBirth } = this.form.value;
      if (this.participant()) {
        this.participantStore.updateParticipant(
          this.workspaceId(), 
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
