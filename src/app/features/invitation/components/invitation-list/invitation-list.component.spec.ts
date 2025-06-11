import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { InvitationListComponent } from './invitation-list.component';

describe('InvitationListComponent', () => {
  let component: InvitationListComponent;
  let fixture: ComponentFixture<InvitationListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [InvitationListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InvitationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
