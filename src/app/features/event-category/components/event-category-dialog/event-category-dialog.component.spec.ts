import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCategoryDialogComponent } from './event-category-dialog.component';

describe('EventCategoryDialogComponent', () => {
  let component: EventCategoryDialogComponent;
  let fixture: ComponentFixture<EventCategoryDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCategoryDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCategoryDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
