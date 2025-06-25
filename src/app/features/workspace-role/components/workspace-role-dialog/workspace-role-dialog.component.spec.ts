import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { WorkspaceRoleDialogComponent } from './workspace-role-dialog.component';

describe('WorkspaceRoleDialogComponent', () => {
  let component: WorkspaceRoleDialogComponent;
  let fixture: ComponentFixture<WorkspaceRoleDialogComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<WorkspaceRoleDialogComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [WorkspaceRoleDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
