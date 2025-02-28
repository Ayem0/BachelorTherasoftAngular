import { TestBed } from '@angular/core/testing';

import { ParticipantCategoryService } from './participant-category.service';

describe('ParticipantCategoryService', () => {
  let service: ParticipantCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ParticipantCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
