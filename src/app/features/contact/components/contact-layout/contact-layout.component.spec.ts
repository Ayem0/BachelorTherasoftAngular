import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ContactLayoutComponent } from './contact-layout.component';

describe('ContactLayoutComponent', () => {
  let component: ContactLayoutComponent;
  let fixture: ComponentFixture<ContactLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [ContactLayoutComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
