import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventCategoryListComponent } from './event-category-list.component';

describe('EventCategoryListComponent', () => {
  let component: EventCategoryListComponent;
  let fixture: ComponentFixture<EventCategoryListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventCategoryListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EventCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
