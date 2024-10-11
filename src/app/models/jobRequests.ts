import { JobResponse } from './jobResponse';
import { User } from './user';
import { Transactions } from './transactions';
export class JobRequests {
  constructor(
    public id: number,
    public verified: Boolean,
    public verifiedUser: User,
    public paid: Boolean,
    public visible: Boolean,
    public amount: number,
    public candidate: User,
    public job: JobResponse,
    public status: String,
    public request: String,
    public rejectReason: String,
    public transactions: Transactions,
    public cv: string,
    public filterTags: string,
    public downloadCheck: Boolean
  ) {}
}
