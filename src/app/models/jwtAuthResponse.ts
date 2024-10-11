import { User } from './user';

export class JwtAuthResponse {
  constructor(
    public accessToken: string,
    public refreshToken: string,
    public tokenType: string,
    public user: User
  ) {}
}
