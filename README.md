# DTU Hostel Allotment System

A comprehensive, full-stack web application designed to automate and streamline the hostel allotment process for Delhi Technological University (DTU). This system handles everything from student registration and document verification to algorithmic seat allocation and fee payments.

## 🚀 Features

### 🎓 Student Portal
*   **Smart Registration**: Seamless sign-up process with email verification.
*   **Profile Management**: Detailed profile creation with **Mock OCR** integration to autofill details from admission letters.
*   **Document Vault**: Secure upload for Passport Photos, Signatures, and Admission Letters.
*   **Preference System**: Students can select preferred floors and hostels based on eligibility.
*   **Payments**: Integrated **Razorpay** gateway for:
    *   Registration Fee (₹1,000)
    *   Seat Booking Fee (₹5,000)
    *   Mess Fee (₹20,000)
    *   **Dynamic Hostel Fee**: Automatically calculated based on room capacity (Single: ₹60k, Double: ₹56k, Triple: ₹52k).
*   **Digital Allotment**: Instant generation of digital allotment letters upon successful allocation.
*   **Refunds**: Automated refund requests with time-based deduction logic (₹3k/₹6k/No Refund).

### 🛡️ Admin Dashboard
*   **Analytics**: Real-time overview of total students, revenue, occupancy, and pending refunds.
*   **Bulk Operations**: Import student data via CSV/Excel.
*   **Allotment Engine**: One-click trigger for the allotment algorithm.
*   **Refund Management**: Approve or reject refund requests.
*   **System Health**: Monitor database connectivity and trigger manual backups.

### 🧠 Core Logic & Rules
*   **Allotment Priority**:
    1.  **PH** (Physically Handicapped)
    2.  **NRI** (Non-Resident Indian)
    3.  **Outside Delhi**
    4.  **Delhi** (Sorted by Distance - *Mocked*)
*   **Fee Structure**:
    *   Registration: ₹1,000 (Non-refundable)
    *   Seat Booking: ₹5,000 (Adjustable)
*   **Refund Policy**:
    *   < 10 Days from Allotment: ₹3,000 deduction
    *   10–30 Days: ₹6,000 deduction
    *   > 30 Days: No Refund

## 🛠️ Tech Stack

*   **Monorepo**: Turborepo
*   **Frontend**: Next.js 14 (App Router), Tailwind CSS, Shadcn UI
*   **Backend**: NestJS, TypeScript
*   **Database**: PostgreSQL, Redis
*   **ORM**: Prisma
*   **Containerization**: Docker & Docker Compose
*   **Payments**: Razorpay

## ⚙️ Local Setup

### Prerequisites
*   Node.js (v18+)
*   Docker Desktop
*   Git

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/hostel-allotment-system.git
    cd hostel-allotment-system
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Start Database (Docker)**
    ```bash
    docker-compose up -d
    ```

4.  **Environment Configuration**
    *   **Backend**: Create `apps/api/.env`
        ```env
        DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hostel_db?schema=public"
        JWT_SECRET="supersecret"
        RAZORPAY_KEY_ID="rzp_test_..."
        RAZORPAY_KEY_SECRET="..."
        ```
    *   **Frontend**: Create `apps/web/.env.local`
        ```env
        NEXT_PUBLIC_API_URL="http://localhost:3000"
        NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
        ```

5.  **Run Migrations**
    ```bash
    cd apps/api
    npx prisma migrate dev --name init
    ```

6.  **Start Development Servers**
    ```bash
    # Root directory
    npm run dev
    ```
    *   Frontend: `http://localhost:3001`
    *   Backend: `http://localhost:3000`

## 🚀 Deployment

See the **[Deployment Guide](deployment_guide.md)** for detailed instructions on hosting this application using **Neon** (DB), **Render** (Backend), and **Netlify** (Frontend).

## 📂 Project Structure

```
hostel-allotment-system/
├── apps/
│   ├── web/                 # Next.js Frontend
│   │   ├── src/app/        # App Router Pages
│   │   └── ...
│   └── api/                 # NestJS Backend
│       ├── src/            # Modules (Auth, Students, Payments...)
│       └── prisma/         # Database Schema
├── packages/               # Shared packages (UI, Config)
├── docker-compose.yml      # Local DB setup
└── README.md               # You are here
```
