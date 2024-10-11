import { Component, inject, TemplateRef, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CircleService } from 'src/app/services/circle.service';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
import { MatDialog } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/services/auth.service';
import {
  MatSnackBar,
  MatSnackBarHorizontalPosition,
  MatSnackBarVerticalPosition,
} from '@angular/material/snack-bar';
import { InvitationSnackBarComponent } from 'src/app/general/invitation-snack-bar/invitation-snack-bar.component';
import { Dropdown } from 'primeng/dropdown';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search-list',
  templateUrl: './search-list.component.html',
})
export class SearchListComponent {
  @ViewChild('genderDropdown') genderDropdown!: Dropdown;
  @ViewChild('salaryRangeDropdown') salaryRangeDropdown!: Dropdown;
  @ViewChild('levelDropdown') levelDropdown!: Dropdown;
  @ViewChild('subCategoryDropdown') subCategoryDropdown!: Dropdown;
  @ViewChild('courseDropdown') courseDropdown!: Dropdown;
  private searchSubject = new Subject<string>();
  skills: any[] = [];
  selectedSkills: any[] = [];
  selectedLanguagesReadAndWrite: any[] = [];
  languagesReadAndWrite: any[] = [];
  selectedLanguagesSpeak!: any;
  languagesSpeak: any[] = [];
  xLink: string | null = null;
  linkedInLink: string | null = null;
  githubLink: string | null = null;
  websiteLink: string | null = null;
  facebookLink: string | null = null;
  instagramLink: string | null = null;
  visible: boolean = false;
  profileVisible: boolean = false;
  suggestions: any[] = [];
  minExperience: number = 0;
  maxExperience: number = 30;
  minAge: number = 18;
  maxAge: number = 65;
  searchQuery: string = '';
  searchResults: any[] = [];
  searchedProfiles: any[] = [];
  highlightedIndex: number = -1;
  subCategory: any;
  coinAmount!: number;
  loading: boolean = true;
  userId: any;
  valueColor: string = 'Gold';
  @ViewChild('callAPIDialog')
  callAPIDialog!: TemplateRef<any>;
  coinForm!: FormGroup;
  gstAmount: number = 1.18;
  userData: any = this.authService.currentUserValue?.user;
  selectedProfiles: any[] = [];
  invitationVisible: boolean = false;
  selectedJob: string = '';
  jobForm!: FormGroup;
  filterVisible: boolean = false;
  filterForm!: FormGroup;
  selectedUserProfile: any;
  course: any;
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;
  private _snackBar = inject(MatSnackBar);
  debounceTimer: any;
  levels = [
    'BELOW 10th',
    'SSLC',
    'HIGHER SECONDARY',
    'UNDER GRADUATE (UG)',
    'POST GRADUATE (PG)',
    'ITI',
    'DIPLOMA',
    'Phd',
  ];
  countries: any;
  selectedCountries: any;
  selectedGender = '';
  gender: Array<{ label: string; value: string }> = [
    { label: 'Male', value: 'Male' },
    { label: 'Female', value: 'Female' },
    { label: 'Other', value: 'Other' },
  ];
  salaryRanges: Array<{ label: string; value: string }> = [
    { label: 'Less than $50,000', value: '0-50000' },
    { label: '$50,000 - $100,000', value: '50000-100000' },
    { label: '$100,000 - $200,000', value: '100000-200000' },
    { label: '$200,000 - $500,000', value: '200000-500000' },
    { label: 'More than $500,000', value: '500000+' },
  ];
  horizontalPosition: MatSnackBarHorizontalPosition = 'end';
  verticalPosition: MatSnackBarVerticalPosition = 'bottom';
  allSelectLabel: any;

  constructor(
    private route: ActivatedRoute,
    private circleService: CircleService,
    public dialog: MatDialog,
    private authService: AuthService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.listCountries();
    this.initJobForm();
    this.initFilterForm();
    this.handleQueryParams();
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((keyword) => {
        if (!keyword) {
          this.searchResults = [];
          return;
        }
        this.circleService.searchResumes(keyword).subscribe({
          next: (items: any) => {
            this.searchResults = items?.data ? [...items.data] : [];
            this.highlightedIndex = -1;
          },
        });
      });
  }
  initJobForm() {
    this.jobForm = this.fb.group({
      jobTitle: ['', Validators.required],
      jobDescription: [''],
    });
  }
  initFilterForm() {
    this.filterForm = this.fb.group({
      qualifications: this.fb.group({
        level: [''],
        subCategory: [''],
        course: [''],
      }),
      selectedSkills: [[]],
      experiences: this.fb.group({
        minExperience: [0],
        maxExperience: [30],
        experienceTargetingCountries: [],
      }),
      age: this.fb.group({
        minAge: [18],
        maxAge: [65],
      }),
      targetedCountry: [null],
      selectedLanguagesReadAndWrite: [[]],
      selectedLanguagesSpeak: [[]],
      gender: [null],
      salaryRange: [null],
    });
  }

