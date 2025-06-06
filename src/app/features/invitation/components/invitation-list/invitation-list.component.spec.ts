import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvitationListComponent } from './invitation-list.component';

describe('InvitationListComponent', () => {
  let component: InvitationListComponent;
  let fixture: ComponentFixture<InvitationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvitationListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvitationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
