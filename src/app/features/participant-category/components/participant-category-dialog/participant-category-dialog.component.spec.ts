import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParticipantCategoryDialogComponent } from './participant-category-dialog.component';

describe('ParticipantCategoryDialogComponent', () => {
  let component: ParticipantCategoryDialogComponent;
  let fixture: ComponentFixture<ParticipantCategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParticipantCategoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