  handleQueryParams() {
    this.route.queryParams.subscribe((params) => {
      this.searchQuery = params['q'] || '';
      if (this.searchQuery) {
        this.onSearchedProfiles(this.searchQuery);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.onSearchedProfiles(this.searchQuery, this.filterForm.value);
  }
  clearFilters() {
    this.filterForm.patchValue({
      qualifications: {
        level: null,
        subCategory: null,
        course: null,
      },
      experiences: {
        minExperience: 0,
        maxExperience: 30,
        experienceTargetingCountries: [],
      },
      age: {
        minAge: 18,
        maxAge: 65,
      },
      selectedSkills: [],
      selectedLanguagesReadAndWrite: [],
      selectedLanguagesSpeak: [],
      gender: null,
      salaryRange: null,
      targetedCountry: null,
    });
    this.clearDropdowns();
    this.selectedProfiles = [];
    this.subCategory = [];
    this.course = [];
    this.minExperience = 0;
    this.maxExperience = 30;
    this.currentPage = 1;
    const filterData = { ...this.filterForm.value };

    if (
      this.filterForm.get('age.maxAge')?.value ||
      this.filterForm.get('age.minAge')?.value
    ) {
      delete filterData.age;
    }

    if (
      this.filterForm.get('experiences.maxExperience')?.value ||
      this.filterForm.get('experiences.minExperience')?.value
    ) {
      delete filterData.experiences;
    }

    this.onSearchedProfiles(this.searchQuery, filterData);
  }
  clearDropdowns() {
    const dropdowns = [
      this.levelDropdown,
      this.subCategoryDropdown,
      this.courseDropdown,
      this.genderDropdown,
      this.salaryRangeDropdown,
    ];

    dropdowns.forEach((dropdown) => {
      if (dropdown) {
        dropdown.clear();
      }
    });
  }

  onSearch(event: any): void {
    const keyword = event.target.value?.trim();
    this.searchSubject.next(keyword);
  }

  onExperienceChange(event: any, field: string) {
    field === 'minExperience'
      ? (this.minExperience = event.value)
      : (this.maxExperience = event.value);
  }
  onAgeChange(event: any, field: string) {
    field === 'minAge'
      ? (this.minAge = event.value)
      : (this.maxAge = event.value);
  }
  onLevelChange(event: any): void {
    const selectedLevel = event?.value;
    if (['BELOW 10th', 'SSLC', 'HIGHER SECONDARY'].includes(selectedLevel)) {
      this.resetSubCategoryAndCourse();
      this.filterForm.get('qualifications')?.patchValue({
        level: selectedLevel,
      });
      return;
    }
    if (['ITI', 'DIPLOMA', 'Phd'].includes(selectedLevel)) {
      this.resetSubCategoryAndCourse();
      const levelToSend = selectedLevel === 'Phd' ? 'PHD' : selectedLevel;
      this.filterForm.get('qualifications')?.patchValue({
        level: levelToSend,
        subCategory: null,
      });
      if (selectedLevel === 'DIPLOMA') {
        this.fetchCourses('Diploma', '');
      } else {
        this.fetchCourses(levelToSend, '');
      }
      return;
    }

    const levelMapping: Record<string, string> = {
      'UNDER GRADUATE (UG)': 'UG',
      'POST GRADUATE (PG)': 'PG',
    };

    const mappedLevel = levelMapping[selectedLevel];
    if (mappedLevel) {
      this.fetchSubCategory(mappedLevel);
    }
  }
  private fetchSubCategory(level: string): void {
    this.filterForm.get('qualifications')?.patchValue({
      level: level,
    });

    this.circleService.filterQualifications(level).subscribe({
      next: (response: any) => {
        this.subCategory = response.data;
        this.filterForm.get('qualifications')?.patchValue({
          subCategory: null,
          course: null,
        });
        this.course = [];
      },
    });
  }
  onSubCategoryChange(event: any): void {
    const selectedSubCategory = event?.value?.subCategory;
    const selectedLevel = this.filterForm.get('qualifications')?.value.level;
    if (selectedSubCategory) {
      this.filterForm.get('qualifications')?.patchValue({
        subCategory: selectedSubCategory,
        course: null,
      });
      this.fetchCourses(selectedLevel, selectedSubCategory);
    }
  }

  private fetchCourses(level: string, subCategory: string): void {
    this.circleService.filterQualifications(level, subCategory).subscribe({
      next: (response: any) => {
        this.course = response.data[0]?.courses || [];
      },
    });
  }

  onCourseChange(event: any): void {
    const selectedCourse = event?.value;
    if (selectedCourse) {
      this.filterForm.get('qualifications')?.patchValue({
        course: selectedCourse,
      });
    }
  }
  formatLabelWithUnitExp(): (value: number) => string {
    return (value: number) => `${value} yr`;
  }
  formatLabelWithUnit(): (value: number) => string {
    return (value: number) => `${value}`;
  }

  private resetSubCategoryAndCourse(): void {
    this.filterForm.get('qualifications')?.patchValue({
      subCategory: null,
      course: null,
    });
    this.subCategory = [];
    this.course = [];
  }

  onSkillsChange(event: any): void {
    if (!event?.value) {
      return;
    }
    this.circleService.listSkills(event?.value).subscribe({
      next: (response: any) => {
        this.skills = response.data.map((skill: any) => ({
          name: skill.name,
        }));
      },
    });
  }

  listCountries() {
    this.circleService.listCountries().subscribe({
      next: (response: any) => {
        this.countries = response.data;
        this.filterForm
          .get('experiences.experienceTargetingCountries')
          ?.patchValue(this.countries);
      },
    });
  }

  onLanguagesChange(event: any, field: string): void {
    if (!event?.value) {
      return;
    }
    this.circleService.listBasedOnSearch(event?.value).subscribe({
      next: (response: any) => {
        const updatedLanguages = response.data.map((language: any) => ({
          name: language.name,
        }));
        if (field === 'languagesReadAndWrite') {
          this.languagesReadAndWrite = updatedLanguages;
        } else if (field === 'languagesSpeak') {
          this.languagesSpeak = updatedLanguages;
        }
      },
    });
  }

  openSnackBar() {
    this._snackBar.openFromComponent(InvitationSnackBarComponent, {
      horizontalPosition: this.horizontalPosition,
      verticalPosition: this.verticalPosition,
      data: {
        message: 'Invitation has been sent!',
        link: '/invitations',
        linkText: 'View Invitations',
      },
      duration: 5000,
    });
  }

  onSearchedProfiles(searchName: string, filterForm?: any) {
    const keyword = searchName.trim();
    if (this.searchQuery !== keyword) {
      this.searchQuery = keyword;
      this.clearFilters();
    }

    if (!keyword) {
      this.searchResults = [];
      this.searchedProfiles = [];
      this.loading = false;
      return;
    }
    this.searchResults = [];
    this.searchedProfiles = [];
    this.loading = true;

    if (!this.authService.isLoggedIn()) {
      setTimeout(() => {
        this.searchedProfiles = this.getMockedProfiles();
        this.loading = false;
      }, 1000);
      return;
    }
    clearTimeout(this.debounceTimer);

    this.debounceTimer = setTimeout(() => {
      this.circleService
        .searchedProfiles(
          keyword,
          this.currentPage,
          this.itemsPerPage,
          filterForm
        )
        .subscribe({
          next: (items: any) => {
            this.searchedProfiles = items?.data ? [...items.data] : [];
            if (this.searchedProfiles.length === 0) {
              this.suggestions = items.suggestions;
            }
            this.totalPages = Math.ceil(items.totalItems / this.itemsPerPage);
            this.highlightedIndex = -1;
            this.loading = false;
          },
        });
    }, 500);
  }
  getMockedProfiles(): any[] {
    return [
      {
        Users: {
          id: '237c2f19-c3dd-4a2e-94b3-43a19f8e25ba',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'John Doe',
        },
        downloads: [],
      },
      {
        Users: {
          id: 'cb15d32f-9301-48d4-a21b-de6e6b9df0ff',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'Jane Smith',
        },
        downloads: [],
      },
      {
        Users: {
          id: 'cb15d32f-9301-48d4-a21b-de6e6b9df1ff',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'Jane Smith',
        },
        downloads: [],
      },
      {
        Users: {
          id: 'cb15d32f-9301-48d4-a21b-de6e6b9df2ff',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'Jane Smith',
        },
        downloads: [],
      },
      {
        Users: {
          id: 'cb15d32f-9301-48d4-a21b-de6e6b9df3ff',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'Jane Smith',
        },
        downloads: [],
      },
      {
        Users: {
          id: 'cb15d32f-9301-48d4-a21b-de6e6b9df4ff',
          profileImage: 'https://cdn.wallpapersafari.com/20/42/kwC3Z9.jpg',
          username: 'Jane Smith',
        },
        downloads: [],
      },
    ];
  }

  onKeydown(event: KeyboardEvent) {
    if (this.searchResults.length === 0) {
      return;
    }
    if (event.key === 'ArrowDown') {
      this.highlightedIndex =
        (this.highlightedIndex + 1) % this.searchResults.length;
    } else if (event.key === 'ArrowUp') {
      this.highlightedIndex =
        (this.highlightedIndex - 1 + this.searchResults.length) %
        this.searchResults.length;
    } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
      this.onSearchedProfiles(this.searchResults[this.highlightedIndex].name);
    }
  }

  onFetchDialogProfile(profileId: string, queueId: string) {
    if (!this.authService.isLoggedIn()) {
      this.showDialog('login');
      return;
    }
    this.profileVisible = !this.profileVisible;
    this.selectedUserProfile = this.searchedProfiles.find(
      (profile) => profile.Users?.id === profileId
    );
    if (!this.selectedUserProfile) {
      this.selectedUserProfile = this.suggestions.find(
        (profile) => profile.Users?.id === profileId
      );
    }
    this.calculateRelevancy(this.selectedUserProfile);
    this.extractSocialLinks();
    this.circleService.queueProfileClicked(queueId).subscribe();
  }
  extractSocialLinks() {
    const socialLinks = this.selectedUserProfile?.Users?.socialLinks || [];
    this.xLink =
      socialLinks.find((link: { name: string }) => link.name === 'X')?.link ||
      null;
    this.linkedInLink =
      socialLinks.find((link: { name: string }) => link.name === 'LINKEDIN')
        ?.link || null;
    this.githubLink =
      socialLinks.find((link: { name: string }) => link.name === 'GITHUB')
        ?.link || null;
    this.websiteLink =
      socialLinks.find((link: { name: string }) => link.name === 'WEBSITE')
        ?.link || null;
    this.facebookLink =
      socialLinks.find((link: { name: string }) => link.name === 'FACEBOOK')
        ?.link || null;
    this.instagramLink =
      socialLinks.find((link: { name: string }) => link.name === 'INSTAGRAM')
        ?.link || null;
  }

  onFetchUserDetail(profileId: any) {
    if (!this.authService.isLoggedIn()) {
      this.showDialog('login');
      return;
    }
    let selectedProfile = this.searchedProfiles.find(
      (profile) => profile.Users?.id === profileId
    );
    if (!selectedProfile) {
      selectedProfile = this.suggestions.find(
        (profile) => profile.Users?.id === profileId
      );
    }
    if (selectedProfile) {
      this.toggleProfileSelection(selectedProfile);
    }
  }
  showDialog(type: string) {
    type === 'login' ? (this.visible = true) : (this.invitationVisible = true);
  }
  onDialogClose() {
    this.visible = false;
  }
  async downloadProfile(users: any[]) {
    for (const user of users) {
      await this.downloadPdf(user);
    }
    this.refreshSearchResults();
  }

  calculateRelevancy(userProfile: any): number {
    const filterFormValue = this.filterForm.value;
    const ageWeight = 10;
    const experienceWeight = 20;
    const genderWeight = 2.5;
    const targetedCountryWeight = 2.5;
    const readWriteLanguageWeight = 10;
    const speakLanguageWeight = 5;
    const skillWeight = 30;
    const qualificationWeight = 15;
    const experiencedCountriesWeight = 5;

    let relevancyScore = 0;

    const userAge = this.getAge(userProfile.Users.dateOfBirth);

    if (
      userAge >= filterFormValue.age.minAge &&
      userAge <= filterFormValue.age.maxAge
    ) {
      relevancyScore += ageWeight;
    }

    const totalExperience = userProfile.Users.workExperience.reduce(
      (
        acc: number,
        exp: {
          startDate: string | number | Date;
          endDate: string | number | Date;
          designation: string;
        }
      ) => {
        if (
          exp.designation.toLowerCase().includes(this.searchQuery.toLowerCase())
        ) {
          const experienceYears = this.calculateExperienceYears(
            new Date(exp.startDate),
            exp.endDate ? new Date(exp.endDate) : new Date()
          );
          return acc + experienceYears;
        }
        return acc;
      },
      0
    );

    const normalizeCountryName = (countryName: string) => {
      return countryName
        .replace(/([\uD800-\uDBFF][\uDC00-\uDFFF])/g, '')
        .trim();
    };

    const userExperienceCountries = userProfile.Users.workExperience.map(
      (exp: any) => normalizeCountryName(exp.country)
    );

    let selectedExperienceCountries = [];

    if (filterFormValue.experiences.experienceTargetingCountries !== 'ALL') {
      selectedExperienceCountries = filterFormValue.experiences
        .experienceTargetingCountries
        ? filterFormValue.experiences.experienceTargetingCountries.map(
            (country: { name: any }) => country.name
          )
        : [];

      selectedExperienceCountries =
        selectedExperienceCountries.map(normalizeCountryName);
    }

    if (filterFormValue.experiences.experienceTargetingCountries === 'ALL') {
      relevancyScore += experiencedCountriesWeight;
    } else {
      const matchingExperienceCountriesCount =
        selectedExperienceCountries.reduce(
          (count: any, selectedCountry: any) => {
            const occurrences = userExperienceCountries.filter(
              (userCountry: any) => userCountry === selectedCountry
            ).length;
            return count + occurrences;
          },
          0
        );

      if (
        matchingExperienceCountriesCount > 0 &&
        userExperienceCountries.length > 0
      ) {
        const effectiveExperienceCountriesWeight =
          (experiencedCountriesWeight / userExperienceCountries.length) *
          matchingExperienceCountriesCount;
        relevancyScore += Math.min(
          effectiveExperienceCountriesWeight,
          experiencedCountriesWeight
        );
      }
    }

    if (
      totalExperience >= filterFormValue.experiences.minExperience &&
      totalExperience <= filterFormValue.experiences.maxExperience
    ) {
      relevancyScore += experienceWeight;
    }

    if (
      userProfile.Users.gender &&
      userProfile.Users.gender.toLowerCase() ===
        filterFormValue.gender?.toLowerCase()
    ) {
      relevancyScore += genderWeight;
    }
    if (
      Array.isArray(userProfile.interestedCountries) &&
      userProfile.interestedCountries.includes(filterFormValue.targetedCountry)
    ) {
      relevancyScore += targetedCountryWeight;
    }

    const userLanguagesWrite = userProfile.Users.languagesWrite || [];
    const selectedReadAndWriteLanguages =
      filterFormValue.selectedLanguagesReadAndWrite?.map(
        (lang: { name: any }) => lang.name
      ) || [];

    const matchingReadWriteLanguagesCount =
      selectedReadAndWriteLanguages.filter((lang: any) =>
        userLanguagesWrite.includes(lang)
      ).length;

    if (matchingReadWriteLanguagesCount > 0 && userLanguagesWrite.length > 0) {
      const effectiveReadWriteWeight =
        (readWriteLanguageWeight / userLanguagesWrite.length) *
        matchingReadWriteLanguagesCount;
      relevancyScore += Math.min(
        effectiveReadWriteWeight,
        readWriteLanguageWeight
      );
    }

    const userLanguagesSpeak = userProfile.Users.languagesRead || [];
    const selectedSpeakLanguages = Array.isArray(
      filterFormValue.selectedLanguagesSpeak
    )
      ? filterFormValue.selectedLanguagesSpeak.map(
          (lang: { name: any }) => lang.name
        )
      : [];

    const speakMatchesCount = selectedSpeakLanguages.filter((lang: any) =>
      userLanguagesSpeak.includes(lang)
    ).length;

    if (speakMatchesCount > 0 && userLanguagesSpeak.length > 0) {
      const effectiveSpeakWeight =
        (speakLanguageWeight / userLanguagesSpeak.length) * speakMatchesCount;
      relevancyScore += Math.min(effectiveSpeakWeight, speakLanguageWeight);
    }

    const userSkills = userProfile.Users.skills || [];
    const selectedSkills = filterFormValue.selectedSkills.map(
      (skill: { name: any }) => skill.name
    );

    const matchingSkillsCount = selectedSkills.filter((skill: any) =>
      userSkills.includes(skill)
    ).length;

    if (matchingSkillsCount > 0) {
      const effectiveSkillWeight = (skillWeight / 5) * matchingSkillsCount;
      relevancyScore += Math.min(effectiveSkillWeight, skillWeight);
    }
    const qualificationMatches = this.checkQualificationMatch(
      userProfile.Users.qualification,
      filterFormValue.qualifications
    );

    if (qualificationMatches) {
      relevancyScore += qualificationWeight;
    }
    const relevancyScoreUpdate = Math.floor(relevancyScore);

    this.valueColor = this.getColorBasedOnScore(relevancyScore);

    return relevancyScoreUpdate;
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
  private calculateExperienceYears(startDate: Date, endDate: Date): number {
    const end = endDate || new Date();
    const diffTime = Math.abs(end.getTime() - startDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.round(diffYears * 10) / 10;
  }

  getAge(dateOfBirth: string): number {
    const dob = new Date(dateOfBirth);
    const diffMs = Date.now() - dob.getTime();
    const ageDt = new Date(diffMs);
    return Math.abs(ageDt.getUTCFullYear() - 1970);
  }

  getTotalExperience(experiences: any[]): number {
    let totalExperience = 0;
    experiences.forEach((exp) => {
      const startDate = new Date(exp.startDate);
      const endDate = exp.endDate ? new Date(exp.endDate) : new Date();
      const diff = endDate.getFullYear() - startDate.getFullYear();
      totalExperience += diff;
    });
    return totalExperience;
  }

  checkArrayMatch(arr1: string[], arr2: string[]): boolean {
    return arr1.some((item) => arr2.includes(item));
  }

  checkQualificationMatch(
    userQualifications: any[],
    filterQualification: any
  ): boolean {
    return userQualifications.some(
      (qualification) =>
        qualification.category === filterQualification.level &&
        qualification.subCategory === filterQualification.subCategory &&
        filterQualification.course.includes(qualification.course)
    );
  }

  downloadPdf(profile: any) {
    return new Promise<void>((resolve) => {
      const doc = new jsPDF({
        format: 'A4',
      });
      const logo = new Image();
      logo.crossOrigin = environment.gCloudOrigin as string;
      logo.src =
        profile.Users?.profileImage || '/assets/img/blank-profile.webp';
      logo.onload = () => {
        const pageWidth = doc.internal.pageSize.getWidth();
        const pageHeight = doc.internal.pageSize.getHeight();
        const margin = 20;
        let currentY = margin;

        const addPage = () => {
          doc.addPage();
          currentY = margin;
        };

        const checkPageHeight = (
          currentY: number,
          additionalHeight: number
        ) => {
          if (currentY + additionalHeight > pageHeight - margin) {
            addPage();
          }
        };

        const logoBase64 = getBase64Image(logo, 0.2);
        const imageX = margin;
        const imageY = margin;
        const imageWidth = 35;
        const imageHeight = 35;
        doc.addImage(
          logoBase64,
          'PNG',
          imageX,
          imageY,
          imageWidth,
          imageHeight
        );

        currentY += imageHeight + 10;

        doc.setFontSize(18);
        doc.setTextColor(40, 40, 40);
        doc.text(
          profile?.Users?.username + ' ' + profile?.Users?.surname,
          margin,
          currentY
        );

        currentY += 10;
        doc.setFontSize(12);
        doc.setTextColor(100, 100, 100);
        doc.text('Mobile: ' + profile?.Users?.mobile, margin, currentY);
        currentY += 5;
        doc.text('Email: ' + profile?.Users?.email, margin, currentY);
        currentY += 5;
        doc.text('Address: ' + profile?.Users?.address, margin, currentY);
        currentY += 5;
        doc.text(
          `DOB: ${this.formatDate(profile?.Users?.dateOfBirth)}`,
          margin,
          currentY
        );
        currentY += 5;
        if (profile?.Users?.resumeLink) {
          const linkText = 'View Resume';
          const resumeLink = profile?.Users?.resumeLink || '#';

          const prefixText = 'Resume: ';
          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);

          doc.setTextColor(0, 0, 255);
          doc.textWithLink(linkText, margin + prefixWidth, currentY, {
            url: resumeLink,
          });

          const linkWidth = doc.getTextWidth(linkText);
          doc.setDrawColor(0, 0, 255);
          doc.line(
            margin + prefixWidth,
            currentY + 0.5,
            margin + prefixWidth + linkWidth,
            currentY + 0.5
          );
        }
        if (
          profile?.Users?.drivingLicense ||
          profile?.Users?.drivingLicenseBack
        ) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const drivingLicense = profile?.Users?.drivingLicense || '#';
          const drivingLicenseBack = profile?.Users?.drivingLicenseBack || '#';
          const prefixText = `Driving License: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (profile?.Users?.drivingLicense) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: drivingLicense,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (
            profile?.Users?.drivingLicense &&
            profile?.Users?.drivingLicenseBack
          ) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (profile?.Users?.drivingLicenseBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: drivingLicenseBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }
        if (
          profile?.Users?.intlDrivingLicense ||
          profile?.Users?.intlDrivingLicenseBack
        ) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const intlDrivingLicense = profile?.Users?.intlDrivingLicense || '#';
          const intlDrivingLicenseBack =
            profile?.Users?.intlDrivingLicenseBack || '#';
          const prefixText = `Intl Driving License: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (profile.Users?.intlDrivingLicense) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: intlDrivingLicense,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (
            profile.Users?.intlDrivingLicense &&
            profile.Users?.intlDrivingLicenseBack
          ) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (profile?.Users?.intlDrivingLicenseBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: intlDrivingLicenseBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }
        if (
          profile?.Users?.passportPhoto ||
          profile?.Users?.passportPhotoBack
        ) {
          currentY += 5;
          const frontLinkText = 'Front';
          const separatorText = ' | ';
          const backLinkText = 'Back';
          const passportPhoto = profile?.Users?.passportPhoto || '#';
          const passportPhotoBack = profile?.Users?.passportPhotoBack || '#';
          const prefixText = `Passport Photo: `;

          doc.setTextColor(100, 100, 100);
          doc.text(prefixText, margin, currentY);

          const prefixWidth = doc.getTextWidth(prefixText);
          let currentXPosition = margin + prefixWidth;
          doc.setTextColor(0, 0, 255);

          if (profile?.Users?.passportPhoto) {
            doc.textWithLink(frontLinkText, currentXPosition, currentY, {
              url: passportPhoto,
            });
            const frontLinkWidth = doc.getTextWidth(frontLinkText);

            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + frontLinkWidth,
              currentY + 0.5
            );

            currentXPosition += frontLinkWidth;
          }

          if (
            profile?.Users?.passportPhoto &&
            profile?.Users?.passportPhotoBack
          ) {
            doc.setTextColor(0, 0, 0);
            doc.text(separatorText, currentXPosition, currentY);
            const separatorWidth = doc.getTextWidth(separatorText);
            currentXPosition += separatorWidth;
          }

          if (profile?.Users?.passportPhotoBack) {
            doc.setTextColor(0, 0, 255);
            doc.textWithLink(backLinkText, currentXPosition, currentY, {
              url: passportPhotoBack,
            });
            const backLinkWidth = doc.getTextWidth(backLinkText);
            doc.setDrawColor(0, 0, 255);
            doc.line(
              currentXPosition,
              currentY + 0.5,
              currentXPosition + backLinkWidth,
              currentY + 0.5
            );
          }
        }

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Personal Information', margin, currentY);
        doc.setLineWidth(0.5);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, currentY + 2, 80, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        const personalInfo = [
          `Passport No: ${profile?.Users?.passportNumber}`,
          `Passport Expiry Date: ${this.formatDate(
            profile?.Users?.passportExpiryDate
          )}`,
          `ECR: ${profile?.Users?.ecr ? 'Required' : 'Not Required'}`,
          `Height: ${profile?.Users?.height}`,
          `Weight: ${profile?.Users?.weight}`,
          `Gender: ${profile?.Users?.gender}`,
          profile?.Users?.maritialStatus
            ? `Marital Status: ${profile?.Users?.maritialStatus}`
            : '',
        ];
        personalInfo.forEach((info) => {
          checkPageHeight(currentY, 6);
          doc.text(info, margin, currentY);
          currentY += 6;
        });

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Skills', margin, currentY);
        doc.line(margin, currentY + 2, 40, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        let currentX = margin;
        profile.Users.skill.forEach(
          (skill: { name: string }, index: number) => {
            const skillText =
              index === profile.Users.skill.length - 1
                ? skill.name
                : skill.name + ', ';
            const skillWidth = doc.getTextWidth(skillText);

            if (currentX + skillWidth > pageWidth - margin) {
              currentY += 6;
              currentX = margin;
            }

            doc.text(skillText, currentX, currentY);
            currentX += skillWidth;
          }
        );

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Languages Read & Write', margin, currentY);
        doc.line(margin, currentY + 2, 40, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);

        currentX = margin;
        const languagesWrite = profile.Users.languagesWrite.join(', ');

        languagesWrite
          .split(', ')
          .forEach(
            (
              language: string | number,
              index: number,
              array: string | any[]
            ) => {
              const languageText =
                language + (index < array.length - 1 ? ', ' : '');
              const languageWidth = doc.getTextWidth(languageText);

              if (currentX + languageWidth > pageWidth - margin) {
                currentY += 6;
                currentX = margin;
              }

              doc.text(languageText, currentX, currentY);
              currentX += languageWidth;
            }
          );

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Languages Speak', margin, currentY);
        doc.line(margin, currentY + 2, 40, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);

        currentX = margin;
        const languagesRead = profile.Users.languagesRead.join(', ');

        languagesRead
          .split(', ')
          .forEach(
            (
              language: string | number,
              index: number,
              array: string | any[]
            ) => {
              const languageText =
                language + (index < array.length - 1 ? ', ' : '');
              const languageWidth = doc.getTextWidth(languageText);

              if (currentX + languageWidth > pageWidth - margin) {
                currentY += 6;
                currentX = margin;
              }

              doc.text(languageText, currentX, currentY);
              currentX += languageWidth;
            }
          );

        currentY += 10;

        doc.setFontSize(16);
        doc.setTextColor(0, 0, 0);
        doc.text('Education', margin, currentY);
        doc.setDrawColor(0, 0, 0);
        doc.line(margin, currentY + 2, 55, currentY + 2);
        currentY += 10;

        doc.setFontSize(12);
        doc.setTextColor(80, 80, 80);
        const sortedEducation = profile.Users.education.sort(
          (
            a: { completedDate: string | number | Date },
            b: { completedDate: string | number | Date }
          ) => {
            const dateA = new Date(a.completedDate);
            const dateB = new Date(b.completedDate);
            return dateB.getTime() - dateA.getTime();
          }
        );

        sortedEducation.forEach(
          (
            edu: {
              institution: any;
              course: any;
              completedDate: any;
              certificate: any;
            },
            index: number
          ) => {
            checkPageHeight(currentY, 40);

            doc.setTextColor(0, 0, 0);
            doc.text(`Institution: ${edu.institution}`, margin, currentY + 5);
            doc.text(`Course: ${edu.course}`, margin, currentY + 10);
            doc.text(
              `Completed On: ${this.formatDate(edu.completedDate)}`,
              margin,
              currentY + 15
            );

            currentY += 20;

            if (edu.certificate) {
              const linkText = 'View Certificate';
              const resumeLink = edu?.certificate || '#';

              const prefixText = 'Certificate: ';
              doc.setTextColor(0, 0, 0);
              doc.text(prefixText, margin, currentY);

              const prefixWidth = doc.getTextWidth(prefixText);

              doc.setTextColor(0, 0, 255);
              doc.textWithLink(linkText, margin + prefixWidth, currentY, {
                url: resumeLink,
              });

              const linkWidth = doc.getTextWidth(linkText);
              doc.setDrawColor(0, 0, 255);
              doc.line(
                margin + prefixWidth,
                currentY + 0.5,
                margin + prefixWidth + linkWidth,
                currentY + 0.5
              );

              currentY += 18;

              doc.setTextColor(0, 0, 0);
              doc.setDrawColor(0, 0, 0);
            }
          }
        );

        currentY += 10;
        if (
          profile.Users.workExperience &&
          profile.Users.workExperience.length > 0
        ) {
          const presentExperience = profile.Users.workExperience.filter(
            (experience: { endDate: any }) =>
              this.formatDate(experience.endDate) === '01-01-1900'
          );
          const pastExperience = profile.Users.workExperience.filter(
            (experience: { endDate: any }) =>
              this.formatDate(experience.endDate) !== '01-01-1900'
          );

          pastExperience.sort(
            (
              a: { endDate: string | number | Date },
              b: { endDate: string | number | Date }
            ) => {
              const dateA = new Date(a.endDate);
              const dateB = new Date(b.endDate);
              return dateB.getTime() - dateA.getTime();
            }
          );

          const sortedExperience = [...presentExperience, ...pastExperience];

          doc.setFontSize(16);
          doc.setTextColor(0, 0, 0);
          doc.text('Work Experience', margin, currentY);
          doc.setDrawColor(0, 0, 0);
          doc.line(margin, currentY + 2, 70, currentY + 2);
          currentY += 10;
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);

          sortedExperience.forEach(
            (
              experience: {
                companyName: string | string[];
                designation: string | string[];
                startDate: any;
                endDate: any;
                certificate: any;
              },
              index: number
            ) => {
              checkPageHeight(currentY, 40);

              doc.setTextColor(0, 0, 0);

              const endDate = this.formatDate(experience.endDate);
              const isPresent = endDate === '01-01-1900';

              doc.text(
                `Company Name: ${experience.companyName}${
                  isPresent ? ' (Present)' : ''
                }`,
                margin,
                currentY + 5
              );
              doc.text(
                `Designation: ${experience.designation}`,
                margin,
                currentY + 10
              );
              doc.text(
                `Start Date: ${this.formatDate(experience.startDate)}`,
                margin,
                currentY + 15
              );

              if (!isPresent) {
                doc.text(`End Date: ${endDate}`, margin, currentY + 20);
                currentY += 25;
              } else {
                currentY += 20;
              }

              if (experience.certificate) {
                const linkText = 'View Certificate';
                const certificateLink = experience?.certificate || '#';

                const prefixText = 'Certificate: ';
                doc.setTextColor(0, 0, 0);
                doc.text(prefixText, margin, currentY);

                const prefixWidth = doc.getTextWidth(prefixText);

                doc.setTextColor(0, 0, 255);
                doc.textWithLink(linkText, margin + prefixWidth, currentY, {
                  url: certificateLink,
                });

                const linkWidth = doc.getTextWidth(linkText);
                doc.setDrawColor(0, 0, 255);
                doc.line(
                  margin + prefixWidth,
                  currentY + 0.5,
                  margin + prefixWidth + linkWidth,
                  currentY + 0.5
                );

                currentY += 18;

                doc.setTextColor(0, 0, 0);
                doc.setDrawColor(0, 0, 0);
              }
            }
          );
        }
        const totalHeight = currentY + 20;
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text('Generated By', pageWidth - 50, totalHeight + 10);
        doc.setFontSize(10);
        doc.addImage(
          'assets/img/yohire-logo.png',
          'PNG',
          pageWidth - 30,
          totalHeight + 5,
          20,
          7
        );

        function getBase64Image(img: any, quality: number) {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx: any = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
          return canvas.toDataURL('image/jpeg', quality);
        }
        doc.save(`${profile.Users.username}_Resume.pdf`);
        resolve();
      };
    });
  }
  refreshSearchResults() {
    if (this.searchQuery) {
      const filterData = { ...this.filterForm.value };

      if (
        !this.filterForm.get('age.minAge')?.dirty &&
        !this.filterForm.get('age.minAge')?.touched &&
        !this.filterForm.get('age.maxAge')?.dirty &&
        !this.filterForm.get('age.maxAge')?.touched
      ) {
        delete filterData.age;
      }
      if (
        !this.filterForm.get('experiences.minExperience')?.dirty &&
        !this.filterForm.get('experiences.minExperience')?.touched &&
        !this.filterForm.get('experiences.maxExperience')?.dirty &&
        !this.filterForm.get('experiences.maxExperience')?.touched
      ) {
        delete filterData.experiences;
      }
      this.onSearchedProfiles(this.searchQuery, filterData);
    }
    this.openSnackBar();
  }

  formatDate(dateString: any) {
    const dateParts = dateString.split('T')[0].split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${day}-${month}-${year}`;
  }

  onSelectProfile(profile: any) {
    if (!this.selectedProfiles.includes(profile)) {
      this.selectedProfiles.push(profile);
    }
  }

  toggleProfileSelection(profile: any) {
    const index = this.selectedProfiles.findIndex(
      (p) => p.Users?.id === profile.Users?.id
    );
    if (index > -1) {
      this.selectedProfiles.splice(index, 1);
    } else {
      this.selectedProfiles.push(profile);
    }
  }
  onCancel(field: string) {
    this.jobForm.reset();
    if (field !== 'invitations') {
      this.selectedProfiles = [];
    }
  }

  isProfileSelected(profile: any): boolean {
    return this.selectedProfiles.some((p) => p.Users?.id === profile.Users?.id);
  }

  sendInvitation(): void {
    if (!this.authService.isLoggedIn()) {
      this.visible = !this.visible;
      return;
    }
    if (this.isFormInvalid()) {
      return;
    }
    const queueIds = this.extractUserIds();
    const jobData = this.getJobData();
    this.updateQueue(queueIds, jobData).subscribe({
      next: (items) => this.handleSuccess(items),
    });
  }

  private isFormInvalid(): boolean {
    return this.jobForm.invalid;
  }

  private extractUserIds(): string[] {
    return this.selectedProfiles.map((profile) => profile.id);
  }

  private getJobData(): { jobTitle: string; jobDescription: string } {
    return {
      jobTitle: this.jobForm.get('jobTitle')?.value,
      jobDescription: this.jobForm.get('jobDescription')?.value,
    };
  }

  private updateQueue(
    queueIds: string[],
    jobData: { jobTitle: string; jobDescription: string }
  ) {
    return this.circleService.updateQueueDownload(queueIds, jobData);
  }

  private handleSuccess(items: any): void {
    this.downloadProfile(items.data);
    this.jobForm.reset();
    this.selectedProfiles = [];
    this.invitationVisible = false;
  }
  openFilterDialog() {
    this.filterVisible = true;
  }
  onGenderChange(event: any) {
    const selectedGender = event?.value?.value;
    if (selectedGender) {
      this.filterForm.get('gender')?.patchValue(selectedGender);
    }
  }
  onSalaryRangeChange(event: any) {
    const selectedSalaryRange = event?.value?.value;
    if (selectedSalaryRange) {
      this.filterForm.get('salaryRange')?.patchValue(selectedSalaryRange);
    }
  }
  onCountriesChange(event: any) {
    const selectedTargetedCountry = event?.value?.name;
    if (selectedTargetedCountry) {
      this.filterForm
        .get('targetedCountry')
        ?.patchValue(selectedTargetedCountry);
    }
  }
  applyFilters() {
    const filterData: any = {};
    const formValue = this.filterForm.value;
    const isEmpty = (value: any) =>
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === 'object' && Object.keys(value).length === 0);

    const filterEmpty = (obj: any): any => {
      return Object.entries(obj).reduce((acc: any, [key, value]) => {
        if (Array.isArray(value)) {
          const filtered = value.filter((item) => !isEmpty(item));
          if (filtered.length > 0) {
            if (key === 'course' && filtered.length === 1) {
              acc[key] = filtered[0];
            } else {
              acc[key] = filtered;
            }
          }
        } else if (typeof value === 'object' && value !== null) {
          const filtered = filterEmpty(value);
          if (!isEmpty(filtered)) {
            acc[key] = filtered;
          }
        } else if (!isEmpty(value)) {
          acc[key] = value;
        }
        return acc;
      }, {});
    };

    if (
      formValue.experiences.experienceTargetingCountries &&
      formValue.experiences.experienceTargetingCountries &&
      formValue.experiences.experienceTargetingCountries.length ===
        this.countries.length
    ) {
      formValue.experiences.experienceTargetingCountries = 'ALL';
    }

    Object.assign(filterData, filterEmpty(formValue));

    if (
      !this.filterForm.get('age.minAge')?.dirty &&
      !this.filterForm.get('age.minAge')?.touched &&
      !this.filterForm.get('age.maxAge')?.dirty &&
      !this.filterForm.get('age.maxAge')?.touched
    ) {
      delete filterData.age;
    }

    if (
      !this.filterForm.get('experiences.minExperience')?.dirty &&
      !this.filterForm.get('experiences.minExperience')?.touched &&
      !this.filterForm.get('experiences.maxExperience')?.dirty &&
      !this.filterForm.get('experiences.maxExperience')?.touched
    ) {
      if (filterData.experiences) {
        delete filterData.experiences.minExperience;
        delete filterData.experiences.maxExperience;
        if (isEmpty(filterData.experiences)) {
          delete filterData.experiences;
        }
      }
    }
    this.selectedProfiles = [];
    this.filterVisible = false;
    this.currentPage = 1;
    this.onSearchedProfiles(this.searchQuery, filterData);
  }
}
