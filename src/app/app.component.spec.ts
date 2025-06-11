import { TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { DEFAULT_PROVIDERS } from './app.config';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [AppComponent],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
