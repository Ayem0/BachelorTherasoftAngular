import { TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../app.config';
import { AgendaService } from './agenda.service';

describe('AgendaService', () => {
  let service: AgendaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(AgendaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
