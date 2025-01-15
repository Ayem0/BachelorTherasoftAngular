import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceRoleListComponent } from './workspace-role-list.component';

describe('WorkspaceRoleListComponent', () => {
  let component: WorkspaceRoleListComponent;
  let fixture: ComponentFixture<WorkspaceRoleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceRoleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceRoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
