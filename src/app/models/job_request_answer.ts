import { JobRequests } from './jobRequests';

export class JobRequestAnswer {
  constructor(
    public id: number,
    public question: String,
    public answer: String,
    public answerType: String,
    public status: String,
    public JobRequest: JobRequests
  ) {}
}
