import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { UserService } from 'src/app/services/user.service';
import { URL } from 'src/app/constants/constants';
import { Location } from '@angular/common';
import { RoleName } from 'src/app/models/roleName';

@Component({
  selector: 'app-profile-recruiter-view',
  templateUrl: './profile-recruiter-view.component.html',
  styleUrls: ['./profile-recruiter-view.component.scss'],
})
export class ProfileRecruiterViewComponent implements OnInit {
  xLink: string | null = null;
  linkedInLink: string | null = null;
  githubLink: string | null = null;
  websiteLink: string | null = null;
  facebookLink: string | null = null;
  instagramLink: string | null = null;
  imageUrl: string = URL.IMAGE;
  value: number = 0;
  data: any;
  userId: number | null = null;
  loginUser: string = '';
  licenseNo: string = '';
  addContactNo: string = '';
  district: string = '';
  streetAddr: string = '';
  address: string = '';
  bio: string = '';
  town: string = '';
  pin: string = '';
  email: string = '';
  mobile: string = '';
  ra: string = '';
  countryCode: string = '';
  uploadedImageUrls: any[] = [];
  reliabilityScore: string = '';
  valueColor: string = 'Gold';
  showTooltip = false;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private generalService: GeneralService,
    public pageLocation: Location
  ) {}

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    ) {
      this.loginUser = '-admin';
    }

    const currentUser = this.authService.currentUserValue;
    if (currentUser) {
      this.userId = currentUser.user.id;
      this.getUser();
    }
  }

  getUser(): void {
    if (!this.userId) return;
    this.generalService.startLoading();
    this.userService.getUser(this.userId).subscribe({
      next: (response: any) => {
        const {
          ra,
          mobile,
          email,
          image,
          address,
          bio,
          companyImages,
          countryCode,
        } = response.data;
        this.data = response.data;
        this.extractSocialLinks();
        this.ra = ra;
        this.imageUrl = image;
        this.mobile = mobile;
        this.email = email;
        this.bio = bio;
        this.countryCode = countryCode;
        this.uploadedImageUrls = companyImages;
        this.address = address;
        this.calculateReliabilityScore();
        this.generalService.loaded();
      },
    });
  }

  calculateReliabilityScore(): void {
    let score = 0;
    const criteria = [
      { value: this.ra, weight: 20 },
      { value: this.mobile, weight: 20 },
      { value: this.address, weight: 10 },
      { value: this.bio, weight: 10 },
      { value: this.uploadedImageUrls.length, weight: 20 },
      { value: this.data.socialLinks.length, weight: 20 },
    ];
    criteria.forEach((criterion) => {
      if (typeof criterion.value === 'number') {
        score += (criterion.value / 5) * criterion.weight;
      } else if (criterion.value) {
        score += criterion.weight;
      }
    });
    this.value = Math.min(score, 100);
    this.reliabilityScore = `Your Reliability Score is ${this.value}%`;
    this.valueColor = this.getColorBasedOnScore(this.value);
  }

  getColorBasedOnScore(score: number): string {
    if (score >= 80) {
      return 'Green';
    } else if (score >= 60) {
      return 'Orange';
    } else if (score >= 40) {
      return 'Yellow';
    } else {
      return 'Red';
    }
  }

  extractSocialLinks() {
    const socialLinks = this.data?.socialLinks || [];
    this.xLink =
      socialLinks.find((link: { platform: string }) => link.platform === 'X')
        ?.url || null;
    this.linkedInLink =
      socialLinks.find(
        (link: { platform: string }) => link.platform === 'LINKEDIN'
      )?.url || null;
    this.githubLink =
      socialLinks.find(
        (link: { platform: string }) => link.platform === 'GITHUB'
      )?.url || null;
    this.websiteLink =
      socialLinks.find(
        (link: { platform: string }) => link.platform === 'WEBSITE'
      )?.url || null;
    this.facebookLink =
      socialLinks.find(
        (link: { platform: string }) => link.platform === 'FACEBOOK'
      )?.url || null;
    this.instagramLink =
      socialLinks.find(
        (link: { platform: string }) => link.platform === 'INSTAGRAM'
      )?.url || null;
  }
}
