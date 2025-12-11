import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';

@Injectable()
export class PdfService {
  async generateRegistrationSlip(student: any): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      const photoDoc = student.documents?.find((d: any) => d.kind === 'PHOTO');
      const signDoc = student.documents?.find(
        (d: any) => d.kind === 'SIGNATURE',
      );
      // Fix: Use absolute path if possible or assume localhost for puppeteer
      // In a real scenario, convert image to base64 to avoid networking issues in PDF generation
      const photoUrl = photoDoc
        ? `http://localhost:4000${photoDoc.fileUrl}`
        : null;
      const signUrl = signDoc
        ? `http://localhost:4000${signDoc.fileUrl}`
        : null;

      const hostelFeePaid = student.payments?.some(
        (p: any) => p.purpose === 'HOSTEL_FEE' && p.status === 'COMPLETED',
      );
      const messFeePaid = student.payments?.some(
        (p: any) => p.purpose === 'MESS_FEE' && p.status === 'COMPLETED',
      );
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
                    ${photoUrl ? `<img src="${photoUrl}" class="photo-img" />` : 'PHOTO'}
                </td>
                <td style="width: 15%;">Roll No.</td>
                <td style="width: 25%;">${student.uniqueId}</td>
                <td style="width: 15%;">Course</td>
                <td>${student.program}</td>
            </tr>
            <tr>
                <td>First Name</td>
                <td>${student.name?.split(' ')[0] || ''}</td>
                <td>Middle Name</td>
                <td>${student.name?.split(' ').slice(1, -1).join(' ') || ''}</td>
            </tr>
            <tr>
                <td>Last Name</td>
                <td>${student.name?.split(' ').slice(-1)[0] || ''}</td>
                <td>Branch</td>
                <td>N/A</td> 
            </tr>
            <tr>
                <td>Email</td>
                <td>${student.user?.email}</td>
                <td>Allotted Hostel</td>
                <td><strong>${student.allotment?.room?.floor?.hostel?.name || 'Pending'}</strong></td>
            </tr>
             <tr>
                <td>Food Choice</td>
                <td>Veg</td>
                <td>Allotted Room</td>
                <td><strong>${student.allotment?.room?.number || 'Pending'}</strong></td>
            </tr>
             <tr>
                <td>Gender</td>
                <td>${student.gender}</td>
                <td>Apply for Hostel Year</td>
                <td>${student.year}</td>
            </tr>
             <tr>
                 <td></td>
                <td>Phone No.</td>
                <td>${student.phone}</td>
                <td>No. of Back Paper</td>
                <td>${student.backlogs ? 'Yes' : '0'}</td>
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
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate registration slip');
    }
  }

  async generatePaymentReceipt(payment: any, student: any): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
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
    } catch (error) {
      console.error('Error generating receipt:', error);
      throw new Error('Failed to generate payment receipt');
    }
  }
  async generateIdCard(student: any): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      const photoDoc = student.documents?.find((d: any) => d.kind === 'PHOTO');
      const signDoc = student.documents?.find((d: any) => d.kind === 'SIGNATURE');

      const photoUrl = photoDoc ? `http://localhost:4000${photoDoc.fileUrl}` : null;
      const signUrl = signDoc ? `http://localhost:4000${signDoc.fileUrl}` : null;

      const cardData = {
        session: '2025-26',
        name: student.name,
        roll: student.uniqueId,
        room: student.allotment?.room ? `${student.allotment.room.number} (${student.allotment.room.floor?.hostel?.name})` : 'N/A',
        validity: 'July 2026',
        phone: student.phone,
        email: student.user?.email,
        yoa: student.startYear || '2025',
        photoUrl: photoUrl || '',
        signatureUrl: signUrl || ''
      };

      const htmlContent = `
        <!doctype html>
        <html>
        <head>
        <meta charset="utf-8" />
        <style>
          @page { size: 85.6mm 54mm; margin: 0; }
          body { font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial; margin: 0; padding: 0; }
          
          /* Card Container - simplified for single card PDF */
          .card-container { width: 85.6mm; height: 54mm; page-break-after: always; position: relative; box-sizing: border-box; }
          .face { position: relative; width: 100%; height: 100%; padding: 3mm 4mm; box-sizing: border-box; border: 0.2mm solid #ccc; }
          
          .title { font-weight: 700; font-size: 11pt; text-align: center; color: #900; line-height: 1.1; margin-bottom: 2px; }
          .subtitle { font-size: 7pt; text-align: center; color: #333; margin-bottom: 4px; }
          
          .ribbon { background:#8c1048; color:#fff; padding: 2px 8px; font-weight: bold; border-radius: 2px; display:inline-block; margin: 1mm 0 2mm; font-size: 10pt; }

          .row { display:flex; gap:8px; align-items:flex-start; margin-top: 2px; }
          .photo { width: 20mm; height: 24mm; object-fit: cover; border: 0.5mm solid #8c1048; border-radius: 2px; }
          .fields { font-size: 9pt; line-height: 1.3; flex: 1; }

          .sig { height: 8mm; margin-top: 1mm; margin-left: 10px; max-width: 30mm; object-fit: contain; }
          .label { font-weight: 700; color: #444; }
          .muted { font-size: 7pt; color: #666; margin-top: 2px; }
          .issuing { text-align: center; font-size: 7pt; color: #900; font-weight: bold; margin-top: 1px; }

          /* Back */
          .box { background:#fffbe7; padding: 2mm 3mm; border: 0.3mm solid #e1d39a; margin: 2mm 0; border-radius: 4px; }
          .instructions { font-size: 7pt; margin-top: 2mm; }
          .instructions ol { padding-left: 12px; margin: 2px 0; }
          .instructions li { margin-bottom: 1px; }
          .qr { position:absolute; right:3mm; bottom:3mm; width:12mm; height:12mm; opacity: 0.8; }
        </style>
        </head>
        <body>
          <!-- FRONT -->
          <div class="card-container">
            <div class="face">
              <div class="title">DELHI TECHNOLOGICAL UNIVERSITY</div>
              <div class="subtitle">Shahbad Daulatpur, Main Bawana Road, Delhi-110042</div>
              <div style="text-align:center"><span class="ribbon">Hostel ID Card (${cardData.session})</span></div>
              <div class="row">
                <img class="photo" src="${cardData.photoUrl}" alt="Photo" onerror="this.style.display='none'"/>
                <div class="fields">
                  <div><span class="label">Name:</span> <strong>${cardData.name}</strong></div>
                  <div><span class="label">Roll No:</span> ${cardData.roll}</div>
                  <div><span class="label">Room:</span> ${cardData.room}</div>
                  <div style="text-align: right; margin-top: 2px;">
                     <img class="sig" src="${cardData.signatureUrl}" alt="Sign" onerror="this.style.display='none'"/>
                     <div class="issuing">Issuing Authority</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- BACK -->
          <div class="card-container">
            <div class="face">
              <div class="box">
                <div style="display:flex; justify-content:space-between;">
                    <div><span class="label">Validity:</span> ${cardData.validity}</div>
                    <div><span class="label">YOA:</span> ${cardData.yoa}</div>
                </div>
                <div style="margin-top:2px"><span class="label">Mob:</span> ${cardData.phone}</div>
                <div style="margin-top:2px"><span class="label">Email:</span> ${cardData.email}</div>
              </div>
              <div class="instructions">
                <div style="background:#8c1048; color:white; padding:1px 4px; font-weight:bold; display:inline-block; font-size: 7pt;">INSTRUCTIONS</div>
                <ol>
                  <li>The ID card must be displayed upon entering hostel premises.</li>
                  <li>For loss, duplicate card issued on payment of Rs. 200/-.</li>
                  <li>Keep it safe and report loss immediately.</li>
                  <li>This card is property of DTU Hostels.</li>
                </ol>
              </div>
              <!-- QR placeholder -->
              <div class="qr" style="border:1px solid #ccc; display:flex; align-items:center; justify-content:center; font-size:6px;">QR</div>
            </div>
          </div>
        </body>
        </html>
      `;

      await page.setContent(htmlContent);
      // Generate PDF with card dimensions
      const pdfBuffer = await page.pdf({
        width: '85.6mm',
        height: '54mm',
        printBackground: true,
        margin: { top: 0, right: 0, bottom: 0, left: 0 }
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating ID Card:', error);
      throw new Error('Failed to generate ID card');
    }
  }

  async generateBatchIdCards(students: any[]): Promise<Buffer> {
    try {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });
      const page = await browser.newPage();

      // Map students to data needed for HTML
      const cardsData = students.map(s => {
        const photoDoc = s.documents?.find((d: any) => d.kind === 'PHOTO');
        const signDoc = s.documents?.find((d: any) => d.kind === 'SIGNATURE');
        return {
          session: '2025-26',
          name: s.name,
          roll: s.uniqueId,
          room: s.allotment?.room ? `${s.allotment.room.number} (${s.allotment.room.floor?.hostel?.name})` : 'N/A',
          validity: 'July 2026',
          phone: s.phone,
          email: s.user?.email,
          yoa: s.startYear || '2025',
          photoUrl: photoDoc ? `http://localhost:4000${photoDoc.fileUrl}` : '',
          signatureUrl: signDoc ? `http://localhost:4000${signDoc.fileUrl}` : ''
        };
      });

      const styles = `
          @page { size: A4; margin: 10mm; }
          body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 0; }
          .grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10mm; row-gap: 10mm; page-break-inside: auto; }
          
          /* Using a wrapper to keep front and back together might be tricky across pages if using grid. 
             Instead, we can render pairs sequentially or in a specific layout.
             User requested "both back and front pages". 
             Let's do: Front | Back side-by-side for each student? 
             Or Fronts on one page, backs on next?
             The prompt says "admin can download multiple id cards in single pdf with both back and front pages... with a pair of both and back together".
             Let's put Front and Back side-by-side for each student.
             A4 width is 210mm. Card width 85.6mm. 2 cards = ~171mm + gap. 
             So we can fit 2 columns: Front | Back.
             Rows per page: A4 height 297mm. Card height 54mm. 5 rows = 270mm.
             So 5 students per page (Front+Back).
          */
          
          .student-row { display: flex; gap: 5mm; margin-bottom: 5mm; break-inside: avoid; page-break-inside: avoid; }
          
          .card { width: 85.6mm; height: 54mm; border: 0.2mm solid #999; border-radius: 3mm; overflow: hidden; position: relative; background: white; }
          .face { position: relative; width: 100%; height: 100%; padding: 4mm 5mm; box-sizing: border-box; }
          
          .title { font-weight: 700; font-size: 10pt; text-align: center; color: #900; line-height: 1.1; }
          .subtitle { font-size: 6.5pt; text-align: center; color: #333; margin-bottom: 2px; }
          
          .ribbon { background:#8c1048; color:#fff; padding: 2px 6px; display:inline-block; margin: 1mm 0; font-size: 9pt; border-radius: 2px; }

          .row-content { display:flex; gap:6px; align-items:flex-start; margin-top: 2px; }
          .photo { width: 18mm; height: 22mm; object-fit: cover; border: 0.3mm solid #8c1048; border-radius: 2px; }
          .fields { font-size: 8pt; line-height: 1.3; flex: 1; }

          .sig { height: 8mm; margin-top: 2mm; object-fit: contain; max-width: 30mm; }
          .label { font-weight: 700; color: #444; }
          .muted { font-size: 7.5pt; color: #555; }
          .issuing { text-align: right; font-size: 6pt; color: #900; font-weight: bold; margin-top: 1px; margin-right: 5px; }

          /* Back elements */
          .box { background:#fffbe7; padding: 2mm 3mm; border: 0.3mm solid #e1d39a; margin: 2mm 0; border-radius: 4px; }
          .instructions { font-size: 6.5pt; margin-top: 2mm; }
           .instructions ol { padding-left: 14px; margin: 2px 0; }
          .qr { position:absolute; right:3mm; bottom:3mm; width:12mm; height:12mm; opacity:0.6; border:1px solid #eee; }
      `;

      // Helper to generate Front HTML
      const getFront = (s: any) => `
        <div class="card">
          <div class="face">
            <div class="title">DELHI TECHNOLOGICAL UNIVERSITY</div>
            <div class="subtitle">Shahbad Daulatpur, Bawana Road, Delhi-42</div>
            <div style="text-align:center"><span class="ribbon">Hostel ID Card (${s.session})</span></div>
            <div class="row-content">
              <img class="photo" src="${s.photoUrl || ''}" onerror="this.style.visibility='hidden'" />
              <div class="fields">
                <div><span class="label">Name:</span> <strong>${s.name}</strong></div>
                <div><span class="label">Roll:</span> ${s.roll}</div>
                <div><span class="label">Room:</span> ${s.room}</div>
              </div>
            </div>
            <div style="display:flex; justify-content:flex-end; align-items:center; flex-direction:column; margin-top:-5px;">
               <img class="sig" src="${s.signatureUrl || ''}" onerror="this.style.visibility='hidden'" />
               <div class="issuing">Issuing Authority</div>
            </div>
          </div>
        </div>
      `;

      // Helper to generate Back HTML
      const getBack = (s: any) => `
        <div class="card">
          <div class="face">
            <div class="box">
              <div style="display:flex; justify-content:space-between">
                  <div><span class="label">Validity:</span> ${s.validity}</div>
                  <div><span class="label">YOA:</span> ${s.yoa}</div>
              </div>
              <div><span class="label">Mob:</span> ${s.phone}</div>
              <div><span class="label">Email:</span> ${s.email}</div>
            </div>
            <div class="instructions">
              <div style="font-weight:bold; background:#8c1048; color:white; padding:1px 4px; display:inline-block; font-size:6pt;">INSTRUCTIONS</div>
              <ol>
                <li>Display upon entering hostel.</li>
                <li>Duplicate card fee: Rs. 200/-.</li>
                <li>Report loss immediately.</li>
              </ol>
            </div>
            <div class="qr"></div>
          </div>
        </div>
      `;

      let htmlBody = '';
      cardsData.forEach(s => {
        htmlBody += `
            <div class="student-row">
                ${getFront(s)}
                ${getBack(s)}
            </div>
          `;
      });

      const htmlContent = `
        <!doctype html>
        <html>
        <head>
          <meta charset="utf-8" />
          <style>${styles}</style>
        </head>
        <body>
          ${htmlBody}
        </body>
        </html>
      `;

      await page.setContent(htmlContent);
      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: { top: '10mm', right: '10mm', bottom: '10mm', left: '10mm' }
      });

      await browser.close();
      return Buffer.from(pdfBuffer);
    } catch (error) {
      console.error('Error generating Batch ID Cards:', error);
      throw new Error('Failed to generate batch ID cards');
    }
  }
}
