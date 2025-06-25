import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../app.config';
import { unauthGuard } from './unauth.guard';

describe('unauthGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => unauthGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
