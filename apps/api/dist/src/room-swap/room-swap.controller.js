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
exports.RoomSwapController = void 0;
const common_1 = require("@nestjs/common");
const room_swap_service_1 = require("./room-swap.service");
const passport_1 = require("@nestjs/passport");
let RoomSwapController = class RoomSwapController {
    roomSwapService;
    constructor(roomSwapService) {
        this.roomSwapService = roomSwapService;
    }
    createListing(req) {
        return this.roomSwapService.createListing(req.user.userId);
    }
    removeListing(req) {
        return this.roomSwapService.removeListing(req.user.userId);
    }
    getListings(req) {
        return this.roomSwapService.getListings(req.user.userId);
    }
    sendInvite(req, body) {
        return this.roomSwapService.sendInvite(req.user.userId, body.targetStudentId);
    }
    getInvites(req) {
        return this.roomSwapService.getMyInvites(req.user.userId);
    }
    respondToInvite(req, id, body) {
        return this.roomSwapService.respondToInvite(req.user.userId, id, body.status);
    }
};
exports.RoomSwapController = RoomSwapController;
__decorate([
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "createListing", null);
__decorate([
    (0, common_1.Delete)('list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "removeListing", null);
__decorate([
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "getListings", null);
__decorate([
    (0, common_1.Post)('invite'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "sendInvite", null);
__decorate([
    (0, common_1.Get)('invites'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "getInvites", null);
__decorate([
    (0, common_1.Post)('invite/:id/respond'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", void 0)
], RoomSwapController.prototype, "respondToInvite", null);
exports.RoomSwapController = RoomSwapController = __decorate([
    (0, common_1.Controller)('room-swap'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __metadata("design:paramtypes", [room_swap_service_1.RoomSwapService])
], RoomSwapController);
//# sourceMappingURL=room-swap.controller.js.map