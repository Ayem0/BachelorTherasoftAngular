import { TestBed } from '@angular/core/testing';
import { CanActivateFn } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../app.config';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const executeGuard: CanActivateFn = (...guardParameters) =>
    TestBed.runInInjectionContext(() => authGuard(...guardParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
    });
  });

  it('should be created', () => {
    expect(executeGuard).toBeTruthy();
  });
});
