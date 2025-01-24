import { Component, inject, model, signal } from '@angular/core';
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
    private readonly selectionStrategy = inject(DefaultMatCalendarRangeStrategy<Date>);
    private readonly selectionModel = inject(MatRangeDateSelectionModel<Date>);

    public selectedDateRange = model.required<DateRange<Date>>();
    
    public selectedDateRange2 = signal<DateRange<Date>>(new DateRange<Date>(new Date(), new Date()));
    
    rangeChanged(selectedDate: DateRange<Date>) {
        const selection = this.selectionModel.selection,
            newSelection = this.selectionStrategy.selectionFinished(
                selectedDate,
                selection
            );
    
        this.selectionModel.updateSelection(newSelection, this);
        const newSelect = new DateRange<Date>(
            newSelection.start,
            newSelection.end
        );
        console.log(newSelect)
        if (this.selectionModel.isComplete()) {
            // this.selectedDate?.set(newSelect);
            // this.selectedDate?.set(newSelect)
        }

      }

    // rangeChanged(selectedDate: Date) {

        // const selection = this.matCalendar().


        // const selection = this.selectionModel.selection, newSelection = this.selectionStrategy.selectionFinished(
        //     selectedDate,
        //     selection
        // );
        // this.selectionModel.updateSelection(newSelection, this);
    
        // if (this.selectionModel.isComplete()) {
        //     console.log("COMPLETE")
        //     this.selectedDateRange.set(new DateRange<Date>(newSelection.start, newSelection.end));
        // }
    // }
           
}   
