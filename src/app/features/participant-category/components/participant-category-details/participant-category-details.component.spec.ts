import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantCategoryDetailsComponent } from './participant-category-details.component';

describe('ParticipantCategoryDetailsComponent', () => {
  let component: ParticipantCategoryDetailsComponent;
  let fixture: ComponentFixture<ParticipantCategoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantCategoryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
