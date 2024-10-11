import { Authority } from './authority';
import { CategoryResponse } from './categoryResponse';
import { Role } from './role';
import { RoleName } from './roleName';
import { UserDataResponse } from './userDataResponse';

export class UserResponse {
  constructor(
    public id: number,
    public username: string,
    public name: string,
    public gender: string,
    public mobile: string,
    public email: string,
    public verified: boolean,
    public enabled: boolean,
    public locked: boolean,
    public verifiedUserId: number,
    public category: CategoryResponse,
    // public subCategory: SubCategoryResponse,
    public commissionAmount: number,
    public roles: Role[],
    public role: RoleName,
    public userData: UserDataResponse[],
    public addressLine1: string,
    public addressLine2: string,
    public city: string,
    public state: string,
    public country: string,
    public pin: string,
    public uniqueId: string,
    public image: string,
    public landmark: string,
    public authorities: Authority[],
    public createdAt: string,
    public updatedAt: string
  ) {}
}
