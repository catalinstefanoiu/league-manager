import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UtilsService {
  // Date and time formatter of user locale
  private dateFormatter = new Intl.DateTimeFormat([], {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  private timeFormatter = new Intl.DateTimeFormat([], {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC',
    // timeZoneName: 'short'
  });

  formatDateLocale(value: Date): string {
    return this.dateFormatter.format(value);
  }

  formatDateTimeLocale(value: Date | number | string): string {
    if (!value) {
      return '';
    }

    let date;
    if (value instanceof Date) {
      date = value;
    } else if (typeof value === 'number') {
      date = new Date(value);
    } else if (typeof value === 'string') {
      const n = Date.parse(value);
      if (isNaN(n)) {
        return '';
      }
      date = new Date(n);
    } else {
      console.error(`invalid argument: ${value} ${typeof value}`);
      return '';
    }
    const d = this.dateFormatter.format(date);
    const t = this.timeFormatter.format(date);
    return `${d} ${t}`;
  }
}
