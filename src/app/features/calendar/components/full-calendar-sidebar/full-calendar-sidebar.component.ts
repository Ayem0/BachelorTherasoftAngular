import { Component, model } from '@angular/core';
import { MatCalendar } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatFormField, MatLabel, MatOption, MatSelect, MatSelectModule } from '@angular/material/select';

@Component({
    selector: 'app-full-calendar-sidebar',
    imports: [
        MatCalendar,
        MatSelect,
        MatFormField,
        MatOption,
        MatLabel
    ],
    templateUrl: './full-calendar-sidebar.component.html',
    styleUrl: './full-calendar-sidebar.component.scss'
})
export class FullCalendarSidebarComponent {
    public selectedDate = model.required<Date>();
}
