import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../app.config';
import { RepetitionComponent } from './repetition.component';

describe('RepetitionComponent', () => {
  let component: RepetitionComponent;
  let fixture: ComponentFixture<RepetitionComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<RepetitionComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [RepetitionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RepetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
