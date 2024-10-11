import { User } from './user';

export class Message {
  constructor(
    public id: number = 0,
    public creator: User,
    public message: String = '',
    public title: String = '',
    public status: String = '',
    public updatedAt: String = '',
    public isSeen: boolean
  ) {}
}
