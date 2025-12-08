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
exports.AllotmentController = void 0;
const common_1 = require("@nestjs/common");
const allotment_service_1 = require("./allotment.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let AllotmentController = class AllotmentController {
    allotmentService;
    constructor(allotmentService) {
        this.allotmentService = allotmentService;
    }
    triggerAllotment(hostelId) {
        return this.allotmentService.runAllotment(hostelId);
    }
    getAllotments(hostelId) {
        return this.allotmentService.getAllotments(hostelId);
    }
    expireAllotments() {
        return this.allotmentService.expireUnpaidAllotments();
    }
};
exports.AllotmentController = AllotmentController;
__decorate([
    (0, common_1.Post)('trigger/:hostelId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('hostelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AllotmentController.prototype, "triggerAllotment", null);
__decorate([
    (0, common_1.Get)('list/:hostelId'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __param(0, (0, common_1.Param)('hostelId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AllotmentController.prototype, "getAllotments", null);
__decorate([
    (0, common_1.Post)('expire'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AllotmentController.prototype, "expireAllotments", null);
exports.AllotmentController = AllotmentController = __decorate([
    (0, common_1.Controller)('allotment'),
    __metadata("design:paramtypes", [allotment_service_1.AllotmentService])
], AllotmentController);
//# sourceMappingURL=allotment.controller.js.map