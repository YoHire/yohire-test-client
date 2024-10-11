import { LiveAnnouncer } from '@angular/cdk/a11y';
import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  ViewChild,
  inject,
} from '@angular/core';
import * as XLSX from 'xlsx';

import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatChipInputEvent, MatChipEditedEvent } from '@angular/material/chips';
import { IAngularMyDpOptions, IMyDateModel } from 'angular-mydatepicker-ivy';
import { IDropdownSettings } from 'ng-multiselect-dropdown';
import { formatDate, Location, ViewportScroller } from '@angular/common';
import {
  Observable,
  Subject,
  debounceTime,
  distinctUntilChanged,
  min,
  switchMap,
} from 'rxjs';
import { CategoryResponse } from 'src/app/models/categoryResponse';
import { Skill } from 'src/app/models/skill';
import { CategoryService } from 'src/app/services/category.service';
import { GeneralService } from 'src/app/services/general.service';
import { SkillService } from 'src/app/services/skill.service';
import { NotificationService } from 'src/app/services/notification.service';
import { JobService } from 'src/app/services/job.service';
import { environment } from 'src/environments/environment.prod';
import { ActivatedRoute, Router } from '@angular/router';
import { JobSkillService } from 'src/app/services/job-skill.service';
import { CURRENCIES } from 'src/app/constants/constants';
import { trackByItemId } from 'src/app/utils/track-by.utils';
import { EducationService } from 'src/app/services/education.service';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-add-job',
  templateUrl: './add-job.component.html',
  styleUrls: ['./add-job.component.scss'],
})
export class AddJobComponent {
  loading = false;
  loginUser: string = '';
  autocomplete!: google.maps.places.Autocomplete;
  venueAutocomplete!: google.maps.places.Autocomplete;
  @ViewChild('autocompleteJobTitle') public autocompleteJobTitle: any;
  private searchKeywordSubject = new Subject<string>();
  @ViewChild('categInput') categInput!: ElementRef<HTMLInputElement>;
  @ViewChild('readWriteInput') readWriteInput!: ElementRef<HTMLInputElement>;
  @ViewChild('speakInput') speakInput!: ElementRef<HTMLInputElement>;
  @ViewChild('skillsInput') skillsInput!: ElementRef<HTMLInputElement>;
  selectedOptions: any = [];
  trackByItemId = trackByItemId;
  filteredOptions: any;
  selectedIndex: any;
  subCat: any;

