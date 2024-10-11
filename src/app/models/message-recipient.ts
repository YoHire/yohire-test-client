import { Message } from './message';
import { User } from './user';

export class MessageRecipient {
  constructor(
    public id: number,
    public user: User,
    public message: Message,
    public isSeen: boolean
  ) {}
}
