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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpsController = void 0;
const common_1 = require("@nestjs/common");
const ops_service_1 = require("./ops.service");
const passport_1 = require("@nestjs/passport");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const client_1 = require("@prisma/client");
let OpsController = class OpsController {
    opsService;
    constructor(opsService) {
        this.opsService = opsService;
    }
    getHealth() {
        return this.opsService.getHealth();
    }
    triggerBackup() {
        return this.opsService.triggerBackup();
    }
    getAnalytics() {
        return this.opsService.getAnalytics();
    }
};
exports.OpsController = OpsController;
__decorate([
    (0, common_1.Get)('health'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getHealth", null);
__decorate([
    (0, common_1.Post)('backup'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "triggerBackup", null);
__decorate([
    (0, common_1.Get)('analytics'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt'), roles_guard_1.RolesGuard),
    (0, roles_decorator_1.Roles)(client_1.Role.ADMIN),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], OpsController.prototype, "getAnalytics", null);
exports.OpsController = OpsController = __decorate([
    (0, common_1.Controller)('ops'),
    __metadata("design:paramtypes", [ops_service_1.OpsService])
], OpsController);
//# sourceMappingURL=ops.controller.js.map