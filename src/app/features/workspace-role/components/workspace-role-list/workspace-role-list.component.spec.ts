import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { WorkspaceRoleListComponent } from './workspace-role-list.component';

describe('WorkspaceRoleListComponent', () => {
  let component: WorkspaceRoleListComponent;
  let fixture: ComponentFixture<WorkspaceRoleListComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: ROUTER_OUTLET_DATA,
          useValue: signal(''),
        },
      ],
      imports: [WorkspaceRoleListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(WorkspaceRoleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
