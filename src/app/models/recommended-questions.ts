import { QuestionType } from './questionType';

export class RecommendedQuestions {
  constructor(
    public id: number,
    public question: string,
    public type: QuestionType,
    public options: RecommendedQuestionOption[],
    public selected: boolean
  ) {}
}
export class RecommendedQuestionOption {
  constructor(public option: string) {}
}
