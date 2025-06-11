import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { InitialLoginComponent } from './initial-login.component';

describe('InitialLoginComponent', () => {
  let component: InitialLoginComponent;
  let fixture: ComponentFixture<InitialLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [InitialLoginComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InitialLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
