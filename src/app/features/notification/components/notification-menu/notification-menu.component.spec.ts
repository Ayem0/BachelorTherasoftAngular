import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { NotificationMenuComponent } from './notification-menu.component';

describe('NotificationMenuComponent', () => {
  let component: NotificationMenuComponent;
  let fixture: ComponentFixture<NotificationMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [NotificationMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(NotificationMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
