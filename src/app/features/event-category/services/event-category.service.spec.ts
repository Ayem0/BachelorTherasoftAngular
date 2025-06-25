import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { EventCategoryService } from './event-category.service';

describe('EventCategoryService', () => {
  let service: EventCategoryService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(EventCategoryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
