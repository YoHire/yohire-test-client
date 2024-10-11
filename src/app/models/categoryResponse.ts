export class CategoryResponse {
  constructor(
    public id: number,
    public name: string,
    public tags: string,
    public status: string,
    public filterTags: string
  ) {}
}
