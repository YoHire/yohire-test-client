export class Countries {
  constructor(
    public name: CountryName,
    public flag: string,
    public currencies: any
  ) {}
}
export class CountryName {
  constructor(public common: string) {}
}
