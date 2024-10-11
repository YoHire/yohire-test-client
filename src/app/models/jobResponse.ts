import { CategoryResponse } from './categoryResponse';
import { SubCategoryResponse } from './subCategoryResponse';
import { UserResponse } from './user-response';

// import { Transactions } from "./transactions";
export class JobResponse {
  constructor(
    public id: number,
    public serialNo: String,
    public recruiter: UserResponse,
    public title: String,
    public description: String,
    public category: CategoryResponse,
    public subCategory: SubCategoryResponse,
    public company: string,
    public country: String,
    public currency: String,
    public salary: String,
    public salaryNegotiable: Boolean,
    public salaryBasedOnExperience: Boolean,
    public qualifications: String,
    public amount: number,
    public contract: String,
    public expiryDate: string,
    public interviewDate: string,
    public interviewVenue: string,
    public location: String,
    public candidateCount: number,
    public appliedCandidateCount: number,
    public verified: Boolean,
    public payment: Boolean,
    public status: String,
    public transactions: String,
    public image: String,
    public filterTags: string,
    public minAge: number,
    public maxAge: number,
    public minHeight: number,
    public maxHeight: number,
    public minWeight: number,
    public maxWeight: number,
    public applicationsCount: number,
    public resumeDownloaded: number
  ) {}
}
