import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { PendingInvitationListComponent } from './pending-invitation-list.component';

describe('PendingInvitationListComponent', () => {
  let component: PendingInvitationListComponent;
  let fixture: ComponentFixture<PendingInvitationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [PendingInvitationListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PendingInvitationListComponent);
    fixture.componentRef.setInput('invitations', []);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
