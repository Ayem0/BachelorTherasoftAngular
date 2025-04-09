import { TestBed } from '@angular/core/testing';

import { WorkspaceRoleService } from './workspace-role.service';

describe('WorkspaceRoleService', () => {
  let service: WorkspaceRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkspaceRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
