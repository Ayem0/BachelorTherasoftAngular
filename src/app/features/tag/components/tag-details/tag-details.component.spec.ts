import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { TagDetailsComponent } from './tag-details.component';
describe('TagDetailsComponent', () => {
  let component: TagDetailsComponent;
  let fixture: ComponentFixture<TagDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: DEFAULT_PROVIDERS,
      imports: [TagDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
