import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceRoleDialogComponent } from './workspace-role-dialog.component';

describe('WorkspaceRoleDialogComponent', () => {
  let component: WorkspaceRoleDialogComponent;
  let fixture: ComponentFixture<WorkspaceRoleDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceRoleDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceRoleDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
