import { User } from './user';

export class TimeLogs {
  constructor(
    public id: number = 0,
    public user: User,
    public title: String = '',
    public status: String = '',
    public createdAt: String = ''
  ) {}
}
