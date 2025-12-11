export declare class PdfService {
    generateRegistrationSlip(student: any): Promise<Buffer>;
    generatePaymentReceipt(payment: any, student: any): Promise<Buffer>;
    generateIdCard(student: any): Promise<Buffer>;
    generateBatchIdCards(students: any[]): Promise<Buffer>;
}
