import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantCategoryListComponent } from './participant-category-list.component';

describe('ParticipantCategoryListComponent', () => {
  let component: ParticipantCategoryListComponent;
  let fixture: ComponentFixture<ParticipantCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
