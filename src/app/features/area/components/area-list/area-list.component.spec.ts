import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { AreaListComponent } from './area-list.component';

describe('AreaListComponent', () => {
  let component: AreaListComponent;
  let fixture: ComponentFixture<AreaListComponent>;

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
      imports: [AreaListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AreaListComponent);
    fixture.componentRef.setInput('locationId', '');
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
