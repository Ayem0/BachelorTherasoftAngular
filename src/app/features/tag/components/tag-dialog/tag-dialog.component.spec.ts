import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { TagDialogComponent } from './tag-dialog.component';
describe('TagDialogComponent', () => {
  let component: TagDialogComponent;
  let fixture: ComponentFixture<TagDialogComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<TagDialogComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [TagDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