  jobId: number = 0;
  job: any | undefined;
  isEdit: boolean = false;
  categories: any;
  submitting: boolean = false;
  currentCategory: string = '';
  currentSkill: string = '';
  currentLanguagesReadWrite: string = '';
  currentLanguagesSpeak: string = '';
  previousJobs: CategoryResponse[] = [];
  selectedCategories: Set<{ id: number; name: string }> = new Set();
  selectedLanguagesReadWrite: Set<{ id: number; name: string }> = new Set();
  selectedLanguagesSpeak: Set<{ id: number; name: string }> = new Set();
  generalLanguagesReadWrite: Set<{ id: number; name: string }> = new Set();
  generalLanguagesSpeak: Set<{ id: number; name: string }> = new Set();
  selectedSkills: Set<{ id: number; name: string }> = new Set();
  jobForm!: FormGroup;
  companyForm: FormGroup;
  jobs: any[] = [];
  highlightTags: any[] = [];
  languagesReadWrite: any;
  languagesSpeak: any[] = [];
  selectedJob: any | null = null;
  skills: any;
  subCategories: any;
  selectedSubCategory: any;
  selectedCourse: any;
  courses: any;
  dropdownSettings: IDropdownSettings = {
    singleSelection: false,
    idField: 'id',
    textField: 'name',
    enableCheckAll: false,
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    defaultOpen: false,
    allowSearchFilter: true,
    allowRemoteDataSearch: true,
    limitSelection: 5,
  };
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
  isCompanyFormEdit = false;
  minWeight: number = 30;
  maxWeight: number = 130;
  minAge: number = 18;
  maxAge: number = 65;
  minHeight: number = 100;
  maxHeight: number = 255;
  addOnBlur = true;
  company: string = '';
  currentJob: any = 1;
  isInitialFormCompleted = false;
  isEditing: boolean = false;
  announcer = inject(LiveAnnouncer);
  dateOptions: IAngularMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    minYear: new Date().getFullYear(),
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() - 1,
    },
  };
  dateOptionsInterview: IAngularMyDpOptions = {
    dateFormat: 'dd/mm/yyyy',
    minYear: new Date().getFullYear(),
    disableUntil: {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
      day: new Date().getDate() - 1,
    },
  };
  cities: any;

  formGroup: FormGroup | undefined;
  selectedLevel: any;
  completeFormSubmitted = false;
  currencies = CURRENCIES;
  constructor(
    private activatedRoute: ActivatedRoute,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private generalService: GeneralService,
    private skillService: SkillService,
    private notificationService: NotificationService,
    private jobService: JobService,
    private zone: NgZone,
    public pageLocation: Location,
    private router: Router,
    private jobSkillService: JobSkillService,
    private educationService: EducationService,
    private authService: AuthService
  ) {
    window.angularComponentRef = {
      component: this,
      zone: this.zone,
    };

    this.companyForm = this.fb.group({
      company: [null, Validators.required],
      location: [null, Validators.required],
      description: [null],
      generalMinAge: [18],
      generalMaxAge: [65],
      generalMinHeight: [100],
      generalMaxHeight: [255],
      generalMinWeight: [30],
      generalMaxWeight: [130],
      interviewDate: [null],
      expiryDate: [null],
      targetLocation: [null],
    });
    this.jobForm = this.fb.group({
      title: [null, Validators.required],
      salary: [null, Validators.required],
      description: [null],
      currency: ['Select Currency'],
      minAge: [18],
      maxAge: [65],
      minHeight: [100],
      maxHeight: [255],
      minWeight: [30],
      maxWeight: [130],
      interviewDate: [null],
      expiryDate: [null, [Validators.required]],
      requirementCount: [null],
      qualifications: this.fb.array([
        this.fb.group({
          selectedLevel: [''],
          selectedSubCategory: [''],
          selectedCourse: [''],
          subCategories: [[]],
          courses: [[]],
        }),
      ]),
    });
    this.activatedRoute.params.subscribe((params) => {
      this.jobId = params['id'];
      if (this.jobId) {
        this.isEdit = true;
        this.getJob();
        this.jobSkillList();
      }
    });
    this.selectedOptions = new Array(this.fieldSets.length)
      .fill({})
      .map(() => ({}));
  }
  get qualifications(): FormArray {
    return this.jobForm.get('qualifications') as FormArray;
  }

  addQualification() {
    const qualificationGroup = this.fb.group({
      selectedLevel: [''],
      selectedSubCategory: [''],
      selectedCourse: [''],
      subCategories: [[]],
      courses: [[]],
    });
    this.qualifications.push(qualificationGroup);
  }

  removeQualification(index: number) {
    this.qualifications.removeAt(index);
  }

  onLevelChange(event: any, index: number) {
    const selectedLevel = event?.value;
    const qualification = this.qualifications.at(index);
    if (['BELOW 10th', 'SSLC', 'HIGHER SECONDARY'].includes(selectedLevel)) {
      qualification.patchValue({
        selectedLevel: selectedLevel,
        selectedSubCategory: null,
        selectedCourse: null,
        subCategories: [],
        courses: [],
      });
      return;
    }
    const levelMapping: { [key: string]: string } = {
      'UNDER GRADUATE (UG)': 'UG',
      'POST GRADUATE (PG)': 'PG',
      DIPLOMA: 'Diploma',
      Phd: 'PHD',
      ITI: 'ITI',
    };
    const mappedLevel = levelMapping[selectedLevel] || selectedLevel;
    if (!this.isEdit) {
      qualification.patchValue({
        selectedLevel: selectedLevel,
        selectedSubCategory: null,
        selectedCourse: null,
        subCategories: [],
        courses: [],
      });
    }
    this.getEducation(mappedLevel, index);
  }

  onSubCategoryChange(event: any, index: number) {
    const selectedSubCategory = event?.value?.subCategory;
    const qualification = this.qualifications.at(index);
    qualification.patchValue({
      selectedSubCategory: qualification.value.selectedSubCategory,
      selectedCourse: this.isEdit ? qualification.value.selectedCourse : null,
    });
    if (selectedSubCategory) {
      this.fetchCourses(
        qualification.value.selectedLevel,
        selectedSubCategory,
        index
      );
    }
  }

  onCourseChange(event: any, index: number) {
    const qualification = this.qualifications.at(index);
    qualification.patchValue({
      selectedCourse: qualification.value.selectedCourse,
    });
  }

  private fetchCourses(level: string, subCategory: string, index: number) {
    const levelMapping: { [key: string]: string } = {
      'UNDER GRADUATE (UG)': 'UG',
      'POST GRADUATE (PG)': 'PG',
      DIPLOMA: 'Diploma',
      Phd: 'PHD',
      ITI: 'ITI',
    };
    const mappedLevel = levelMapping[level] || level;

    this.educationService.list(mappedLevel, subCategory).subscribe({
      next: (response: any) => {
        const courses = response.data[0]?.courses || [];
        this.qualifications.at(index).patchValue({ courses: courses });
        this.generalService.loaded();
      },
      error: () => this.generalService.loaded(),
    });
  }

  private getEducation(level: string, index: number) {
    this.generalService.startLoading();
    this.educationService.list(level).subscribe({
      next: async (response: any) => {
        if (['PHD', 'Diploma', 'ITI'].includes(level)) {
          this.qualifications.at(index).patchValue({
            courses: response.data[0]?.courses || [],
          });
        } else {
          this.qualifications.at(index).patchValue({
            subCategories: response.data || [],
          });

          if (this.isEdit) {
            const subCategories = response.data;
            const selectedSubCategory = this.qualifications
              .at(index)
              .get('selectedSubCategory')?.value;

            for (let subCategoryObj of subCategories) {
              if (subCategoryObj.subCategory === selectedSubCategory) {
                this.qualifications.at(index).patchValue({
                  selectedSubCategory: subCategoryObj,
                  courses: subCategoryObj.courses || [],
                });
                break;
              }
            }
            await this.onSubCategoryChange(
              {
                value: this.qualifications.at(index).get('selectedSubCategory')
                  ?.value,
              },
              index
            );
          }
        }
        this.generalService.loaded();
      },
      error: () => this.generalService.loaded(),
    });
  }
  getJob() {
    this.generalService.startLoading();
    this.jobService.getJob(this.jobId).subscribe({
      next: (items: any) => {
        this.job = items.data;
        this.selectedCategories = new Set(this.job.category);
        this.edit(this.job);
        this.generalService.loaded();
      },
    });
  }

  async edit(job: any) {
    this.minWeight = job.minWeight;
    this.maxWeight = job.maxWeight;
    this.minAge = job.minAge;
    this.maxAge = job.maxAge;
    this.minHeight = job.minHeight;
    this.maxHeight = job.maxHeight;
    this.highlightTags = job.highlightTags.map((name: any) => ({ name }));
    this.selectedLanguagesSpeak = new Set(
      job.languagesSpeak.map((name: any) => ({ name }))
    );
    this.selectedLanguagesReadWrite = new Set(
      job.languagesReadWrite.map((name: any) => ({
        name,
      }))
    );
    let interviewDate: IMyDateModel = {
      isRange: false,
      singleDate: {
        jsDate: new Date(
          `${job.interviewDate.split('-')[2]}-${
            job.interviewDate.split('-')[1]
          }-${job.interviewDate.split('-')[0]}`
        ),
      },
    };

    let expiryDate: IMyDateModel = {
      isRange: false,
      singleDate: {
        jsDate: new Date(
          `${job.expiryDate.split('-')[2]}-${job.expiryDate.split('-')[1]}-${
            job.expiryDate.split('-')[0]
          }`
        ),
      },
    };
    if (job?.category.length > 0) {
      this.selectedCategories = new Set(job.category);
    }
    this.company = job?.company;
    this.companyForm = this.fb.group({
      company: [job?.company, Validators.required],
      location: [job?.location, Validators.required],
      targetLocation: [job?.targetLocation],
    });

    this.jobForm = this.fb.group(
      {
        title: [job?.title, Validators.required],
        salary: [job?.salary, Validators.required],
        description: [job?.description],
        currency: [job?.currency ?? 'Select Currency'],
        minAge: [job?.minAge],
        maxAge: [job?.maxAge],
        minHeight: [job?.minHeight],
        maxHeight: [job?.maxHeight],
        minWeight: [job?.minWeight],
        maxWeight: [job?.maxWeight],
        interviewDate: [interviewDate],
        expiryDate: [expiryDate, Validators.required],
        requirementCount: [job?.requirementCount],
        qualifications: this.fb.array([]),
      },
      {
        validator: this.currencyValidator,
      }
    );

    const qualificationsArray = this.jobForm.get('qualifications') as FormArray;
    qualificationsArray.clear();

    for (const [index, qual] of (job.qualification || []).entries()) {
      await this.processQualification(qual, index);
    }
  }
  private async processQualification(qual: any, index: number) {
    const levelMapping: { [key: string]: string } = {
      UG: 'UNDER GRADUATE (UG)',
      PG: 'POST GRADUATE (PG)',
      DIPLOMA: 'Diploma',
      Phd: 'PHD',
      ITI: 'ITI',
    };
    const level = levelMapping[qual.category] || qual.category;
    const qualificationGroup = this.fb.group({
      selectedLevel: [level],
      selectedSubCategory: [qual.subCategory || ''],
      selectedCourse: [qual.course || ''],
      subCategories: [qual.subCategories || []],
      courses: [qual.courses || []],
    });

    const qualificationsArray = this.jobForm.get('qualifications') as FormArray;
    qualificationsArray.push(qualificationGroup);

    await this.onLevelChange({ value: level }, index);
  }

  currencyValidator(control: AbstractControl) {
    const salary = control.get('salary')?.value;
    const currency = control.get('currency')?.value;
    if (
      salary !== 'Salary Based On Experience' &&
      salary !== 'Salary Negotiable' &&
      currency === 'Select Currency'
    ) {
      control.get('currency')?.setErrors({ required: true });
    } else {
      control.get('currency')?.setErrors(null);
    }

    return null;
  }

  jobSkillList() {
    this.generalService.startLoading();
    this.jobSkillService.list(this.jobId, 'ACTIVE').subscribe({
      next: (item: any) => {
        this.selectedSkills = new Set(item.data);
        this.generalService.loaded();
      },
    });
  }

  ngOnInit() {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.loadGoogleMapsScript();
  }
  initMap() {
    const input = document.getElementById('pac-input') as HTMLInputElement;
    const venueInput = document.getElementById(
      'venue-input'
    ) as HTMLInputElement;

    if (
      !(input instanceof HTMLInputElement) ||
      !(venueInput instanceof HTMLInputElement)
    ) {
      console.error('Inputs not found or not HTMLInputElement');
      return;
    }

    const options = {
      types: ['geocode'],
    };

    let isPlaceSelected = false;

    this.autocomplete = new google.maps.places.Autocomplete(input, options);
    this.autocomplete.addListener('place_changed', () => {
      const place = this.autocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        return;
      }
      const formattedAddress = this.constructFormattedAddress(place);
      this.companyForm.patchValue({ location: formattedAddress });
      isPlaceSelected = true;
    });

    input.addEventListener('input', () => {
      isPlaceSelected = false;
    });

    input.addEventListener('blur', () => {
      if (!isPlaceSelected) {
        input.value = ''; 
        this.companyForm.patchValue({ location: '' });
      }
    });

    this.venueAutocomplete = new google.maps.places.Autocomplete(
      venueInput,
      options
    );
    this.venueAutocomplete.addListener('place_changed', () => {
      const place = this.venueAutocomplete.getPlace();
      if (!place.geometry || !place.geometry.location) {
        return;
      }
      const formattedAddress = this.constructFormattedAddress(place);
      this.companyForm.patchValue({ targetLocation: formattedAddress });
    });

    venueInput.addEventListener('input', () => {
      isPlaceSelected = false;
    });

    venueInput.addEventListener('blur', () => {
      if (!isPlaceSelected) {
        venueInput.value = '';
        this.companyForm.patchValue({ targetLocation: '' });
      }
    });
  }


  constructFormattedAddress(place: any): string {
    let formattedAddress = '';
    if (place && place.address_components) {
      const addressComponents = place.address_components;
      for (let i = 0; i < addressComponents.length; i++) {
        if (addressComponents[i].types[0] === 'street_number') {
          formattedAddress += addressComponents[i].long_name + ' ';
        } else if (addressComponents[i].types[0] === 'route') {
          formattedAddress += addressComponents[i].long_name + ', ';
        } else if (addressComponents[i].types[0] === 'locality') {
          formattedAddress += addressComponents[i].long_name + ', ';
        } else if (
          addressComponents[i].types[0] === 'administrative_area_level_1'
        ) {
          formattedAddress += addressComponents[i].long_name + ', ';
        } else if (addressComponents[i].types[0] === 'country') {
          formattedAddress += addressComponents[i].long_name;
        }
      }
    }
    return formattedAddress;
  }

  scrollToTop() {
    const element = document.getElementById('scrollToTop');
    element?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
      inline: 'nearest',
    });
  }

  loadGoogleMapsScript() {
    const script = document.createElement('script');
    script.src = environment.googleMapsApi as string;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);
  }
  selectCompanyForm() {
    this.loadGoogleMapsScript();
    this.isCompanyFormEdit = true;
    const {
      description,
      minWeight,
      maxWeight,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      interviewDate,
      expiryDate,
      company,
      location,
      targetLocation,
    } = this.companyForm.value;

    this.companyForm.patchValue({
      description,
      company,
      location,
      targetLocation,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
    });

    this.selectedLanguagesReadWrite = this.generalLanguagesReadWrite;
    this.selectedLanguagesSpeak = this.generalLanguagesSpeak;
  }

  completeInitialForm() {
    this.completeFormSubmitted = true;
    if (this.companyForm.invalid) {
      this.notificationService.showError(
        'Please fill all mandatory field',
        'Failed'
      );
      return;
    }
    this.isInitialFormCompleted = true;
    const { value } = this.companyForm;
    this.jobForm = this.fb.group(
      {
        title: [null, Validators.required],
        salary: [null, Validators.required],
        description: [this.companyForm.value.description],
        currency: ['Select Currency'],
        minAge: [this.companyForm.value.generalMinAge],
        maxAge: [this.companyForm.value.generalMaxAge],
        minHeight: [this.companyForm.value.generalMinHeight],
        maxHeight: [this.companyForm.value.generalMaxHeight],
        minWeight: [this.companyForm.value.generalMinWeight],
        maxWeight: [this.companyForm.value.generalMaxWeight],
        interviewDate: [value.interviewDate],
        expiryDate: [value.expiryDate, [Validators.required]],
        requirementCount: [null],
        selectedLevel: [],
        selectedSubCategory: [],
        selectedCourse: [],
        qualifications: this.fb.array([]),
      },
      {
        validator: this.currencyValidator,
      }
    );
    if (!this.isCompanyFormEdit) {
      this.generalLanguagesReadWrite = structuredClone(
        this.selectedLanguagesReadWrite
      );
      this.generalLanguagesSpeak = structuredClone(this.selectedLanguagesSpeak);
    }

    if (this.isCompanyFormEdit) {
      this.isCompanyFormEdit = false;
    }
    this.completeFormSubmitted = false;
    this.spinner();
    this.scrollToTop();
  }

  spinner() {
    this.loading = true;
    setTimeout(() => {
      this.loading = false;
    }, 2000);
  }

  addJob() {
    this.completeFormSubmitted = true;
    if (this.jobForm.invalid || this.selectedCategories.size < 1) {
      this.notificationService.showError(
        'Please fill all mandatory field',
        'Failed'
      );
      return;
    }
    if (this.qualifications.value) {
      const qualifications = this.qualifications.value;

      const isValid = qualifications.every((qualification: any) => {
        const level = qualification.selectedLevel;
        const hasCourse = !!qualification.selectedCourse;

        if (
          level === 'HIGHER SECONDARY' ||
          level === 'BELOW 10th' ||
          level === 'SSLC'
        ) {
          return true;
        }

        if (level === 'ITI' || level === 'DIPLOMA' || level === 'Phd') {
          return hasCourse;
        }

        return (
          qualification.selectedLevel &&
          qualification.selectedSubCategory &&
          hasCourse
        );
      });

      if (!isValid) {
        this.notificationService.showError(
          'Please ensure that all required fields are filled for selected qualifications.',
          'Validation Failed'
        );
        return;
      }
    }

    this.loading = true;

    const { value } = this.jobForm;
    const formatJobDate = (dateField: any) => {
      if (dateField && dateField.singleDate && dateField.singleDate.jsDate) {
        const jsDate = new Date(dateField.singleDate.jsDate);
        if (!isNaN(jsDate.getTime())) {
          return formatDate(jsDate, 'dd-MM-yyyy', 'en');
        }
      }
      return '';
    };
    const expiryDate = formatJobDate(value.expiryDate);
    const interviewDate = formatJobDate(value.interviewDate);
    const newJob: any = {
      id: this.isEditing ? this.selectedJob.id : this.jobs.length + 1,
      ...value,
      expiryDate,
      interviewDate,
      highlightTags: this.highlightTags ?? [],
      languagesReadWrite: [...this.selectedLanguagesReadWrite],
      languagesSpeak: [...this.selectedLanguagesSpeak],
      categories: [...this.selectedCategories],
      skills: [...this.selectedSkills],
      currency: value.currency === 'Select Currency' ? null : value.currency,
      qualifications: value.qualifications,
    };

    if (this.isEditing) {
      const index = this.jobs.findIndex(
        (job) => job.id === this.selectedJob.id
      );
      if (index !== -1) {
        this.jobs[index] = newJob;
      }
      this.isEditing = false;
    } else {
      this.jobs.push(newJob);
    }
    this.currentJob = this.jobs.length + 1;
    this.resetForm();
    this.spinner();
    this.scrollToTop();
  }

  submitJobs() {
    if (this.isEditing || this.isCompanyFormEdit) {
      this.notificationService.showError(
        'Please save the job before submitting',
        'Failed'
      );
      return;
    }
    if (this.jobs.length < 1) {
      this.notificationService.showError(
        'Please add atleast one job',
        'Failed'
      );
      return;
    }
    if (this.companyForm.invalid) {
      this.notificationService.showError(
        'Please fill all mandatory field',
        'Failed'
      );
      return;
    }
    this.submitting = true;
    const levelMapping: { [key: string]: string } = {
      'UNDER GRADUATE (UG)': 'UG',
      'POST GRADUATE (PG)': 'PG',
      DIPLOMA: 'Diploma',
      Phd: 'PHD',
      ITI: 'ITI',
    };
    const processedJobs = this.jobs.map((job) => {
      const filteredQualifications = job.qualifications.map(
        (qualification: {
          selectedLevel: any;
          selectedSubCategory: any;
          selectedCourse: any;
        }) => ({
          selectedLevel:
            levelMapping[qualification.selectedLevel] ||
            qualification.selectedLevel,
          selectedSubCategory: qualification.selectedSubCategory,
          selectedCourse: qualification.selectedCourse,
        })
      );

      return {
        ...job,
        qualifications: filteredQualifications,
      };
    });

    const companyData = {
      location: this.companyForm.value.location,
      targetLocation: this.companyForm.value.targetLocation,
      company: this.companyForm.value.company,
    };
    this.generalService.startLoading();
    this.jobService.create(processedJobs, companyData).subscribe({
      next: (data: any) => {
        this.router.navigate(['jobs/recruiter/list']);
        this.submitting = false;
        this.notificationService.showSuccess(data.message, 'Success');
        this.generalService.loaded();
      },
    });
  }
  options: any;
  applyOptions(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const binaryString = e.target.result;
      const workbook = XLSX.read(binaryString, { type: 'binary' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      if (excelData.length > 0) {
        this.options = Object.keys(excelData[0] as any);
      } else {
        console.error('Excel sheet is empty or does not contain valid data.');
        this.options = [];
      }
      this.showDialog();
    };

    reader.readAsBinaryString(file);
  }

  onOptionSelect(option: string, index: number, fieldId: string) {
    if (!this.selectedOptions[index]) {
      this.selectedOptions[index] = {};
    }
    this.selectedOptions[index][fieldId] = option;
  }
  fieldSets: any = [
    [
      { id: 'jobTitle', label: 'Job Title' },
      { id: 'salary', label: 'Salary' },
      { id: 'currency', label: 'Currency' },
    ],
    [
      { id: 'description', label: 'Description' },
      { id: 'minHeight', label: 'Min Height' },
      { id: 'maxHeight', label: 'Max Height' },
    ],
    [
      { id: 'minWeight', label: 'Min Weight' },
      { id: 'maxWeight', label: 'Max Weight' },
      { id: 'minAge', label: 'Min Age' },
    ],
    [
      { id: 'maxAge', label: 'Max Age' },
      { id: 'expiryDate', label: 'Expiry Date' },
      { id: 'interviewDate', label: 'Interview Date' },
    ],
    [
      { id: 'jobRoles', label: 'Job Roles' },
      { id: 'jobTags', label: 'Job Tags' },
      { id: 'readWrite', label: 'Read & Write' },
      { id: 'speak', label: 'Speak' },
    ],
  ];
  uploadExcel() {
    // excelData.forEach((row: any) => {
    //   const jobFormData = {
    //     title: row['Title'] || '',
    //     salary: row['Salary'].toString() || null,
    //     description: row['Description'] || '',
    //     expiryDate: row['Expiry Date'] || '',
    //     currency: row['Currency'] || '',
    //   };
    //   this.jobForm.patchValue(jobFormData);
    //   this.selectedCategories.add({
    //     id: row['Job Role'].id,
    //     name: row['Job Role'],
    //   });
    //   this.addJob();
    // });
    // This function could be used to trigger upload process if needed
  }

  saveEdit() {
    this.completeFormSubmitted = true;
    if (
      this.jobForm.invalid ||
      this.selectedCategories.size < 1 ||
      this.companyForm.invalid
    ) {
      this.notificationService.showError(
        'Please fill all mandatory field',
        'Failed'
      );
      return;
    }
    const qualifications = this.jobForm.value.qualifications;
    const isValid = qualifications.every((qualification: any) => {
      const level = qualification.selectedLevel;
      const hasCourse = !!qualification.selectedCourse;

      if (
        level === 'HIGHER SECONDARY' ||
        level === 'BELOW 10th' ||
        level === 'SSLC'
      ) {
        return true;
      }

      if (level === 'ITI' || level === 'DIPLOMA' || level === 'Phd') {
        return hasCourse;
      }
      return (
        qualification.selectedLevel &&
        qualification.selectedSubCategory &&
        hasCourse
      );
    });

    if (!isValid) {
      this.notificationService.showError(
        'Please ensure that all required fields are filled for selected qualifications.',
        'Validation Failed'
      );
      return;
    }
    const job: any = {
      ...this.jobForm.value,
      highlightTags: this.highlightTags ?? [],
      languagesReadWrite: [...this.selectedLanguagesReadWrite],
      languagesSpeak: [...this.selectedLanguagesSpeak],
      categories: [...this.selectedCategories],
      skills: [...this.selectedSkills],
      qualifications: this.jobForm.value.qualifications,
    };

    job.company = this.companyForm.value.company;
    job.targetLocation = this.companyForm.value.targetLocation;
    job.location = this.companyForm.value.location;
    const formatJobDate = (dateField: any) => {
      if (dateField && dateField.singleDate && dateField.singleDate.jsDate) {
        const jsDate = new Date(dateField.singleDate.jsDate);
        if (!isNaN(jsDate.getTime())) {
          return formatDate(jsDate, 'dd-MM-yyyy', 'en');
        }
      }
      return '';
    };

    job.expiryDate = formatJobDate(this.jobForm.value.expiryDate);
    job.interviewDate = formatJobDate(this.jobForm.value.interviewDate);
    const levelMapping: { [key: string]: string } = {
      'UNDER GRADUATE (UG)': 'UG',
      'POST GRADUATE (PG)': 'PG',
      DIPLOMA: 'Diploma',
      Phd: 'PHD',
      ITI: 'ITI',
    };
    const processedQualifications = job.qualifications.map(
      (qualification: {
        selectedLevel: any;
        selectedSubCategory: any;
        selectedCourse: any;
      }) => ({
        selectedLevel:
          levelMapping[qualification.selectedLevel] ||
          qualification.selectedLevel,
        selectedSubCategory: qualification.selectedSubCategory,
        selectedCourse: qualification.selectedCourse,
      })
    );

    const processedJob = {
      ...job,
      qualifications: processedQualifications,
    };

    this.jobService.update(this.jobId, processedJob).subscribe({
      next: (data: any) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.generalService.loaded();
        this.pageLocation.back();
      },
    });
  }
  visible: boolean = false;

  showDialog() {
    this.visible = true;
  }

  selectJob(job: any) {
    const index = this.jobs.findIndex((j) => j.id === job.id);
    this.currentJob = index + 1;
    this.selectedJob = job;
    this.isEditing = true;
    this.isCompanyFormEdit = false;
    const {
      title,
      description,
      minWeight,
      maxWeight,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      categories = [],
      skills = [],
      highlightTags = [],
      languagesSpeak = [],
      languagesReadWrite = [],
      interviewDate,
      expiryDate,
      company,
      salary,
      currency,
      requirementCount,
      qualifications,
    } = job;
    let interviewDateModel: IMyDateModel = {
      isRange: false,
      singleDate: {
        jsDate: new Date(
          `${interviewDate.split('-')[2]}-${interviewDate.split('-')[1]}-${
            interviewDate.split('-')[0]
          }`
        ),
      },
    };

    let expiryDateModel: IMyDateModel = {
      isRange: false,
      singleDate: {
        jsDate: new Date(
          `${expiryDate.split('-')[2]}-${expiryDate.split('-')[1]}-${
            expiryDate.split('-')[0]
          }`
        ),
      },
    };
    let updatedCurrency = currency ?? 'Select Currency';
    const qualificationsArray = this.jobForm.get('qualifications') as FormArray;
    qualificationsArray.clear();
    qualifications.forEach((qual: any) => {
      qualificationsArray.push(
        this.fb.group({
          selectedLevel: [qual.selectedLevel || ''],
          selectedSubCategory: [qual.selectedSubCategory || ''],
          selectedCourse: [qual.selectedCourse || ''],
          subCategories: [qual.subCategories || []],
          courses: [qual.courses || []],
        })
      );
    });

    this.jobForm.patchValue({
      title,
      description,
      company,
      salary,
      currency: updatedCurrency,
      requirementCount,
      minAge,
      maxAge,
      minHeight,
      maxHeight,
      minWeight,
      maxWeight,
      interviewDate: interviewDateModel,
      expiryDate: expiryDateModel,
    });
    this.selectedCategories = new Set(categories);
    this.selectedSkills = new Set(skills);
    this.highlightTags = [...highlightTags];
    this.selectedLanguagesSpeak = new Set(languagesSpeak);
    this.selectedLanguagesReadWrite = new Set(languagesReadWrite);
  }

  deleteJob(job: any) {
    const index = this.jobs.findIndex((j) => j.id === job.id);
    if (index !== -1) {
      this.jobs.splice(index, 1);
    }
    if (!this.isEdit || !this.isEditing) {
      this.currentJob = this.jobs.length + 1;
    }
    if (this.selectedJob && this.selectedJob.id === job.id) {
      this.resetForm();
    }
  }

  resetForm() {
    this.completeFormSubmitted = false;
    this.selectedJob = null;
    this.isEditing = false;
    this.selectedCategories.clear();
    this.selectedSkills.clear();
    this.highlightTags = [];
    this.selectedLanguagesReadWrite = structuredClone(
      this.generalLanguagesReadWrite
    );
    const qualificationsArray = this.jobForm.get('qualifications') as FormArray;
    qualificationsArray.clear();
    this.selectedLanguagesSpeak = structuredClone(this.generalLanguagesSpeak);
    this.jobForm.reset();
    this.jobForm.patchValue({
      currency: 'Select Currency',
      minAge: this.companyForm.value.generalMinAge,
      maxAge: this.companyForm.value.generalMaxAge,
      minHeight: this.companyForm.value.generalMinHeight,
      maxHeight: this.companyForm.value.generalMaxHeight,
      minWeight: this.companyForm.value.generalMinWeight,
      maxWeight: this.companyForm.value.generalMaxWeight,
      description: this.companyForm.value.description,
      expiryDate: this.companyForm.value.expiryDate,
      interviewDate: this.companyForm.value.interviewDate,
    });
  }

  editJob(job: any) {
    this.selectJob(job);
  }
  selected(event: MatAutocompleteSelectedEvent): void {
    if (!event.option.value) return;
    const selectedCategory = event.option.value;

    this.selectedCategories.add({
      id: selectedCategory.id,
      name: selectedCategory.name,
    });
    if (this.categInput) {
      this.categInput.nativeElement.value = '';
    }
    this.currentCategory = '';
    event.option.value = '';
    event.option.deselect();
  }
  selectedSkill(event: MatAutocompleteSelectedEvent): void {
    if (!event.option.value) return;
    const selectedSkill = event.option.value;

    this.selectedSkills.add({
      id: selectedSkill.id,
      name: selectedSkill.name,
    });
    if (this.skillsInput) {
      this.skillsInput.nativeElement.value = '';
    }
    this.currentSkill = '';
    event.option.value = '';
    event.option.deselect();
  }
  selectedLangugagesRw(event: MatAutocompleteSelectedEvent): void {
    if (!event.option.value) return;
    const selectedLanguagesReadWrite = event.option.value;

    this.selectedLanguagesReadWrite.add({
      id: selectedLanguagesReadWrite.id,
      name: selectedLanguagesReadWrite.name,
    });

    if (this.readWriteInput) {
      this.readWriteInput.nativeElement.value = '';
    }
    this.currentLanguagesReadWrite = '';
    event.option.value = '';
    event.option.deselect();
  }
  selectedLangugagesSpeak(event: MatAutocompleteSelectedEvent): void {
    if (!event.option.value) return;
    const selectedLanguagesSpeak = event.option.value;

    this.selectedLanguagesSpeak.add({
      id: selectedLanguagesSpeak.id,
      name: selectedLanguagesSpeak.name,
    });
    if (this.speakInput) {
      this.speakInput.nativeElement.value = '';
    }
    this.currentLanguagesSpeak = '';
    event.option.value = '';
    event.option.deselect();
  }
  onSearchChange(event: any) {
    const keyword = event.target.value;
    if (keyword.length > 0) {
      this.searchKeywordSubject.next(keyword);
      this.searchKeywordSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((keyword) => {
            this.generalService.startLoading();
            return this.categoryService.listBasedOnSearch(keyword);
          })
        )
        .subscribe({
          next: (item: any) => {
            const filteredCategories = item.data.filter((category: any) => {
              let categoryFound = false;
              this.selectedCategories.forEach((selected) => {
                if (selected.name === category.name) {
                  categoryFound = true;
                }
              });
              return !categoryFound;
            });

            this.categories = filteredCategories;
            this.previousJobs = item;
            this.generalService.loaded();
          },
        });
    }
  }
  onSearchSkillsChange(event: any) {
    const keyword = event.target.value;
    if (keyword.length > 0) {
      this.searchKeywordSubject.next(keyword);
      this.searchKeywordSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((keyword) => {
            this.generalService.startLoading();
            return this.skillService.listSkills(keyword);
          })
        )
        .subscribe({
          next: (item: any) => {
            const filteredCategories = item.data.filter((category: any) => {
              let categoryFound = false;
              this.selectedSkills.forEach((selected) => {
                if (selected.name === category.name) {
                  categoryFound = true;
                }
              });
              return !categoryFound;
            });

            this.skills = filteredCategories;
            this.previousJobs = item;
            this.generalService.loaded();
          },
        });
    }
  }
  onSearchLanguagesSpeak(event: any) {
    const keyword = event.target.value;
    if (keyword.length > 0) {
      this.searchKeywordSubject.next(keyword);
      this.searchKeywordSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((keyword) => {
            this.generalService.startLoading();
            return this.jobService.listBasedOnSearch(keyword);
          })
        )
        .subscribe({
          next: (item: any) => {
            const filteredCategories = item.data.filter((category: any) => {
              let categoryFound = false;
              this.selectedLanguagesSpeak.forEach((selected: { name: any }) => {
                if (selected.name === category.name) {
                  categoryFound = true;
                }
              });
              return !categoryFound;
            });

            this.languagesSpeak = filteredCategories;
            this.previousJobs = item;
            this.generalService.loaded();
          },
        });
    }
  }
  onSearchLanguagesReadWriteChange(event: any) {
    const keyword = event.target.value;
    if (keyword.length > 0) {
      this.searchKeywordSubject.next(keyword);
      this.searchKeywordSubject
        .pipe(
          debounceTime(300),
          distinctUntilChanged(),
          switchMap((keyword) => {
            this.generalService.startLoading();
            return this.jobService.listBasedOnSearch(keyword);
          })
        )
        .subscribe({
          next: (item: any) => {
            const filteredCategories = item.data.filter((category: any) => {
              let categoryFound = false;
              this.selectedLanguagesReadWrite.forEach(
                (selected: { name: any }) => {
                  if (selected.name === category.name) {
                    categoryFound = true;
                  }
                }
              );
              return !categoryFound;
            });

            this.languagesReadWrite = filteredCategories;
            this.previousJobs = item;
            this.generalService.loaded();
          },
        });
    }
  }

  removeCategory(categ: { id: number; name: string }): void {
    let foundCategory: { id: number; name: string } | undefined;
    this.selectedCategories.forEach((category) => {
      if (category.id === categ.id || category.name === categ.name) {
        foundCategory = category;
      }
    });

    if (foundCategory) {
      this.selectedCategories.delete(foundCategory);
      this.announcer.announce(`Removed ${foundCategory.name}`);
    }
  }

  removeSkill(skills: { id: number; name: string }): void {
    let foundSkill: { id: number; name: string } | undefined;
    this.selectedSkills.forEach((skill) => {
      if (skill.id === skills.id || skill.name === skills.name) {
        foundSkill = skill;
      }
    });

    if (foundSkill) {
      this.selectedSkills.delete(foundSkill);
      this.announcer.announce(`Removed ${foundSkill.name}`);
    }
  }
  removeLanguagesRw(lang: { id: number; name: string }): void {
    let foundReadWrite: { id: number; name: string } | undefined;
    this.selectedLanguagesReadWrite.forEach((category) => {
      if (category.id === lang.id || category.name === lang.name) {
        foundReadWrite = category;
      }
    });

    if (foundReadWrite) {
      this.selectedLanguagesReadWrite.delete(foundReadWrite);
      this.announcer.announce(`Removed ${foundReadWrite.name}`);
    }
  }
  removeLanguagesSpeak(lang: { id: number; name: string }): void {
    let speak: { id: number; name: string } | undefined;
    this.selectedLanguagesSpeak.forEach((category) => {
      if (category.id === lang.id || category.name === lang.name) {
        speak = category;
      }
    });

    if (speak) {
      this.selectedLanguagesSpeak.delete(speak);
      this.announcer.announce(`Removed ${speak.name}`);
    }
  }

  salaryChangeInput(value: string) {
    this.jobForm.patchValue({
      salary: value,
    });
  }

  add(event: MatChipInputEvent | any, type: string): void {
    const value = (event.value || '').trim();
    if (value) {
      this.highlightTags.push({ name: value });
    }
    event.chipInput!.clear();
  }

  remove(tag: any, type: string): void {
    const index = this.highlightTags.indexOf(tag);
    if (index >= 0) {
      this.highlightTags.splice(index, 1);
      this.announcer.announce(`Removed ${tag}`);
    }
  }

  edits(tag: any, event: MatChipEditedEvent, type: string) {
    const value = event.value.trim();
    if (!value) {
      this.remove(tag, type);
      return;
    }
    const index = this.highlightTags.indexOf(tag);
    if (index >= 0) {
      this.highlightTags[index].name = value;
    }
  }

  onSkillsChange(search: any): any {
    if (search) {
      this.generalService.startLoading();
      this.skillService.listSkills(search.target.value).subscribe({
        next: (items: any) => {
          this.skills = items.data;
          this.generalService.loaded();
        },
      });
    }
  }

  formatLabelWithUnit(): (value: number) => string {
    return (value: number) => `${value}`;
  }
  onMinWeightChange(event: any) {
    this.minWeight = event.value;
  }

  onMaxWeightChange(event: any) {
    this.maxWeight = event.value;
  }
  onMinHeightChange(event: any) {
    this.minHeight = event.value;
  }

  onMaxHeightChange(event: any) {
    this.maxHeight = event.value;
  }
  onMinAgeChange(event: any) {
    this.minAge = event.value;
  }

  onMaxAgeChange(event: any) {
    this.maxAge = event.value;
  }
}
