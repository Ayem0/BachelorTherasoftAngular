import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkspaceRoleDetailsComponent } from './workspace-role-details.component';

describe('WorkspaceRoleDetailsComponent', () => {
  let component: WorkspaceRoleDetailsComponent;
  let fixture: ComponentFixture<WorkspaceRoleDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WorkspaceRoleDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(WorkspaceRoleDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
