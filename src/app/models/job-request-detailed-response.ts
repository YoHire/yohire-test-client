import { JobRequests } from './jobRequests';
import { JobRequestAnswer } from './job_request_answer';
export class JobRequestDetailedResponse {
  constructor(
    public jobRequestResponse: JobRequests,
    public jobRequestAnswerResponse: JobRequestAnswer[]
  ) {}
}
