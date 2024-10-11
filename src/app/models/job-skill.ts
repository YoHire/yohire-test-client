import { JobResponse } from './jobResponse';
import { Skill } from './skill';

export class JobSkill {
  constructor(
    public id: number,
    public job: JobResponse,
    public skill: Skill,
    public status: string
  ) {}
}
