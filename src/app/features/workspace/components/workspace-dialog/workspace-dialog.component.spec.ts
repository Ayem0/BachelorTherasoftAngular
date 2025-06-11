import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { WorkspaceDialogComponent } from './workspace-dialog.component';

describe('WorkspaceDialogComponent', () => {
  let component: WorkspaceDialogComponent;
  let fixture: ComponentFixture<WorkspaceDialogComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<WorkspaceDialogComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [WorkspaceDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
