import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { WorkspaceRoleService } from './workspace-role.service';

describe('WorkspaceRoleService', () => {
  let service: WorkspaceRoleService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(WorkspaceRoleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
