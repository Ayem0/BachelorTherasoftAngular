import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { EventCategoryDetailsComponent } from './event-category-details.component';

describe('EventCategoryDetailsComponent', () => {
  let component: EventCategoryDetailsComponent;
  let fixture: ComponentFixture<EventCategoryDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [EventCategoryDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EventCategoryDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
