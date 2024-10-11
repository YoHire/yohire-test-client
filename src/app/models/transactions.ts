import { User } from './user';

export class Transactions {
  constructor(
    public id: number,
    public referenceNo: string,
    public number: string,
    public amount: number,
    public user: User,
    public value: String,
    public status: String,
    public createdAt: Date
  ) {}
}
