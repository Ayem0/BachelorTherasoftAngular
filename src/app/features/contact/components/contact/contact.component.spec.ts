import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ContactComponent } from './contact.component';
describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [ContactComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    fixture.componentRef.setInput('contact', {});
    fixture.componentRef.setInput('workspaces', []);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
