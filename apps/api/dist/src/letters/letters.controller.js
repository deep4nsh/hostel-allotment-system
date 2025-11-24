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
exports.LettersController = void 0;
const common_1 = require("@nestjs/common");
const letters_service_1 = require("./letters.service");
const passport_1 = require("@nestjs/passport");
let LettersController = class LettersController {
    lettersService;
    constructor(lettersService) {
        this.lettersService = lettersService;
    }
    async downloadAllotmentLetter(req, res) {
        const student = req.user.studentId;
        const pdf = await this.lettersService.generateAllotmentLetter(req.user.userId);
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': 'attachment; filename="allotment-letter.pdf"',
            'Content-Length': pdf.length,
        });
        res.end(pdf);
    }
};
exports.LettersController = LettersController;
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('allotment'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], LettersController.prototype, "downloadAllotmentLetter", null);
exports.LettersController = LettersController = __decorate([
    (0, common_1.Controller)('letters'),
    __metadata("design:paramtypes", [letters_service_1.LettersService])
], LettersController);
//# sourceMappingURL=letters.controller.js.map