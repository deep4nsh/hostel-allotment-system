"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinesModule = void 0;
const common_1 = require("@nestjs/common");
const fines_service_1 = require("./fines.service");
const fines_controller_1 = require("./fines.controller");
const prisma_module_1 = require("../prisma/prisma.module");
let FinesModule = class FinesModule {
};
exports.FinesModule = FinesModule;
exports.FinesModule = FinesModule = __decorate([
    (0, common_1.Module)({
        imports: [prisma_module_1.PrismaModule],
        providers: [fines_service_1.FinesService],
        controllers: [fines_controller_1.FinesController],
        exports: [fines_service_1.FinesService],
    })
], FinesModule);
//# sourceMappingURL=fines.module.js.map