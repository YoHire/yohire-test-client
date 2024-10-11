import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { NotificationService } from 'src/app/services/notification.service';
import { Location } from '@angular/common';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment';
import { UserService } from 'src/app/services/user.service';
import { trackByItemId } from 'src/app/utils/track-by.utils';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.component.html',
})
export class TransactionsComponent implements OnInit {
  transactionsUF!: any[];
  monthlyTransactions: any;
  allTransactions: any[] = [];
  coinTransactions: any[] = [];
  cashTransactions: any[] = [];
  transactions: any[] = [];
  activeTab: string = 'coins';
  search: String = '';

  id: number = 0;
  modalTitle: String = 'Create';

  user: String = '';
  transaction: String = '';
  title: String = '';


  pageCount: number = 0;
  page: number = 0;
  size: number = 20;
  pageStartIndex: number = 0;
  pageEndIndex: number = 0;
  gstin!: string;

  role: RoleName | null = null;
  @ViewChild('closeBtn')
  closeModal!: ElementRef;
  loginUser: string = '';
  freecoinBalance!: any;
  coinBalance!: any;
  raid: any;
  ra!: string;
  gstinChecked!: boolean;
  trackByItemId = trackByItemId;


  constructor(
    private transactionService: TransactionService,
    private notificationService: NotificationService,
    private authService: AuthService,
    public pageLocation: Location,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    )
      this.loginUser = '-admin';
    this.role = this.authService.getCurrentUserRole();
    this.authService.getCurrentUserRole();
    this.getCoinBalance();
    this.listItems();
    this.listMonthlyTransactions();
  }
  getNextInvoiceDate() {
    const currentDate = new Date();
    currentDate.setMonth(currentDate.getMonth() + 1);
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    const nextInvoiceDate = `${'01'}-${month}-${year}`;
    return nextInvoiceDate;
  }
  getCoinBalance() {
    this.userService.getUserCoinBalance().subscribe((response) => {
      this.coinBalance = response.data.coin;
      this.freecoinBalance = response.data.freeCoin;
    });
  }
  filterTransactions(type: string) {
    this.activeTab = type;

    if (type === 'coins') {
      if (
        this.allTransactions.length > 0 &&
        this.coinTransactions.length === 0
      ) {
        this.coinTransactions = this.allTransactions.filter(
          (x) =>
            (x.transactionNo.includes('OUT') ||
              x.transactionNo.includes('EXP') ||
              x.transactionNo.includes('ERN') ||
              x.transactionNo.includes('CIN')) &&
            x.type === 'COIN'
        );
      }
      this.transactions = this.coinTransactions;
    } else if (type === 'cash') {
      if (
        this.allTransactions.length > 0 &&
        this.cashTransactions.length === 0
      ) {
        this.cashTransactions = this.allTransactions.filter(
          (x) =>
            (x.transactionNo.includes('CIN') ||
              x.transactionNo.includes('DEP')) &&
            x.type === 'CASH'
        );
      }
      this.transactions = this.cashTransactions;
    }
  }
  getCumulativeCoin(index: number): number {
    if (index === 0) {
      return (
        this.transactions[index].Recruiter.freeCoin +
        this.transactions[index].Recruiter.coin
      );
    } else {
      const previousCoinsSum = this.transactions
        .slice(0, index)
        .reduce((acc, val) => {
          if (
            val.transactionNo.includes('CIN') ||
            val.transactionNo.includes('ERN')
          ) {
            return acc + val.coin;
          } else if (
            val.transactionNo.includes('EXP') ||
            val.transactionNo.includes('OUT')
          ) {
            return acc - val.coin;
          } else {
            return acc; 
          }
        }, 0);

      return previousCoinsSum + this.transactions[index].coin;
    }
  }
  calculateBalance(index: number): number {
    let balance = 0;
  
    if (index === 0) {
      balance = this.transactions[0].Recruiter.freeCoin+ this.transactions[0].Recruiter.coin;
    } else {
        for (let j = 0; j <= index; j++) {
        const transaction = this.transactions[j];
        
        if (transaction.type === 'COIN') {
          if (transaction.transactionNo.includes('CIN') || transaction.transactionNo.includes('ERN')) {
            balance += transaction.coin; // Add credit
          } else if (transaction.transactionNo.includes('EXP') || transaction.transactionNo.includes('OUT')) {
            
            balance -= transaction.coin; // Subtract debit
          }
        }
      }
    }
  
    return balance;
  }
  listItems() {
    this.transactionService.listByUserId().subscribe({
      next: (data: any) => {
        this.allTransactions = data.data;
        this.filterTransactions(this.activeTab);
      },
      error: (error) => {
        this.notificationService.showError(
          'Data Error',
          error.error.transaction
        );
      },
    });
  }

  listMonthlyTransactions() {
    this.transactionService.listMontlyTranasactions().subscribe({
      next: (data: any) => {
        this.monthlyTransactions = data.data.transactionsByMonthName;
        this.raid = data.data.raid;
        this.ra = data.data.ra;
        this.gstin = data.data.gstin;
      },
      error: (error) => {
        this.notificationService.showError(
          'Data Error',
          error.error.transaction
        );
      },
    });
  }
  getMonthlyTransactionKeys() {
    return this.monthlyTransactions
      ? Object.keys(this.monthlyTransactions)
      : [];
  }

  new() {
    this.modalTitle = 'Create';
    this.id = 0;
    this.user = '';
    this.title = '';
    this.transaction = '';
  }

  filter() {
    this.transactions = this.transactionsUF.filter(
      (x) =>
        x.number.toLowerCase().indexOf(this.search.toString().toLowerCase()) >=
          0 ||
        x.user.name
          .toLowerCase()
          .indexOf(this.search.toString().toLowerCase()) >= 0
    );
  }

  async downloadPDF(month: any) {
    const transactions = this.monthlyTransactions[month];

    const doc = new jsPDF();
    var img = new Image();
    img.src = 'assets/img/yo-logo.png';
    doc.addImage(img.src, 'PNG', 15, 12, 20, 15);
    autoTable(doc, {
      body: [
        [
          {
            content: 'Yohire Software Services India Private Limited',
            styles: {
              halign: 'right',
              fontSize: 20,
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              '59/7915, Hymod work space pushpa Jn.' +
              '\nCalicut, Kerala, 673001' +
              '\nContact : +918129583434' +
              '\nE-Mail : yohirejobs@gmail.com' +
              '\nWeb: www.yohire.in',
            styles: {
              halign: 'left',
            },
          },
          {
            content: (() => {
              const date = new Date(Date.parse(month + ' 1, 2000'));
              date.setMonth(date.getMonth() + 1);
              const monthStr = (date.getMonth() + 1)
                .toString()
                .padStart(2, '0');
              return (
                `Date: 01/${monthStr}/${new Date().getFullYear()}, 12:00 AM     ` +
                `\nInvoice No: ${
                  this.raid +
                  month.slice(0, 3).toUpperCase() +
                  new Date().getFullYear().toString().slice(-2)
                }` +
                '\nGST IN: 32AABCY5840L1Z5   '
              );
            })(),
            styles: {
              halign: 'right',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Invoice',
            styles: {
              halign: 'left',
              fontSize: 16,
              fontStyle: 'bold',
            },
          },
        ],
        [
          {
            content:
              'Billed to:' +
              '\n' +
              this.ra +
              '\nBilling Address line 1' +
              '\nBilling Address line 2' +
              '\nZip code - City' +
              '\nCountry' +
              (this.gstinChecked ? '\nGST IN: ' + this.gstin : ''),
            styles: {
              halign: 'left',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    const transactionData: any[] = [];
    let totalAmount = 0;
    let totalGstAmount = 0;
    let totalQuantityAmount = 0;
    let totalPurchaseAmount = 0;

    transactions.forEach((transaction: any) => {
      const amount = parseFloat(transaction.amount.toString()).toFixed(2);
      const date = moment(transaction.createdAt).format('DD-MM-yyyy');
      const time = moment(transaction.createdAt).format('hh:mm a');

      const netAmount = transaction.amount / (1 + 18 / 100);

      transactionData.push([
        date,
        time,
        transaction.transactionNo,
        netAmount.toFixed(2),
        transaction.gst,
        transaction.coin,
        amount,
      ]);

      totalAmount += parseFloat(amount);
      totalQuantityAmount += parseFloat(transaction.coin);
      totalGstAmount += transaction.gst;
      totalPurchaseAmount += netAmount;
    });

    transactionData.push([
      'Grand Total',
      '',
      '',
      totalPurchaseAmount.toFixed(2),
      totalGstAmount,
      totalQuantityAmount,
      totalAmount.toFixed(2),
    ]);
    autoTable(doc, {
      head: [
        [
          'Date',
          'Time',
          'Transaction No',
          'Amount',
          'Gst (18%)',
          'Quantity',
          'Total',
        ],
      ],
      body: transactionData,
      theme: 'striped',
      headStyles: {
        fillColor: '#1E3A8A',
      },
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Subtotal:',
            styles: {
              halign: 'right',
            },
          },
          {
            content: totalPurchaseAmount,
            styles: {
              halign: 'right',
            },
          },
        ],
        [
          {
            content: 'Total tax:',
            styles: {
              halign: 'right',
            },
          },
          {
            content: totalGstAmount,
            styles: {
              halign: 'right',
            },
          },
        ],
        [
          {
            content: 'Total amount:',
            styles: {
              halign: 'right',
            },
          },
          {
            content: totalAmount,
            styles: {
              halign: 'right',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      body: [
        [
          {
            content: 'Terms & Notes',
            styles: {
              halign: 'left',
              fontSize: 14,
            },
          },
        ],
        [
          {
            content:
              'Thank you for purchasing at Yohire. Looking forward to serving you again' +
              '\nPlease visit us at www.yohire.in for more details.',
            styles: {
              halign: 'left',
            },
          },
        ],
      ],
      theme: 'plain',
    });

    autoTable(doc, {
      body: [
        [
          {
            content:
              'The invoice is created on a computer and is valid without the signature and stamp.',
            styles: {
              halign: 'center',
              fillColor: [211, 211, 211],
              textColor: [0, 0, 0],
            },
          },
        ],
      ],
      theme: 'plain',
    });

    return doc.save('invoice');
  }
}
