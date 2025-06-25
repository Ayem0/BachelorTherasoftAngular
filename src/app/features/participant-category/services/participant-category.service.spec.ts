import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { ParticipantCategoryService } from './participant-category.service';

describe('ParticipantCategoryService', () => {
  let service: ParticipantCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(ParticipantCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
