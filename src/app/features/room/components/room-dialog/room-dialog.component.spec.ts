import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DEFAULT_PROVIDERS } from '../../../../app.config';
import { RoomDialogComponent } from './room-dialog.component';

describe('RoomDialogComponent', () => {
  let component: RoomDialogComponent;
  let fixture: ComponentFixture<RoomDialogComponent>;

  beforeEach(async () => {
    const providers = DEFAULT_PROVIDERS;
    await TestBed.configureTestingModule({
      providers: [
        ...providers,
        {
          provide: MatDialogRef<RoomDialogComponent>,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
      imports: [RoomDialogComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(RoomDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
