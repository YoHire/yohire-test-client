import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { RoleName } from 'src/app/models/roleName';
import { AuthService } from 'src/app/services/auth.service';
import { CircleService } from 'src/app/services/circle.service';
import { Location } from '@angular/common';
import { environment } from 'src/environments/environment';
import jsPDF from 'jspdf';
@Component({
  selector: 'app-invited-queue-details',
  templateUrl: './invited-queue-details.component.html',
})
export class InvitedQueueDetailsComponent {
  loginUser: string = '';
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalPages: number = 1;
  invitedQueues: any;
  queueId: string = ''; // Store the ID from route

  constructor(
    private circleService: CircleService,
    private route: ActivatedRoute,
    private authService: AuthService,
    public pageLocation: Location
  ) {}

  ngOnInit(): void {
    if (
      this.authService.hasRole(RoleName.ROLE_SUPER_ADMIN) ||
      this.authService.hasRole(RoleName.ROLE_ADMIN)
    ) {
      this.loginUser = '-admin';
    }

    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.queueId = id;
        this.listInvitedQueues(id, this.currentPage, this.itemsPerPage);
      } else {
        console.error('ID parameter is missing');
      }
    });
  }

  listInvitedQueues(id: string, page: number, itemsPerPage: number) {
    this.circleService.listInvitedQueues(id, page, itemsPerPage).subscribe({
      next: (items: any) => {
        this.invitedQueues = items.data;
        this.totalPages = Math.ceil(items.totalCount / this.itemsPerPage);
      },
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.listInvitedQueues(this.queueId, this.currentPage, this.itemsPerPage);
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

  formatDate(dateString: any) {
    const dateParts = dateString.split('T')[0].split('-');
    const year = dateParts[0];
    const month = dateParts[1];
    const day = dateParts[2];
    return `${day}-${month}-${year}`;
  }
}
