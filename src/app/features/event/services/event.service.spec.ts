import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { EventService } from './event.service';

describe('EventService', () => {
  let service: EventService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(EventService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
