import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { SlotListComponent } from './slot-list.component';
describe('SlotListComponent', () => {
  let component: SlotListComponent;
  let fixture: ComponentFixture<SlotListComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: ROUTER_OUTLET_DATA,
          useValue: signal(''),
        },
      ],
      imports: [SlotListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SlotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
