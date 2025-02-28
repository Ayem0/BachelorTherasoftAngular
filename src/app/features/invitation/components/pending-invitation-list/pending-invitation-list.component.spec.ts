import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PendingInvitationListComponent } from './pending-invitation-list.component';

describe('PendingInvitationListComponent', () => {
  let component: PendingInvitationListComponent;
  let fixture: ComponentFixture<PendingInvitationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PendingInvitationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PendingInvitationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
