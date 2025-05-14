import { Injectable } from '@angular/core';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root',
})
export class DateService {
  private timezone = '';
  constructor() {}

  public format(date: Date, format: string) {
    return dayjs(date).format(format);
  }
}
