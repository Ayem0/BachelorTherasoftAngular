import { ComponentFixture, TestBed } from '@angular/core/testing';

import { signal } from '@angular/core';
import { ROUTER_OUTLET_DATA } from '@angular/router';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { ParticipantCategoryListComponent } from './participant-category-list.component';
describe('ParticipantCategoryListComponent', () => {
  let component: ParticipantCategoryListComponent;
  let fixture: ComponentFixture<ParticipantCategoryListComponent>;

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
      imports: [ParticipantCategoryListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ParticipantCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
