import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { SlotService } from './slot.service';

describe('SlotService', () => {
  let service: SlotService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });

    service = TestBed.inject(SlotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
