import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'sort',
  pure: true,
})
export class SortPipe implements PipeTransform {
  transform(list: any[], column: string, direction = 'desc'): any[] {
    let sortedList = list.sort((a, b) => {
      if (a[column] < b[column]) {
        return direction === 'desc' ? 1 : -1;
      } else if (a[column] > b[column]) {
        return direction === 'desc' ? -1 : 1;
      } else {
        return 0;
      }
    });
    return sortedList;
  }
}
