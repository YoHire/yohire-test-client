import {
  ChangeDetectorRef,
  Component,
  HostListener,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { JwtAuthResponse } from 'src/app/models/jwtAuthResponse';
import { User } from 'src/app/models/user';
import { AuthService } from 'src/app/services/auth.service';
import { GeneralService } from 'src/app/services/general.service';
import { NotificationService } from 'src/app/services/notification.service';
import { PaymentsService } from 'src/app/services/payments.service';
import { UserService } from 'src/app/services/user.service';
import { WindowRefService } from 'src/app/services/window-ref.service';
import { environment } from 'src/environments/environment';
export const razorKey: string = environment.razorKey as string;
@Component({
  selector: 'app-sidebar-recruiter',
  templateUrl: './sidebar-recruiter.component.html',
  providers: [WindowRefService],
})
export class SidebarRecruiterComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private notificationService: NotificationService,
    private userService: UserService,
    private paymentsService: PaymentsService,
    private winRef: WindowRefService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}
  userData: JwtAuthResponse | undefined;
  btnDisplay: boolean = false;
  coinForm!: FormGroup;
  isGoldenBackground: boolean = false;
  coinBalance!: any;
  coinAmount!: number;
  showPayButton: boolean = false;
  freecoinBalance!: any;
  gstAmount: number = 1.18;
  isBuyCoinsView: boolean = false;
  showNames = false;
  showNamesTimeout: any;
  isMenuOpen = false;
  isSmallScreen = false;

  @HostListener('mouseover')
  onMouseOver() {
    clearTimeout(this.showNamesTimeout);
    this.showNamesTimeout = setTimeout(() => {
      this.showNames = true;
    }, 0);
  }

  @HostListener('mouseout')
  onMouseOut() {
    clearTimeout(this.showNamesTimeout);
    this.showNamesTimeout = setTimeout(() => {
      this.showNames = false;
    }, 0);
  }

  goBack() {
    this.showNames = false;
    this.isBuyCoinsView = false;
  }
  isActive(url: string): boolean {
    return this.router.isActive(url, true);
  }

  ngOnInit(): void {
    this.isSmallScreen = window.innerWidth < 768;
    this.authService.currentUser.subscribe((user) => {
      this.userData = user;
    });
    this.getCoinBalance();
    this.coinForm = this.formBuilder.group({
      coinAmount: [
        null,
        [Validators.required, Validators.min(1), Validators.max(10000)],
      ],
    });
  }
  getCoinBalance() {
    this.userService.getUserCoinBalance().subscribe((response) => {
      this.coinBalance = response.data.coin;
      this.freecoinBalance = response.data.freeCoin;
    });
  }

  roundDown(num: number) {
    return Math.floor(num);
  }

  generateOrder() {
    this.paymentsService
      .createOrder({
        amount: this.coinAmount * 50 * this.gstAmount * 100,
        role: this.userData?.user.authorities[0],
        currency: 'INR',
        coinToAdd: this.coinAmount,
      })
      .subscribe(
        (response) => {
          this.payWithRazorpay(response.data);
        },
        (error) => {
          console.error('Error while creating order:', error);
        }
      );
  }

  togglePayButtonVisibility() {
    this.showPayButton = this.coinAmount >= 1;
  }

  payWithRazorpay(orderId: string) {
    var options: any = {
      key: razorKey,
      amount: this.coinAmount * 50 * this.gstAmount * 100,
      currency: 'INR',
      name: 'yoHire',
      description: 'Test Transaction',
      image: 'assets/img/yohire.png',
      order_id: orderId,
      prefill: {
        email: this.userData?.user.username,
        contact: this.userData?.user.mobile,
      },
      modal: {
        escape: false,
      },
      theme: {
        color: '#3399cc',
      },
    };
    options.handler = (response: any, error: any) => {
      options.response = response;
      if (response.razorpay_signature) {
        this.getCoinBalance();
        this.notificationService.showSuccess(
          'Coin Credited Successfully',
          'Success'
        );
        window.location.reload();
      }
    };
    options.modal.ondismiss = () => {
      console.log('Transaction Cancelled');
    };
    const rzp = new this.winRef.nativeWindow.Razorpay(options);
    rzp.open();
  }

  logout() {
    this.authService.signout();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isSmallScreen = window.innerWidth < 768;
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }
}
