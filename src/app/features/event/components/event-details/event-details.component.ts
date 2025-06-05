import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { LocaleService } from '../../../../shared/services/locale/locale.service';
import { isFutureDate } from '../../../../shared/utils/validators';
import { EventCategoryService } from '../../../event-category/services/event-category.service';
import { RoomService } from '../../../room/services/room.service';
import { Tag } from '../../../tag/models/tag';
import { TagService } from '../../../tag/services/tag.service';
import { WorkspaceService } from '../../../workspace/services/workspace.service';
import { EventRequestForm } from '../../models/event';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-details',
  imports: [
    MatChipsModule,
    MatFormFieldModule,
    MatInputModule,
    MatExpansionModule,
    TranslateModule,
    MatProgressSpinner,
    MatIconModule,
    MatButtonModule,
    MatDatepickerModule,
    MatTimepickerModule,
    MatCardModule,
    MatTooltip,
    ReactiveFormsModule,
    FormsModule,
    DatePipe,
    MatAutocompleteModule,
  ],
  templateUrl: './event-details.component.html',
  styleUrl: './event-details.component.scss',
})
export class EventDetailsComponent {
  private readonly matdialogRef = inject(MatDialogRef<EventDetailsComponent>);
  private readonly eventId: string = inject(MAT_DIALOG_DATA);
  private readonly eventService = inject(EventService);
  private readonly eventCategoryService = inject(EventCategoryService);
  private readonly workspaceService = inject(WorkspaceService);
  private readonly tagService = inject(TagService);
  private readonly roomService = inject(RoomService);
  private readonly locale = inject(LocaleService);

  public currentLocal = computed(() =>
    this.locale.currentLang() === 'en' ? 'en-US' : 'fr-FR'
  );

  public isSubmitting = signal(false);
  public isEditMode = signal(false);
  public workspaceId = computed(() => this.event()?.workspaceId ?? '');
  public eventCategories =
    this.eventCategoryService.eventCategoriesByWorkspaceId(this.workspaceId);

  public isLoadingTags = signal(false);
  public tags = this.tagService.tagsByWorkspaceId(this.workspaceId);

  public tagInput = signal<string>('');
  public filteredTags = computed(() =>
    this.tags().filter((tag) =>
      tag.name.toLowerCase().includes(this.tagInput().trim().toLowerCase())
    )
  );

  public rooms = this.roomService.roomsByWorkspaceId(this.workspaceId);
  public workspaces = this.workspaceService.workspaces();

  private disabled = computed(() => this.isEditMode() && !this.isSubmitting());

  public event = this.eventService.detailedEvent(this.eventId);
  public isLoading = signal(false);
  public form = new FormGroup<EventRequestForm>(
    {
      description: new FormControl(
        {
          value: this.event()?.description ?? undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      startDate: new FormControl(
        {
          value: this.event()?.startDate ?? new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      endDate: new FormControl(
        {
          value: this.event()?.endDate ?? new Date(),
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      eventCategoryId: new FormControl(
        {
          value: this.event()?.eventCategoryId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      workspaceId: new FormControl(
        {
          value: this.event()?.workspaceId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      roomId: new FormControl(
        {
          value: this.event()?.roomId ?? '',
          disabled: this.disabled(),
        },
        { nonNullable: true, validators: [Validators.required] }
      ),
      tagIds: new FormControl(
        {
          value: this.event()?.tagIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      participantIds: new FormControl(
        {
          value: this.event()?.participantIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      userIds: new FormControl(
        {
          value: this.event()?.userIds ?? [],
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionInterval: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionNumber: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
      repetitionEndDate: new FormControl(
        {
          value: undefined,
          disabled: this.disabled(),
        },
        { nonNullable: true }
      ),
    },
    { validators: [isFutureDate] }
  );

  public remove(tag: Tag): void {}

  public selected(event: MatAutocompleteSelectedEvent): void {
    event.option.deselect();
  }

  public closeDialog(): void {
    this.matdialogRef.close();
  }

  ngOnInit(): void {
    this.isLoading.set(true);
    this.eventService
      .getById(this.eventId)
      .subscribe(() => this.isLoading.set(false));

    this.form.controls.tagIds.valueChanges.subscribe(() => {
      const ctrl = this.form.controls.tagIds;
      if (ctrl.touched) {
        this.isLoadingTags.set(true);
        this.tagService
          .getTagsByWorkspaceId(this.form.controls.workspaceId.value)
          .subscribe(() => this.isLoadingTags.set(false));
      }
    });
  }

  public toggleEditMode() {
    this.isEditMode.update((isEditMode) => !isEditMode);
    if (this.isEditMode()) {
      this.form.enable();
    } else {
      this.form.disable();
    }
  }

  public save() {
    this.isSubmitting.set(true);
    setTimeout(() => {
      this.isSubmitting.set(false);
      this.toggleEditMode();
    }, 200);
  }

  public delete() {}

  public cancel() {
    this.form.patchValue({
      description: this.event()?.description ?? undefined,
      startDate: this.event()?.startDate ?? new Date(),
      endDate: this.event()?.endDate ?? new Date(),
      eventCategoryId: this.event()?.eventCategoryId ?? '',
      workspaceId: this.event()?.workspaceId ?? '',
      roomId: this.event()?.roomId ?? '',
      tagIds: this.event()?.tagIds ?? [],
      participantIds: this.event()?.participantIds ?? [],
      userIds: this.event()?.userIds ?? [],
    });
    this.toggleEditMode();
  }
}
