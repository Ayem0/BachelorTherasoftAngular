import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { TagService } from './tag.service';

describe('TagService', () => {
  let service: TagService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(TagService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
