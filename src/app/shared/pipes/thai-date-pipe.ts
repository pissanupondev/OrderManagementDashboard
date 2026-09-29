import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'thaiDate',
  standalone: true,
  pure: true
})
export class ThaiDatePipe implements PipeTransform {
  transform(
    value: Date | string | number | null | undefined,
    includeTime: boolean = true
  ): string {
    if (!value) return '-';

    const date = new Date(value);
    if (isNaN(date.getTime())) return '-';

    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const yearBE = date.getFullYear() + 543;

    if (!includeTime) {
      return `${day}/${month}/${yearBE}`;
    }

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${day}/${month}/${yearBE} ${hours}:${minutes} น.`;
  }
}
