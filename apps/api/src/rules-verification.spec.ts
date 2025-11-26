
import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsService } from './payments/payments.service';
import { AllotmentService } from './allotment/allotment.service';
import { PrismaService } from './prisma/prisma.service';
import { PaymentPurpose } from '@prisma/client';

describe('Hostel Rules Verification', () => {
    let paymentsService: PaymentsService;
    let allotmentService: AllotmentService;
    let prisma: PrismaService;

    beforeAll(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PaymentsService, AllotmentService, PrismaService],
        }).compile();

        paymentsService = module.get<PaymentsService>(PaymentsService);
        allotmentService = module.get<AllotmentService>(AllotmentService);
        prisma = module.get<PrismaService>(PrismaService);
    });

    it('should calculate AC Hostel Fee correctly', async () => {
        // Setup Data
        const hostel = await prisma.hostel.create({
            data: {
                name: 'AC Hostel Test',
                isAC: true,
                floors: {
                    create: [{
                        number: 1,
                        gender: 'MALE',
                        rooms: {
                            create: [{ number: '101', capacity: 3, yearAllowed: [1] }]
                        }
                    }]
                }
            },
            include: { floors: { include: { rooms: true } } }
        });

        const user = await prisma.user.create({
            data: {
                email: `test_${Date.now()}@example.com`,
                password: 'hashed_password',
            }
        });

        const student = await prisma.student.create({
            data: {
                userId: user.id,
                name: 'Test Student',
                gender: 'MALE',
                category: 'DELHI'
            }
        });

        const room = hostel.floors[0].rooms[0];
        await prisma.allotment.create({
            data: {
                studentId: student.id,
                roomId: room.id,
                type: 'REGULAR'
            }
        });

        // Test Fee
        // We need to mock Razorpay or just check the logic before it calls Razorpay?
        // The service calls Razorpay.orders.create. We might need to mock that.
        // For now, let's assume the service throws if Razorpay fails, but we want to check the amount passed.
        // We can spy on the service method or just check the created payment record if we mock the razorpay call.
        // Since we can't easily mock private razorpay instance without more setup, 
        // let's rely on the fact that we updated the code to use 72000.

        // Actually, we can check the logic by creating a payment and checking the amount in DB?
        // But the service creates the payment record AFTER razorpay order.
        // We can mock the razorpay instance on the service.
        Object.defineProperty(paymentsService, 'razorpay', {
            value: {
                orders: {
                    create: jest.fn().mockResolvedValue({ id: 'order_123' })
                }
            }
        });

        await paymentsService.createOrder(student.userId, 'HOSTEL_FEE');

        const payment = await prisma.payment.findFirst({
            where: { studentId: student.id, purpose: 'HOSTEL_FEE' },
            orderBy: { createdAt: 'desc' }
        });

        expect(payment.amount).toBe(72000);
    });

    it('should prioritize PH students in allotment', async () => {
        // Create Hostel
        const hostel = await prisma.hostel.create({
            data: {
                name: 'Allotment Test',
                floors: {
                    create: [{
                        number: 1,
                        gender: 'MALE',
                        rooms: {
                            create: [{ number: '101', capacity: 1, yearAllowed: [1] }] // Only 1 seat
                        }
                    }]
                }
            }
        });

        // Create Users
        const u1 = await prisma.user.create({ data: { email: `u1_${Date.now()}@ex.com`, password: 'pw' } });
        const u2 = await prisma.user.create({ data: { email: `u2_${Date.now()}@ex.com`, password: 'pw' } });

        // Create Students
        const s1 = await prisma.student.create({
            data: { userId: u1.id, name: 'S1', gender: 'MALE', category: 'DELHI' }
        });
        const s2 = await prisma.student.create({
            data: { userId: u2.id, name: 'S2', gender: 'MALE', category: 'PH' } // PH should win
        });

        // Create Seat Booking Payments
        await prisma.payment.create({ data: { studentId: s1.id, purpose: 'SEAT_BOOKING', status: 'COMPLETED', amount: 5000 } });
        await prisma.payment.create({ data: { studentId: s2.id, purpose: 'SEAT_BOOKING', status: 'COMPLETED', amount: 5000 } });

        // Run Allotment
        const result = await allotmentService.runAllotment(hostel.id);

        expect(result.allotted).toBe(1);
        expect(result.details[0].studentId).toBe(s2.id);
    });
});
