import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RepetitionComponent } from './repetition.component';

describe('RepetitionComponent', () => {
  let component: RepetitionComponent;
  let fixture: ComponentFixture<RepetitionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RepetitionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RepetitionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
