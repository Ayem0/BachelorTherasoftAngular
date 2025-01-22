import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullCalendarHeaderComponent } from './full-calendar-header.component';

describe('FullCalendarHeaderComponent', () => {
  let component: FullCalendarHeaderComponent;
  let fixture: ComponentFixture<FullCalendarHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullCalendarHeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullCalendarHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
