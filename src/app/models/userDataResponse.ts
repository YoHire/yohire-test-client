import { ValueType } from './valueType';

export class UserDataResponse {
  constructor(
    public item: string,
    public label: string,
    public value: string,
    public valueType: ValueType
  ) {}
}
