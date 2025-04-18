import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InitialLoginComponent } from './initial-login.component';

describe('InitialLoginComponent', () => {
  let component: InitialLoginComponent;
  let fixture: ComponentFixture<InitialLoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InitialLoginComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InitialLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
