import { TestBed } from '@angular/core/testing';
import { DEFAULT_PROVIDERS } from '../../../app.config';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
    service = TestBed.inject(AuthService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
