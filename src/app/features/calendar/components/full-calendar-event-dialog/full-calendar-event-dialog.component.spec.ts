import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FullCalendarEventDialogComponent } from './full-calendar-event-dialog.component';

describe('FullCalendarEventDialogComponent', () => {
  let component: FullCalendarEventDialogComponent;
  let fixture: ComponentFixture<FullCalendarEventDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullCalendarEventDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullCalendarEventDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
