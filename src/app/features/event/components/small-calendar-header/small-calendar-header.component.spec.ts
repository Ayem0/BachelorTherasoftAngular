import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SmallCalendarHeaderComponent } from './small-calendar-header.component';

describe('SmallCalendarHeaderComponent', () => {
  let component: SmallCalendarHeaderComponent;
  let fixture: ComponentFixture<SmallCalendarHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SmallCalendarHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmallCalendarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
