# KLMCE University Management System - Architecture & Technical Documentation

## 1. System Overview
The KLMCE University Management System (UMS) is an enterprise-grade, fully relational web application designed to centralize administration, academic scheduling, examination processing, fee ledgers, and attendance tracking into a single synchronized platform. 

The system operates across three perfectly synced dashboards:
- **Admin Portal**: For overriding management, scheduling, creating users, and generating compliance reports.
- **Faculty Portal**: For viewing assigned classes, schedules, and managing leaves.
- **Student Portal**: For viewing personal timetables, tracking grades, and paying fees.

---

## 2. Technology Stack
The platform is built on modern, high-performance web technologies:
- **Core Framework**: **Next.js 16.2.7** (App Router paradigm). Provides server-side rendering, API routes, and Server Actions.
- **Database**: **SQLite** (via **Prisma ORM**). Prisma maps TypeScript models directly to the database schemas.
- **Authentication**: Custom secure HTTP-only cookies paired with `bcryptjs` for salted password hashing.
- **Styling**: **Tailwind CSS 4.0** with **Framer Motion** for glassmorphism UI and fluid micro-animations.
- **Icons**: **Lucide React**.

---

## 3. Core Modules & Functionality Mapping

### A. Real Authentication Engine
Unlike basic prototypes, this system utilizes a true encrypted authentication flow. Passwords are mathematically hashed into the database, and sessions are securely verified using Node.js crypto.
- **Key Files:**
  - `src/lib/auth.ts`: Handles the async cookie resolution and session retrieval.
  - `src/app/login/actions.ts`: Verifies user credentials against the Prisma database using `bcrypt.compare`.
  - `src/app/admin/actions.ts` (`registerUser`): Hashes plain-text passwords when admins create new users.

### B. Autonomous Examination Engine (EMS)
A module that calculates a student's exact Semester Grade Point Average (SGPA) based on standard university formulas `Sum(Credits * GradePoints) / Sum(Credits)`.
- **Key Files:**
  - `src/app/actions/calculateGPA.ts`: The pure mathematical server action that queries `StudentResult` and `Subject` credits to generate the exact SGPA.
  - `src/app/admin/academics/exams/page.tsx`: The "Controller of Exams" dashboard.
  - `src/app/admin/academics/exams/components/ExamControllerClient.tsx`: The UI where admins input marks, triggering real-time SGPA updates.

### C. Finance & Ledger (Tally ERP Integration)
A complete fee tracking system that records payments and outputs accounting data for Tally ERP ingestion.
- **Key Files:**
  - `src/app/actions/finance.ts`: Contains `processMockPayment` (creates a `Transaction` and updates `Fee` status) and `generateTallyXML` (aggregates daily transactions into an XML string).
  - `src/app/student/fees/page.tsx`: Student portal where pending dues are displayed.
  - `src/app/admin/finance/page.tsx`: Admin ledger showing real-time gross collections.

### D. Hardware-Agnostic Attendance Sync
Designed to accept pings from physical RFID or Biometric scanners stationed outside classrooms.
- **Key Files:**
  - `src/app/api/attendance/hardware-sync/route.ts`: The REST API endpoint. It takes an RFID ping, finds the student, checks their `Schedule` to see what class is running right now, and marks an `AttendanceRecord`.
  - `src/app/actions/attendanceCron.ts`: A Cron-style server action that sweeps the 9:00 AM block to find students who missed the physical scan and sends an internal `Notification` alert.

### E. Advanced Scheduling & Timetables
A visual editor that prevents double-booking and connects students directly to their assigned faculty.
- **Key Files:**
  - `src/app/admin/academics/timetable/[sectionId]/page.tsx`: The Timetable Editor.
  - `src/app/admin/actions.ts` (`createSchedule`): Checks if the `roomId` or `facultyId` is already booked at that exact day and time before inserting the row.

### F. NAAC / NBA Data Aggregation
A reporting engine that scrapes the entire relational database to build compliance documentation.
- **Key Files:**
  - `src/app/actions/generateNAACReport.ts`: Aggregates total students, computes the exact Faculty-to-Student ratio per department, and calculates "Zero-Backlog" percentages.
  - `src/app/admin/reports/page.tsx`: The UI formatted explicitly for printing. It utilizes specialized `@media print` CSS to strip out navigation and output pure black-and-white data tables.

---

## 4. The Prisma Database Schema
The true power of the system lies in `prisma/schema.prisma`. Everything is interlinked:
- `User` is linked to `Department` and `ClassSection`.
- `Schedule` connects `Subject`, `User` (Faculty), `Room`, and `ClassSection`.
- `StudentResult` connects `Exam` and `User` (Student).
- Because `Student` is linked to `ClassSection`, the system instantly knows which `Schedule` belongs to which student without redundant data entry.
