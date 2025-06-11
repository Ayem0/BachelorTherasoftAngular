import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ParticipantCategoryDialogComponent } from '../../../participant-category/components/participant-category-dialog/participant-category-dialog.component';
import { ParticipantDialogComponent } from './participant-dialog.component';

describe('ParticipantDialogComponent', () => {
  let component: ParticipantDialogComponent;
  let fixture: ComponentFixture<ParticipantDialogComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<ParticipantCategoryDialogComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [ParticipantDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
