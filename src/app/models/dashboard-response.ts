export class DashboardResponse {
  constructor(
    public pending: number,
    public running: number,
    public expired: number,
    public mail: number
  ) {}
}
