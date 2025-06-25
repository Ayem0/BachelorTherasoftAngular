import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { PendingInvitationComponent } from './pending-invitation.component';

describe('PendingInvitationComponent', () => {
  let component: PendingInvitationComponent;
  let fixture: ComponentFixture<PendingInvitationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [PendingInvitationComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingInvitationComponent);
    fixture.componentRef.setInput('invitation', {});

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
