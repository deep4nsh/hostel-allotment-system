"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const prisma_module_1 = require("./prisma/prisma.module");
const serve_static_1 = require("@nestjs/serve-static");
const path_1 = require("path");
const users_module_1 = require("./users/users.module");
const throttler_1 = require("@nestjs/throttler");
const core_1 = require("@nestjs/core");
const auth_module_1 = require("./auth/auth.module");
const payments_module_1 = require("./payments/payments.module");
const students_module_1 = require("./students/students.module");
const hostels_module_1 = require("./hostels/hostels.module");
const waitlist_module_1 = require("./waitlist/waitlist.module");
const allotment_module_1 = require("./allotment/allotment.module");
const letters_module_1 = require("./letters/letters.module");
const mail_module_1 = require("./mail/mail.module");
const imports_module_1 = require("./imports/imports.module");
const refunds_module_1 = require("./refunds/refunds.module");
const documents_module_1 = require("./documents/documents.module");
const ops_module_1 = require("./ops/ops.module");
const rebates_module_1 = require("./rebates/rebates.module");
const complaints_module_1 = require("./complaints/complaints.module");
const requests_module_1 = require("./requests/requests.module");
const room_swap_module_1 = require("./room-swap/room-swap.module");
const fines_module_1 = require("./fines/fines.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            prisma_module_1.PrismaModule,
            users_module_1.UsersModule,
            auth_module_1.AuthModule,
            payments_module_1.PaymentsModule,
            students_module_1.StudentsModule,
            hostels_module_1.HostelsModule,
            waitlist_module_1.WaitlistModule,
            allotment_module_1.AllotmentModule,
            letters_module_1.LettersModule,
            mail_module_1.MailModule,
            imports_module_1.ImportsModule,
            refunds_module_1.RefundsModule,
            documents_module_1.DocumentsModule,
            ops_module_1.OpsModule,
            rebates_module_1.RebatesModule,
            complaints_module_1.ComplaintsModule,
            requests_module_1.RequestsModule,
            room_swap_module_1.RoomSwapModule,
            fines_module_1.FinesModule,
            throttler_1.ThrottlerModule.forRoot([
                {
                    ttl: 60000,
                    limit: 100,
                },
            ]),
            serve_static_1.ServeStaticModule.forRoot({
                rootPath: (0, path_1.join)(process.cwd(), 'uploads'),
                serveRoot: '/uploads',
            }),
        ],
        controllers: [app_controller_1.AppController],
        providers: [
            app_service_1.AppService,
            {
                provide: core_1.APP_GUARD,
                useClass: throttler_1.ThrottlerGuard,
            },
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map