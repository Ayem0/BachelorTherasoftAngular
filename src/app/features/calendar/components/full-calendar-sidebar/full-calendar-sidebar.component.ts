import { Component, inject, model } from '@angular/core';
import { DateRange, DefaultMatCalendarRangeStrategy, MAT_DATE_RANGE_SELECTION_STRATEGY, MatCalendar, MatRangeDateSelectionModel } from '@angular/material/datepicker';
import { MatFormField, MatLabel, MatOption, MatSelect } from '@angular/material/select';

@Component({
    selector: 'app-full-calendar-sidebar',
    imports: [
        MatCalendar,
        MatSelect,
        MatFormField,
        MatOption,
        MatLabel
    ],
    providers: [
        {
          provide: MAT_DATE_RANGE_SELECTION_STRATEGY,
          useClass: DefaultMatCalendarRangeStrategy
        },
        DefaultMatCalendarRangeStrategy,
        MatRangeDateSelectionModel
    ],
    templateUrl: './full-calendar-sidebar.component.html',
    styleUrl: './full-calendar-sidebar.component.scss'
})
export class FullCalendarSidebarComponent {
    private readonly selectionModel = inject(MatRangeDateSelectionModel<Date>);
    private readonly selectionStrategy = inject(DefaultMatCalendarRangeStrategy<Date>);

    public selectedDate = model.required<DateRange<Date>>();

    rangeChanged(selectedDate: Date) {
        const selection = this.selectionModel.selection, newSelection = this.selectionStrategy.selectionFinished(
            selectedDate,
            selection
        );
        this.selectionModel.updateSelection(newSelection, this);
        
        if (this.selectionModel.isComplete()) {
            console.log("COMPLETE")
            this.selectedDate.set(new DateRange<Date>(newSelection.start, newSelection.end));
        }
    }
}
