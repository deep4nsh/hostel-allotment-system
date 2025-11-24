"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.StudentsController = void 0;
const common_1 = require("@nestjs/common");
const students_service_1 = require("./students.service");
const pdf_service_1 = require("./pdf.service");
const passport_1 = require("@nestjs/passport");
const common_2 = require("@nestjs/common");
let StudentsController = class StudentsController {
    studentsService;
    pdfService;
    constructor(studentsService, pdfService) {
        this.studentsService = studentsService;
        this.pdfService = pdfService;
    }
    getProfile(req) {
        return this.studentsService.findOne(req.user.userId);
    }
    updateProfile(req, data) {
        return this.studentsService.update(req.user.userId, data);
    }
    async downloadSlip(req, res) {
        const student = await this.studentsService.findOne(req.user.userId);
        const buffer = await this.pdfService.generateRegistrationSlip(student);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename=registration-slip.pdf',
            'Content-Length': buffer.length,
        });
        res.end(buffer);
    }
};
exports.StudentsController = StudentsController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "getProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Patch)('me'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], StudentsController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('me/slip'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], StudentsController.prototype, "downloadSlip", null);
exports.StudentsController = StudentsController = __decorate([
    (0, common_1.Controller)('students'),
    __metadata("design:paramtypes", [students_service_1.StudentsService,
        pdf_service_1.PdfService])
], StudentsController);
//# sourceMappingURL=students.controller.js.map