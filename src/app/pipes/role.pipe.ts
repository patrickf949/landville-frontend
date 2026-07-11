import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  standalone: false,
  name: 'roleTransform'
})
export class RoleTransformPipe implements PipeTransform {
  transform(role: string): string {
    const roles = { CA: 'Client Admin', LA: 'Atterville Admin', BY: 'Buyer' };
    return roles[role];
  }
}
