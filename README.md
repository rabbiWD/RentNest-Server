# 🏡 RentNest Backend Server

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-5.0-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-7.0-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Stripe](https://img.shields.io/badge/Stripe-Integration-635BFF?style=for-the-badge&logo=stripe&logoColor=white)](https://stripe.com/)
[![pnpm](https://img.shields.io/badge/pnpm-10.0+-E650A7?style=for-the-badge&logo=pnpm&logoColor=white)](https://pnpm.io/)

**RentNest** is a robust, production-grade RESTful API server powering a modern property rental and management ecosystem. Built with Express.js (v5), TypeScript, PostgreSQL, Prisma ORM, and Stripe, RentNest seamlessly connects **Tenants**, **Landlords**, and **Admins** through secure authentication, property listings, rental request workflows, online payments, and review systems.

---

## 🚀 Key Features

### 🔐 1. Authentication & Role-Based Access Control (RBAC)
- **Multi-Role Support**: Strict access control for `TENANT`, `LANDLORD`, and `ADMIN` users.
- **JWT Authentication**: Secure stateless authentication using JSON Web Tokens (Access Tokens & Refresh Tokens).
- **Password Security**: Safe credential handling using `bcryptjs` hashing.
- **Profile Management**: Profile viewing and dynamic profile updates for all authenticated user roles.

### 🏢 2. Property & Category Management
- **Public Discovery**: Browse available properties with detailed specifications (location, price, bedrooms, bathrooms, amenities, images).
- **Categorization**: Filter and organize properties by distinct categories (e.g., Apartments, Villas, Duplexes, Single Rooms).
- **Landlord Dashboard**: Dedicated endpoints allowing landlords to list, update, and remove properties.

### 📝 3. Rental Request Lifecycle
- **Tenant Applications**: Tenants can submit rental requests specifying move-in dates and rental durations.
- **Landlord Review**: Landlords can approve or reject incoming requests.
- **Status Tracking**: Automated state transitions (`PENDING` ➔ `APPROVED` ➔ `ACTIVE` ➔ `COMPLETED` / `REJECTED`).

### 💳 4. Stripe Payment Integration
- **Payment Intent Creation**: Automated Stripe Payment Intent generation upon rental request approval.
- **Stripe Webhooks**: Real-time asynchronous payment event handling using raw body signature verification (`/api/payments/webhook`).
- **Transaction History**: Comprehensive payment tracking and history lookup for tenants and landlords.

### ⭐ 5. Reviews & Ratings
- **Tenant Feedback**: Verified tenants can leave ratings and written reviews for properties they have rented.

### 🛡️ 6. Admin Control & Supervision
- **User Oversight**: View all registered users and manage account statuses (`ACTIVE` / `BANNED`).
- **Platform Analytics**: Monitor overall platform property listings and rental request histories.

### 🛠️ 7. Architecture & Error Handling
- **Modular Architecture**: Feature-sliced module structure separating routing, controllers, services, and schemas.
- **Centralized Error Handling**: Global error middleware (`globalErrorHandler`) and 404 router fallback (`notFound`).
- **Prisma Multi-Schema**: Clean, modular Prisma schema organization (`prisma/schema/*.prisma`).

---

## 🛠️ Tech Stack & Dependencies

| Category | Technology / Library | Purpose |
| :--- | :--- | :--- |
| **Runtime & Core** | [Node.js](https://nodejs.org/), [Express.js v5](https://expressjs.com/) | Web application framework |
| **Language** | [TypeScript](https://www.typescriptlang.org/) | Type-safe JavaScript runtime |
| **Database** | [PostgreSQL](https://www.postgresql.org/) | Relational database management system |
| **ORM** | [Prisma v7](https://www.prisma.io/) | Database ORM with `@prisma/adapter-pg` |
| **Payments** | [Stripe SDK](https://stripe.com/) | Online payment processing & Webhooks |
| **Authentication** | `jsonwebtoken`, `bcryptjs` | JWT signing/verification & password hashing |
| **Utilities** | `cookie-parser`, `cors`, `dotenv`, `http-status` | Request parsing, CORS headers, environment vars |
| **Dev Tooling** | `tsx`, `typescript`, `pnpm` | TypeScript execution & package management |

---

## 🗄️ Database Schema & Entities

RentNest leverages Prisma with a modular schema design. Key models and relations include:

```mermaid
erDiagram
    User ||--o| Profile : "has"
    User ||--o{ Property : "owns (Landlord)"
    User ||--o{ RentalRequest : "creates (Tenant)"
    User ||--o{ Review : "submits (Tenant)"
    Category ||--o{ Property : "categorizes"
    Property ||--o{ RentalRequest : "receives"
    Property ||--o{ Review : "receives"
    RentalRequest ||--o| Payment : "generates"

    User {
        string id PK
        string name
        string email UK
        string password
        UserRole role
        UserStatus status
    }

    Property {
        string id PK
        string landlordId FK
        string categoryId FK
        string title
        decimal rentPrice
        PropertyStatus status
    }

    RentalRequest {
        string id PK
        string tenantId FK
        string propertyId FK
        datetime moveInDate
        RentalRequestStatus status
    }

    Payment {
        string id PK
        string rentalRequestId FK UK
        string transactionId UK
        decimal amount
        PaymentStatus status
    }
```

---

## 📁 Directory Structure

```text
RentNest-Server/
├── generated/              # Generated Prisma Client artifacts
├── prisma/
│   ├── migrations/         # Database migration history
│   ├── schema/             # Modular Prisma schema files
│   │   ├── category.prisma
│   │   ├── enum.prisma
│   │   ├── payment.prisma
│   │   ├── profile.prisma
│   │   ├── property.prisma
│   │   ├── rentalRequest.prisma
│   │   ├── review.prisma
│   │   ├── schema.prisma
│   │   └── user.prisma
│   └── prisma.config.ts    # Prisma CLI config
├── src/
│   ├── config/             # Environment configuration mapping
│   ├── lib/                # Database clients (Prisma Client instance)
│   ├── middlewares/        # Auth, global error, and 404 middlewares
│   ├── modules/            # Feature Modules (Controllers, Services, Routes)
│   │   ├── admin/          # Admin oversight endpoints
│   │   ├── auth/           # User register, login & profile
│   │   ├── categories/     # Category management
│   │   ├── landlord/       # Landlord property & request actions
│   │   ├── payment/        # Stripe payment intents & webhooks
│   │   ├── property/       # Public property listings
│   │   ├── rentalRequest/  # Tenant rental applications
│   │   └── review/         # Property reviews & ratings
│   ├── utils/              # Helper utilities (catchAsync, sendResponse)
│   ├── app.ts              # Express application setup & middleware stack
│   └── server.ts           # HTTP server bootstrapping & DB connection
├── .env.example            # Environment variable template
├── package.json            # Project manifest & scripts
├── tsconfig.json           # TypeScript configuration
└── pnpm-lock.yaml          # Dependency lockfile
```

---

## ⚡ Getting Started

### Prerequisites
Make sure you have the following installed on your local machine:
- **Node.js** (v18.x or higher)
- **pnpm** (`npm install -g pnpm`)
- **PostgreSQL** database instance (local or hosted e.g. Neon, Supabase, Aiven)
- **Stripe Account & Stripe CLI** (for local webhook testing)

### Installation Steps

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/RentNest-Server.git
   cd RentNest-Server
   ```

2. **Install Dependencies**
   ```bash
   pnpm install
   ```

3. **Configure Environment Variables**
   Copy `.env.example` to `.env` and fill in your values:
   ```bash
   cp .env.example .env
   ```

   Configure your parameters in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/rentnest_db?schema=public"
   PORT=7000
   APP_URL=http://localhost:3000
   BCRYPT_SALT_ROUNDS=12

   JWT_ACCESS_SECRET=your_jwt_access_secret_key
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_key
   JWT_ACCESS_EXPIRES_IN=1d
   JWT_REFRESH_EXPIRES_IN=7d

   STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
   ```

4. **Synchronize Database Schema**
   Generate Prisma client and sync schema with your PostgreSQL database:
   ```bash
   pnpm prisma generate
   npx prisma db push
   ```

5. **Start Development Server**
   ```bash
   pnpm dev
   ```
   The server will start at `http://localhost:7000`.

6. **Listen for Stripe Webhooks (Optional for Payment Testing)**
   In a separate terminal window, run:
   ```bash
   pnpm stripe
   ```

---

## 📑 API Endpoint Summary

### 🔑 Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register a new user (`TENANT` or `LANDLORD`) |
| `POST` | `/api/auth/login` | Public | Authenticate user and issue JWT tokens |
| `GET` | `/api/auth/me` | Authenticated | Retrieve current user profile details |
| `PATCH` | `/api/auth/me` | Authenticated | Update user profile information |

### 🏘️ Properties (`/api/properties`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/properties` | Public | List all properties (supports search & filter) |
| `GET` | `/api/properties/:id` | Public | Get single property details by ID |
| `GET` | `/api/properties/categories` | Public | List categories available for properties |

### 🏷️ Categories (`/api/categories`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/categories` | Public | List all property categories |
| `POST` | `/api/categories` | Authenticated | Create a new property category |

### 🏡 Landlord Management (`/api/landlord/properties`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/landlord/properties` | `LANDLORD` | Create a new property listing |
| `PUT` | `/api/landlord/properties/:id` | `LANDLORD` | Update landlord's existing property |
| `DELETE` | `/api/landlord/properties/:id` | `LANDLORD` | Delete property listing |
| `GET` | `/api/landlord/properties/requests` | `LANDLORD` | View rental requests for landlord's properties |
| `PATCH` | `/api/landlord/properties/requests/:id` | `LANDLORD` | Approve or reject a rental request |

### 📄 Rental Requests (`/api/rentals`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/rentals` | `TENANT` | Submit a new rental application |
| `GET` | `/api/rentals` | `TENANT` | Get tenant's submitted rental applications |
| `GET` | `/api/rentals/:id` | `TENANT` | Get single rental request details |

### 💳 Payments (`/api/payments`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/payments/create` | `TENANT` | Create Stripe PaymentIntent for approved rental |
| `POST` | `/api/payments/confirm` | `TENANT` | Manually confirm payment completion |
| `GET` | `/api/payments` | `TENANT` | View tenant's payment history |
| `GET` | `/api/payments/:id` | All Roles | Get details of a specific payment transaction |
| `POST` | `/api/payments/webhook` | Stripe System | Webhook endpoint for handling Stripe events |

### ⭐ Reviews (`/api/reviews`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/reviews` | `TENANT` | Submit a review/rating for a rented property |

### 🛡️ Admin Dashboard (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/admin/users` | `ADMIN` | List all registered platform users |
| `PATCH` | `/api/admin/users/:id` | `ADMIN` | Update user status (`ACTIVE` / `BANNED`) |
| `GET` | `/api/admin/properties` | `ADMIN` | View all platform property listings |
| `GET` | `/api/admin/rentals` | `ADMIN` | View platform-wide rental request records |

---

## 📜 NPM Commands Reference

- `pnpm dev` - Start local development server with hot reloading (`tsx watch`).
- `pnpm build` - Generate Prisma Client and compile TypeScript to `dist/`.
- `pnpm start` - Run compiled JavaScript server in production (`node dist/server.js`).
- `pnpm stripe` - Forward Stripe webhook events locally to `localhost:5000/api/payments/webhook`.
- `pnpm postinstall` - Trigger `prisma generate` after dependency installation.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).