import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { SlotDetailsComponent } from './slot-details.component';

describe('SlotDetailsComponent', () => {
  let component: SlotDetailsComponent;
  let fixture: ComponentFixture<SlotDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [SlotDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
