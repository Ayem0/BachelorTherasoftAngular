import { TestBed } from '@angular/core/testing';

import { EventCategoryService } from './tag.service';

describe('EventCategoryService', () => {
  let service: EventCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EventCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
