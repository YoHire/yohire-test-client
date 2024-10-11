import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse } from 'src/app/models/apiResponse';
import { DashboardResponse } from 'src/app/models/dashboard-response';
import { RoleName } from 'src/app/models/roleName';
import { User } from 'src/app/models/user';
import { UserResponse } from 'src/app/models/user-response';
import { AuthService } from 'src/app/services/auth.service';
import { URL } from 'src/app/constants/constants';
import { GeneralService } from 'src/app/services/general.service';
import { JobService } from 'src/app/services/job.service';
import { NotificationService } from 'src/app/services/notification.service';
import { UserService } from 'src/app/services/user.service';
import { log } from 'util';

@Component({
  selector: 'app-dashboard-admin',
  templateUrl: './dashboard-admin.component.html',
})
export class DashboardAdminComponent implements OnInit {
  showComplete: boolean = true;
  imageUrl = URL.IMAGE;
  userId: any;
  data: UserResponse | any;
  dashboardData: DashboardResponse | any;
  datas: any;
  totalCounts: any;
  totalCalculatedValues: any;
  sourcePercentages: any;
  options: any;
  totalOptions: any;
  totalGraph: any;
  userData: User = this.authService.currentUserValue.user;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private jobService: JobService,
    private notificationService: NotificationService,
    private generalService: GeneralService,
    private router: Router
  ) {}

  role: RoleName | null = null;

  ngOnInit(): void {
    this.userId = this.authService.currentUserValue.user.id;
    if (this.userId > 0) {
      this.getUser();
    }

    this.getRole();
    this.dashboard();
  }
  private getChartStyleProperties() {
    const documentStyle = getComputedStyle(document.documentElement);
    return {
      textColor: documentStyle.getPropertyValue('--text-color'),
      textColorSecondary: documentStyle.getPropertyValue(
        '--text-color-secondary'
      ),
      surfaceBorder: documentStyle.getPropertyValue('--surface-border'),
      blue: documentStyle.getPropertyValue('--blue-500'),
      pink: documentStyle.getPropertyValue('--pink-500'),
      green: documentStyle.getPropertyValue('--green-500'),
      teal: documentStyle.getPropertyValue('--teal-500'),
      orange: documentStyle.getPropertyValue('--orange-500'),
    };
  }

  private getChartCommonOptions(
    textColor: string,
    textColorSecondary: string,
    surfaceBorder: string
  ) {
    return {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
            font: {
              weight: 500,
            },
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
        y: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false,
          },
        },
      },
    };
  }

  renderYearlyChart() {
    const styleProps = this.getChartStyleProperties();
    const currentYear = new Date().getFullYear();
    const yearsRange = 4;
    const labels = Array.from(
      { length: 2 * yearsRange + 1 },
      (_, i) => currentYear - yearsRange + i
    );
    const datasets = [
      {
        label: 'Jobs',
        backgroundColor: styleProps.blue,
        borderColor: styleProps.blue,
        data: this.totalCounts.insights.jobCountsPerYear || [],
      },
      {
        label: 'Applications',
        backgroundColor: styleProps.pink,
        borderColor: styleProps.pink,
        data: this.totalCounts.insights.totalApplicantsPerYear || [],
      },
      {
        label: 'Downloads',
        backgroundColor: styleProps.green,
        borderColor: styleProps.green,
        data: this.totalCounts.insights.totalDownloadsPerYear || [],
      },
    ];

    this.totalGraph = {
      labels,
      datasets,
    };

    this.options = this.getChartCommonOptions(
      styleProps.textColor,
      styleProps.textColorSecondary,
      styleProps.surfaceBorder
    );
  }

  renderMonthlyChart() {
    const styleProps = this.getChartStyleProperties();
    this.datas = {
      labels: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
      datasets: [
        {
          label: 'Jobs',
          data: [...this.totalCounts.insights.jobCountsPerMonth],
          fill: false,
          tension: 0.4,
          borderColor: styleProps.blue,
        },
        {
          label: 'Applications',
          data: [...this.totalCounts.insights.totalApplicantsPerMonth],
          fill: false,
          borderDash: [5, 5],
          tension: 0.4,
          borderColor: styleProps.teal,
        },
        {
          label: 'Downloads',
          data: [...this.totalCounts.insights.totalDownloadsPerMonth],
          fill: true,
          borderColor: styleProps.orange,
          tension: 0.4,
          backgroundColor: 'rgba(255,167,38,0.2)',
        },
      ],
    };

    this.options = {
      ...this.getChartCommonOptions(
        styleProps.textColor,
        styleProps.textColorSecondary,
        styleProps.surfaceBorder
      ),
      aspectRatio: 0.6,
    };
  }
  getUser() {
    this.generalService.startLoading();
    this.userService
      .getUser(this.userId)
      .subscribe((items: ApiResponse<UserResponse>) => {
        this.data = items.data;
        this.generalService.loaded();
      });
  }

  dashboard() {
    this.generalService.startLoading();
    this.userService.dashboard().subscribe({
      next: (items: any) => {
        const { insights, totalInsights, sourceInsights } = items.data;
        this.totalCounts = {
          insights,
          totalInsights,
          sourceInsights,
        };
        this.sourcePercentages = this.calculateSocialPercentage(sourceInsights);
        this.renderYearlyChart();
        this.renderMonthlyChart();
        this.generalService.loaded();
      },
      error: (error: string) => {
        this.notificationService.showError(error, 'Failed');
        this.generalService.loaded();
      },
    });
  }

  calculateSocialPercentage(sourceInsights: { [key: string]: number }): {
    [key: string]: string;
  } {
    const total = Object.values(sourceInsights).reduce(
      (acc, curr) => acc + curr,
      0
    );
    const percentages = Object.keys(sourceInsights).reduce((acc, key) => {
      const count = sourceInsights[key];
      const percentage = total > 0 ? (count / total) * 100 : 0;
      acc[key] = `${percentage.toFixed(0)}%`;
      return acc;
    }, {} as { [key: string]: string });
    return percentages;
  }

  getRole() {
    if (this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN)) {
      this.router.navigate(['/home/dashboard-admin']);
    } else if (this.authService.hasRole(RoleName.ROLE_ADMIN)) {
      this.router.navigate(['/jobs/admin/list']);
    } else if (this.authService.hasRole(RoleName.ROLE_RECRUITER)) {
      this.router.navigate(['/home/dashboard']);
    }
  }
}
