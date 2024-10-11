import { Authority } from './authority';
import { CategoryResponse } from './categoryResponse';
import { Role } from './role';
import { RoleName } from './roleName';

export class User {
  constructor(
    public id: number,
    public username: string,
    public password: string,
    public name: string,
    public gender: string,
    public mobile: string,
    public email: string,
    public aadhar: string,
    public verified: boolean,
    public enabled: boolean,
    public locked: boolean,
    public verifiedUserId: number,
    public roles: Role[],
    public role: RoleName,
    public fcmId: string,
    public fbUid: string,
    public commissionAmount: number,
    public authorities: any,
    public addressLine1: string,
    public addressLine2: string,
    public city: string,
    public state: string,
    public country: string,
    public pin: string,
    public uniqueId: string,
    public image: string,
    public landmark: string,
    public age: number,
    public height: number,
    public weight: number,
    public languages: string,
    public qualification: string,
    public skills: string,
    public passportNumber: string,
    public passportValidity: string,
    public yearOfExperience: string,
    public foreignExperience: string,
    public preferredForeignCountry: string,
    public ecr: Boolean,
    public ecnr: Boolean,
    public vaccinationDate: string,
    public createdAt: string,
    public updatedAt: string,
    public category: CategoryResponse | null,
    public kyc: boolean | null
  ) {}
}
