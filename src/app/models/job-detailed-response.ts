import { JobQuestions } from './jobQuestions';
import { JobResponse } from './jobResponse';
export class JobDetailedResponse {
  constructor(public job: JobResponse, public questions: JobQuestions[]) {}
}
