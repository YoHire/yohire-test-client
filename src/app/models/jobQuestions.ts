import { JobQuestionOptionResponse } from './job-question-option-response';
import { QuestionType } from './questionType';

// import { Transactions } from "./transactions";
export class JobQuestions {
  constructor(
    public id: number,
    public question: string,
    public job: string,
    public type: QuestionType,
    public options: JobQuestionOptionResponse[],
    public answer: string,
    public showError: boolean
  ) {}
}
