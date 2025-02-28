import {
  Component,
  input,
  model,
  OnInit,
  output,
  viewChild,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatSelect, MatSelectModule } from '@angular/material/select';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { ViewMode } from '../../models/calendar';

@Component({
  selector: 'app-full-calendar-header',
  imports: [MatButtonModule, MatIcon, MatSelectModule, MatSlideToggle],
  providers: [
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        subscriptSizing: 'dynamic',
      },
    },
  ],
  templateUrl: './full-calendar-header.component.html',
  styleUrl: './full-calendar-header.component.scss',
})
export class FullCalendarHeaderComponent implements OnInit {
  public viewModeSelect = viewChild.required(MatSelect);

  public isSideBarOpen = model.required<boolean>();

  public viewMode = model.required<ViewMode>();
  public dateTitle = input.required<string>();
  // Navigation
  public prevChange = output();
  public nextChange = output();
  // Today
  public todayChange = output();
  public todayDisable = input.required<boolean>();

  public ngOnInit(): void {
    this.viewModeSelect().selectionChange.subscribe((x) =>
      this.viewMode.set(x.value)
    );
  }

  public toggleSidebar() {
    this.isSideBarOpen.set(!this.isSideBarOpen());
  }
}
