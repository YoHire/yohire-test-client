import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { CircleService } from 'src/app/services/circle.service';
import { NotificationService } from 'src/app/services/notification.service';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

import {
  mobileNumberValidator,
  passwordMatchValidator,
} from 'src/app/validators/custom-validators';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  animations: [
    trigger('tooltipAnimation', [
      state('visible', style({ opacity: 1 })),
      state('hidden', style({ opacity: 0 })),
      transition('hidden => visible', [animate('300ms 500ms')]),
      transition('visible => hidden', [animate('300ms')]),
    ]),
  ],
})
export class SearchComponent implements OnInit {
  private searchSubject = new Subject<string>();
  private intervalId: any;
  highlightedIndex: number = -1;
  circleWorkVisible: boolean = false;
  showBubble = true;
  searchQuery = '';
  loginForm!: FormGroup;
  searchResults: any[] = [];
  visible = false;
  btnDisplay = true;
  submitted = false;
  addForm!: FormGroup;
  show: boolean = false;
  tnc = false;
  newPassword = '';
  isRegisterMode = false;
  recentSearches: string[] = [];
  safeURL: any;
  tooltipState = 'hidden';

  constructor(
    private circleService: CircleService,
    private router: Router,
    private authService: AuthService,
    private fb: FormBuilder,
    private notificationService: NotificationService
  ) {}
  ngOnInit(): void {
    this.initializeForms();
    if (!this.authService.isLoggedIn()) {
      this.startInterval();
    }
    this.btnDisplay = !this.authService.isLoggedIn();
    this.recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );
    this.searchSubject
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((keyword) => {
        if (!keyword) {
          this.searchResults = [];
          return;
        }
        const filteredRecentSearches = this.recentSearches.filter((search) =>
          search.toLowerCase().includes(keyword.toLowerCase())
        );
        const recentSearchesToShow = filteredRecentSearches.slice(0, 3);
        this.circleService.searchResumes(keyword).subscribe({
          next: (items) => {
            const results = items?.data || [];
            this.searchResults = [
              ...recentSearchesToShow.map((search) => ({
                name: search,
                recent: true,
              })),
              ...results,
            ];
            this.highlightedIndex = -1;
          },
        });
      });
  }

  startInterval() {
    this.intervalId = setInterval(() => {
      this.showBubble = !this.showBubble;
      this.tooltipState = this.showBubble ? 'visible' : 'hidden';
    }, 5000);
  }

  stopTimer() {
    if (this.intervalId) {
      this.circleWorkVisible = !this.circleWorkVisible;
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.showBubble = false;
      this.tooltipState = 'hidden';
    }
  }

  onKeydown(event: KeyboardEvent): void {
    const resultsLength = this.searchResults.length;
    if (resultsLength === 0) return;

    if (event.key === 'ArrowDown') {
      this.highlightedIndex = (this.highlightedIndex + 1) % resultsLength;
    } else if (event.key === 'ArrowUp') {
      this.highlightedIndex =
        (this.highlightedIndex - 1 + resultsLength) % resultsLength;
    } else if (event.key === 'Enter' && this.highlightedIndex >= 0) {
      this.selectResult(this.searchResults[this.highlightedIndex].name);
    }
  }

  ngOnDestroy() {
    this.stopTimer();
  }

  private initializeForms(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    this.addForm = this.fb.group(
      {
        ra: ['', Validators.required],
        mobile: [
          '',
          [
            Validators.required,
            Validators.pattern('^[0-9]{10}$'),
            mobileNumberValidator(),
          ],
        ],
        email: ['', [Validators.required, Validators.email]],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=[^A-Z]*[A-Z])(?=[^a-z]*[a-z])(?=\D*\d)(?=.*[!@#$%^&*]).{8,}$/
            ),
          ],
        ],
        cPassword: ['', Validators.required],
      },
      { validators: passwordMatchValidator }
    );
  }
  isFormVisible = false;

  toggleChatbox() {
    this.isFormVisible = !this.isFormVisible;
  }

  create(): void {
    this.submitted = true;
    if (this.addForm.invalid) {
      this.notificationService.showError('Please fill all fields', 'Failed');
      return;
    }

    const { cPassword, ...user } = this.addForm.value;
    this.authService.recruiter(user).subscribe({
      next: (data) => {
        this.notificationService.showSuccess(data.message, 'Success');
        this.resetForm();
      },
    });
  }

  showDialog() {
    this.visible = true;
  }

  private resetForm(): void {
    this.isRegisterMode = false;
    this.addForm.reset();
    this.submitted = false;
    this.tnc = false;
    this.newPassword = '';
  }

  login(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      this.notificationService.showError(
        'Please check your credentials and try again.',
        'Invalid Form'
      );
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService.signin(email, password).subscribe();
  }

  tncChecked() {
    this.tnc = !this.tnc;
  }

  toggleMode(): void {
    this.isRegisterMode = !this.isRegisterMode;
    if (this.isRegisterMode) {
      this.initializeForms();
    }
    this.submitted = false;
  }

  onSearch(event: Event): void {
    const keyword = (event.target as HTMLInputElement).value.trim();
    this.searchSubject.next(keyword);
  }

  private updateRecentSearches(keyword: string): void {
    if (!this.recentSearches.includes(keyword)) {
      this.recentSearches.unshift(keyword);
      if (this.recentSearches.length > 10) {
        this.recentSearches.pop();
      }
      if (!this.authService.isLoggedIn()) {
        localStorage.setItem(
          'recentSearches',
          JSON.stringify(this.recentSearches)
        );
      }
    }
  }
  validateNumber(event: KeyboardEvent): void {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  onDialogClose() {
    this.visible = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.showBubble = false;
      this.tooltipState = 'hidden';
    }
  }
  onSignInSuccess() {
    this.btnDisplay = false;
    this.onDialogClose();
  }
  selectResult(resultName: string): void {
    this.updateRecentSearches(resultName);
    this.searchResults = [];
    this.router.navigate(['/circle/search'], {
      queryParams: { q: resultName },
    });
  }
  saveSearchToLocalStorage(searchQuery: string) {
    let recentSearches = JSON.parse(
      localStorage.getItem('recentSearches') || '[]'
    );
    if (!recentSearches.includes(searchQuery)) {
      recentSearches.unshift(searchQuery);
      recentSearches = recentSearches.slice(0, 10);
      localStorage.setItem('recentSearches', JSON.stringify(recentSearches));
    }
  }
  loadRecentSearches(): string[] {
    return JSON.parse(localStorage.getItem('recentSearches') || '[]');
  }
  removeRecentSearch(name: string): void {
    if (!this.authService.isLoggedIn()) {
      this.recentSearches = this.recentSearches.filter(
        (search) => search !== name
      );
      localStorage.setItem(
        'recentSearches',
        JSON.stringify(this.recentSearches)
      );
      this.searchResults = this.searchResults.filter(
        (result) => result.name !== name
      );
    }
  }
}
