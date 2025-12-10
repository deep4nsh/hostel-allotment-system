"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfService = void 0;
const common_1 = require("@nestjs/common");
const puppeteer_1 = __importDefault(require("puppeteer"));
let PdfService = class PdfService {
    async generateRegistrationSlip(student) {
        try {
            const browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            const photoDoc = student.documents?.find((d) => d.kind === 'PHOTO');
            const signDoc = student.documents?.find((d) => d.kind === 'SIGNATURE');
            const photoUrl = photoDoc
                ? `http://localhost:4000${photoDoc.fileUrl}`
                : null;
            const signUrl = signDoc
                ? `http://localhost:4000${signDoc.fileUrl}`
                : null;
            const hostelFeePaid = student.payments?.some((p) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED');
            const messFeePaid = student.payments?.some((p) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED');
            const isFeePaid = hostelFeePaid && messFeePaid;
            const documentTitle = isFeePaid
                ? 'Hostel Allotment Letter'
                : 'Hostel Allotment Notice';
            const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; font-size: 11px; padding: 20px; color: #000; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
          th, td { border: 1px solid black; padding: 4px 6px; text-align: left; vertical-align: middle; }
          .header-row { background-color: #f0f0f0; font-weight: bold; text-align: center; }
          .section-header { background-color: #f0f0f0; text-align: center; font-weight: bold; padding: 5px; border: 1px solid black; border-bottom: none; }
          .no-border { border: none; }
          .photo-cell { width: 100px; text-align: center; vertical-align: middle; padding: 0; }
          .photo-img { width: 90px; height: 110px; object-fit: cover; display: block; margin: auto; }
          .sign-img { height: 40px; object-fit: contain; }
          .page-break { page-break-before: always; }
          .terms, .undertaking { margin-top: 10px; font-size: 10px; }
          .terms ol, .undertaking ol { padding-left: 20px; margin: 5px 0; }
          .terms li { margin-bottom: 4px; }
          .bold { font-weight: bold; }
          .center { text-align: center; }
        </style>
      </head>
      <body>

        <!-- Header -->
        <div style="border: 1px solid black; border-bottom: none; text-align: center; font-weight: bold; padding: 5px; font-size: 14px;">
            ${documentTitle}
        </div>
        <div style="border: 1px solid black; text-align: center; font-weight: bold; padding: 5px; font-size: 12px; border-top: none;">
            Academic Year 2025-2026
        </div>

        <!-- Personal & Academic Details Table -->
        <table style="margin-top: 0;">
            <tr>
                   <th colspan="2" class="center">Personal Details</th>
                   <th colspan="2" class="center">Academic Details</th>
            </tr>
            <tr>
                <td rowspan="5" class="photo-cell">
                    \${photoUrl ? \`<img src="\${photoUrl}" class="photo-img" />\` : 'PHOTO'}
                </td>
                <td style="width: 15%;">Roll No.</td>
                <td style="width: 25%;">\${student.uniqueId}</td>
                <td style="width: 15%;">Course</td>
                <td>\${student.program}</td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>\${student.name?.split(' ')[0] || ''}</td>
                <td>Middle Name</td>
                <td>\${student.name?.split(' ').slice(1, -1).join(' ') || ''}</td>
            </tr>
            <tr>
                <td>Last Name</td>
                <td>\${student.name?.split(' ').slice(-1)[0] || ''}</td>
                <td>Branch</td>
                <td>N/A</td> 
            </tr>
            <tr>
                <td>Email</td>
                <td>\${student.user?.email}</td>
                <td></td>
                <td></td>
            </tr>
             <tr>
                <td>Food Choice</td>
                <td>Veg</td>
                <td></td>
                <td></td>
            </tr>
             <tr>
                <td>Gender</td>
                <td>\${student.gender}</td>
                <td>Apply for Hostel Year</td>
                <td>\${student.year}</td>
            </tr>
             <tr>
                 <td></td>
                <td>Phone No.</td>
                <td>\${student.phone}</td>
                <td>No. of Back Paper</td>
                <td>\${student.backlogs ? 'Yes' : '0'}</td>
            </tr>
             <tr>
                 <td></td>
                <td>Allotment Priority</td>
                <td>NA</td>
                <td>Staying in Hostel</td>
                <td>Yes</td>
            </tr>
        </table>

        <table>
            <tr>
                <td style="width: 15%;">Distance</td>
                <td>\${student.profileMeta?.distance ? student.profileMeta.distance + ' km' : 'N/A'}</td>
                 <td style="width: 20%;">Year of Admission</td>
                <td>2024</td>
            </tr>
            <tr>
                <td>Blood Group</td>
                <td>N/A</td>
                 <td>CGPA</td>
                <td>\${student.cgpa || 'N/A'}</td>
            </tr>
            <tr>
                <td>Region</td>
                <td>\${student.category === 'DELHI' ? 'Delhi' : 'Outside Delhi'}</td>
                 <td>Chronic Problems</td>
                <td>No</td>
            </tr>
             <tr>
                <td>Last School</td>
                <td colspan="3">N/A</td>
            </tr>
        </table>

        <!-- Room Preferences -->
        <div class="section-header">Room Preferences Details</div>
        <table>
             <tr>
                <td style="width: 20%;">Preference 1</td>
                <td>\${student.preferences?.[0]?.floor?.hostel?.name || 'N/A'}</td>
                 <td style="width: 20%;">Preference 2</td>
                <td>\${student.preferences?.[1]?.floor?.hostel?.name || 'N/A'}</td>
            </tr>
             <tr>
                <td>Preference 3</td>
                <td>\${student.preferences?.[2]?.floor?.hostel?.name || 'N/A'}</td>
                 <td>Preference 4</td>
                <td>\${student.preferences?.[3]?.floor?.hostel?.name || 'N/A'}</td>
            </tr>
        </table>

        <!-- Room Partner Preferences -->
         <div class="section-header">Room Partner Preferences Details</div>
        <table>
             <tr>
                <td style="width: 25%;">First partner preference rollno.</td>
                <td>N/A</td>
                 <td style="width: 25%;">First partner preference name</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Second partner preference rollno.</td>
                <td>N/A</td>
                 <td>Second partner preference name</td>
                <td>N/A</td>
            </tr>
        </table>

        <!-- Parent Details -->
         <div class="section-header">Parent Details</div>
        <table>
             <tr>
                <td style="width: 20%;">Parent Type</td>
                <td style="width: 30%;">Father</td>
                 <td style="width: 20%;">Parent Name</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Parent Mobile No.</td>
                <td>N/A</td>
                 <td>Parent Email</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Parent Office No.</td>
                <td>N/A</td>
                 <td>Parent Designation</td>
                <td>Father</td>
            </tr>
             <tr>
                <td>Parent Occupation</td>
                <td colspan="3">N/A</td>
            </tr>
            <tr>
                <td>Parent Office Address</td>
                <td colspan="3">N/A</td>
            </tr>
        </table>
        
        <!-- Bank Details -->
        <div class="section-header">Bank Details</div>
        <table>
             <tr>
                <td style="width: 20%;">Bank Account No.</td>
                <td style="width: 30%;">N/A</td>
                 <td style="width: 20%;">Account Holder Name</td>
                <td>\${student.name}</td>
            </tr>
            <tr>
                <td>Bank Name</td>
                <td>N/A</td>
                 <td>Bank IFSC</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Bank Branch</td>
                <td colspan="3">N/A</td>
            </tr>
             <tr>
                <td>Bank Address</td>
                <td colspan="3">N/A</td>
            </tr>
        </table>

         <!-- Address Details -->
        <div class="section-header">Address Details</div>
        <table>
             <tr>
                <td style="width: 20%;">Corresponding Address</td>
                <td colspan="3">\${student.addressLine1}, \${student.city}, \${student.state} - \${student.pincode}</td>
            </tr>
             <tr>
                <td>Permanent Address</td>
                <td colspan="3">\${student.addressLine1}, \${student.city}, \${student.state} - \${student.pincode}</td>
            </tr>
        </table>

         <table>
            <tr>
                <th colspan="2" class="center">Home Address Details</th>
                 <th colspan="2" class="center">Permanent Address Details</th>
            </tr>
             <tr>
                <td style="width: 15%;">City</td>
                <td>\${student.city}</td>
                 <td style="width: 15%;">City</td>
                <td>\${student.city}</td>
            </tr>
            <tr>
                <td>State</td>
                <td>\${student.state}</td>
                 <td>State</td>
                <td>\${student.state}</td>
            </tr>
             <tr>
                <td>Country</td>
                <td>\${student.country}</td>
                 <td>Country</td>
                <td>\${student.country}</td>
            </tr>
             <tr>
                <td>Pincode</td>
                <td>\${student.pincode}</td>
                 <td>Pincode</td>
                <td>\${student.pincode}</td>
            </tr>
        </table>

        <!-- Local Guardian -->
        <div class="section-header">Local Guardian Details</div>
         <table>
             <tr>
                <td style="width: 15%;">Name</td>
                <td>N/A</td>
                 <td style="width: 15%;">Occupation</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Contact</td>
                <td>N/A</td>
                 <td>Email</td>
                <td>N/A</td>
            </tr>
             <tr>
                <td>Address</td>
                <td colspan="3">N/A</td>
            </tr>
        </table>

        <!-- Signatures (Page 1 footer) -->
        <table style="border: none; margin-top: 20px;">
            <tr style="border: none;">
                <td style="border: none; vertical-align: bottom;">Student Signature</td>
                 <td style="border: none;">
                     \${signUrl ? \`<img src="\${signUrl}" class="sign-img" />\` : ''}
                 </td>
            </tr>
        </table>

        <div class="page-break"></div>

        <!-- Page 2: Terms & Undertakings -->
        <div class="bold" style="margin-bottom: 5px;">Terms & Conditions :</div>
        <div class="terms">
            <ol>
                <li>Every student must abide by the rules and regulations of the University Hostels and conduct themselves in a manner befitting a student of DTU. Any form of indiscipline, misconduct, or violence will lead to disciplinary action, which may include expulsion from the hostel.</li>
                <li>All residents are required to strictly follow hostel timings as defined in the Hostel Information Bulletin.</li>
                <li>If, a student wants to go outside the university beyond the hostel timing as defined in the Hostel Information Bulletin, he /she must seek prior written request with reason/s from his/her respective Warden. Student must also record their departure and return time in the movement register maintained at the hostel.</li>
                <li>Any attempt to influence the hostel administration will lead to cancellation of candidature, and the decision of the competent hostel authorities shall be final and binding.</li>
                <li>Day scholars are not allowed to stay in hostels without prior written permission from the Hostel Office. If a day scholar is found staying in a hostel room without written permission, the allotment of the hosteller may be cancelled, and such students will be barred from future allotments by the competent hostel authorities.</li>
                <li>For hostellers, a minimum of 75% attendance in hostel is mandatory for consideration of next year/s hostel allotments.</li>
                <li>The allottee/s of a room is/are responsible for any damage or loss of hostel property or inventories in the room. The cost of repair or replacement will be borne by the student, as assessed by the competent hostel authorities. Decision of the competent authorities shall be final and binding.</li>
                <li>Hostel accommodation is provided as per the academic calendar of DTU. All residents shall vacate the hostel within one week of their last end-semester examination. A fresh application for hostel allotment must be submitted for next academic year.</li>
                <li>Hostel residents are strictly not allowed to keep any motorized vehicles (2 wheelers / 4 wheelers etc.) in and around the university premises. However, bicycles are permitted for internal transport within the DTU campus. Violation of this rule will result in disciplinary action, including fines and expulsion from hostel.</li>
                <li>The Hostel Office reserves full rights to allot, cancel, or reject any hostel application on the basis of hostel norms.</li>
            </ol>
        </div>

        <div class="bold" style="margin-top: 15px;">Declaration</div>
        <div class="terms">
             I hereby certify that:
             <ol>
                 <li>I have no backlog in the results of the recent odd semester. (Not applicable for first year students).</li>
                 <li>The information furnished by me is true to the best of my knowledge and belief. I understand that if any information is found to be false, my hostel allotment will be cancelled, and I will be expelled from the hostel without any refund of deposited hostel and mess fees.</li>
                 <li>I have read and understood all the terms and conditions mentioned above, as well as the rules and regulations provided in the Hostel Information Bulletin available at https://hostels.dtu.ac.in. I undertake to comply with them, and I understand that non-compliance may result in disciplinary action by the hostel authorities which shall be binding on me.</li>
                 <li>I will submit original affidavit confirming compliance to the office of the allotted hostel at the time possession on a non-judicial stamp paper of Rs. 10/-, duly signed by the student and their parent/guardian in the Performa given herewith.</li>
             </ol>
        </div>

        <div class="bold center" style="margin: 20px 0;">UNDERTAKINGS BY THE PARENTS AND STUDENT</div>

        <div class="undertaking">
            <p>1. Undertaking of awareness of medical facilities at University Health Centre by Parent/ Guardian I ________________________________ father/mother/guardian of Mr./Ms ________________________________ Roll No./DTU Admission No. __________________ hereby declare that the following in respect of my ward to be admitted to Hostels of Delhi Technological University (DTU).</p>
            <p>I am aware of the following facts:</p>
            <p>(i) The University Health Centre [UHC] located in the campus and run by University for its community has limited facilities.</p>
            <p>(ii) The UHC may not be adequate for treatment of any patient with chronic or serious ailments.</p>
            <p>(iii) It is the responsibility of the guardians to take care of their wards for outside treatment.</p>
            <p>(iv) Each student would be provided limited health insurance through a professional company. However, dealing with that company regarding claims for health insurance formalities would be entirely the student's responsibility. University would not be responsible for any dispute/discrepancy.</p>
            <p>Despite the best efforts on the part of DTU if any untoward thing happens to my ward, I shall not hold the university accountable for the same and will not seek any financial help or compensation for the same from any court of law.</p>

            <br/>
            <p>2. Undertaking by the student for not owning and/or using motor driven vehicles on DTU campus (for Hostel residents only):</p>
            <p>I ____________________________________________________ son/daughter/ward of Mr./Ms_________________________________ Roll No./DTU Admission No. __________________ hereby give an undertaking that I will not own/drive motor driven vehicle on campus during my stay at DTU. If at any day, I am found to violate the above undertaking my hostel seat will stand automatically cancelled without assigning any reasons. I also undertake that any visitor bringing a vehicle would follow the direction of hostel security and I would be liable for punishment for any violation on this account.</p>

            <br/>
            <p>3. The contact information provided by students & parent/guardian may be used by hostel authorities for all official communications, including matters related to absenteeism or disciplinary actions. Students are required to inform the Hostel Office or Warden promptly of any changes or updates to their contact details.</p>
        </div>

        <table style="border: none; margin-top: 40px;">
            <tr style="border: none;">
                <td style="border: none; width: 50%;">
                    Mobile No. of Parent/Guardian : <br/><br/>
                    Email ID of Parent/Guardian (Optional): <br/><br/>
                    Signature of Parent/Guardian
                </td>
                 <td style="border: none; width: 50%; text-align: right;">
                    Mobile No. of student : \${student.phone} <br/><br/>
                    Email ID of student : \${student.user?.email} <br/><br/>
                    Signature of the Student<br/>
                    \${signUrl ? \`<img src="\${signUrl}" class="sign-img" style="float: right;" />\` : ''}
                </td>
            </tr>
        </table>
        
        <div style="margin-top: 20px;">Date: \${new Date().toLocaleDateString()}</div>
      </body>
      </html>
      `;
            await page.setContent(htmlContent);
            const pdfBuffer = await page.pdf({ format: 'A4' });
            await browser.close();
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            console.error('Error generating PDF:', error);
            throw new Error('Failed to generate registration slip');
        }
    }
    async generatePaymentReceipt(payment, student) {
        try {
            const browser = await puppeteer_1.default.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            });
            const page = await browser.newPage();
            const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', 'Arial', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #2563eb; margin-bottom: 5px; }
          .subtitle { color: #666; font-size: 14px; }
          .receipt-title { font-size: 20px; font-weight: bold; margin: 30px 0 20px; text-align: center; text-transform: uppercase; letter-spacing: 1px; }
          .details-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 20px; margin-bottom: 30px; }
          .row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #e2e8f0; padding-bottom: 10px; }
          .row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
          .label { font-weight: bold; color: #64748b; }
          .value { font-weight: 500; }
          .amount-row { font-size: 18px; color: #16a34a; font-weight: bold; border-top: 2px solid #e2e8f0; padding-top: 15px; margin-top: 10px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Delhi Technological University</div>
          <div class="subtitle">Hostel Allotment System</div>
        </div>

        <div class="receipt-title">Payment Receipt</div>

        <div class="details-box">
          <div class="row">
            <span class="label">Receipt No:</span>
            <span class="value">RCPT-${payment.id.split('-')[0].toUpperCase()}</span>
          </div>
          <div class="row">
            <span class="label">Date:</span>
            <span class="value">${new Date(payment.createdAt).toLocaleString()}</span>
          </div>
          <div class="row">
            <span class="label">Student Name:</span>
            <span class="value">${student.name}</span>
          </div>
          <div class="row">
            <span class="label">Roll Number:</span>
            <span class="value">${student.uniqueId}</span>
          </div>
        </div>

        <div class="details-box">
          <div class="row">
            <span class="label">Payment For:</span>
            <span class="value">${payment.purpose.replace('_', ' ')}</span>
          </div>
          <div class="row">
            <span class="label">Transaction ID:</span>
            <span class="value">${payment.razorpayPaymentId || 'N/A'}</span>
          </div>
          <div class="row">
            <span class="label">Payment Method:</span>
            <span class="value">Online</span>
          </div>
           <div class="row amount-row">
            <span class="label">Amount Paid:</span>
            <span class="value">₹${payment.amount.toLocaleString()}</span>
          </div>
        </div>

        <div class="footer">
          <p>This is a computer-generated receipt and does not require a signature.</p>
          <p>Delhi Technological University, Shahbad Daulatpur, Main Bawana Road, Delhi-110042</p>
        </div>
      </body>
      </html>
      `;
            await page.setContent(htmlContent);
            const pdfBuffer = await page.pdf({ format: 'A4' });
            await browser.close();
            return Buffer.from(pdfBuffer);
        }
        catch (error) {
            console.error('Error generating receipt:', error);
            throw new Error('Failed to generate payment receipt');
        }
    }
};
exports.PdfService = PdfService;
exports.PdfService = PdfService = __decorate([
    (0, common_1.Injectable)()
], PdfService);
//# sourceMappingURL=pdf.service.js.map