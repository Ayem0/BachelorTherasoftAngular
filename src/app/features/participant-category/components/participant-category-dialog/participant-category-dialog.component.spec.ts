import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ParticipantCategoryDialogComponent } from './participant-category-dialog.component';
describe('ParticipantCategoryDialogComponent', () => {
  let component: ParticipantCategoryDialogComponent;
  let fixture: ComponentFixture<ParticipantCategoryDialogComponent>;

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
      imports: [ParticipantCategoryDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
