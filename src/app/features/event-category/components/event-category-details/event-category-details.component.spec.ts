import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCategoryDetailsComponent } from './event-category-details.component';

describe('EventCategoryDetailsComponent', () => {
  let component: EventCategoryDetailsComponent;
  let fixture: ComponentFixture<EventCategoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCategoryDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCategoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
