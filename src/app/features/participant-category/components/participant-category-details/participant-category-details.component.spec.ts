import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ParticipantCategoryDetailsComponent } from './participant-category-details.component';
describe('ParticipantCategoryDetailsComponent', () => {
  let component: ParticipantCategoryDetailsComponent;
  let fixture: ComponentFixture<ParticipantCategoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [ParticipantCategoryDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
