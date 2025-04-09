import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FullCalendarSidebarComponent } from './full-calendar-sidebar.component';


describe('FullCalendarSidebarComponent', () => {
  let component: FullCalendarSidebarComponent;
  let fixture: ComponentFixture<FullCalendarSidebarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FullCalendarSidebarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FullCalendarSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
