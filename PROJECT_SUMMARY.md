# KLMCE University Management System (UMS) - Project Summary

## Overview
We set out to build a modern, high-performance, and perfectly synchronized University Management System (UMS) tailored for KLMCE College of Engineering. The objective was to replace outdated, fragmented portals with a unified, visually stunning, and end-to-end connected platform for Admins, Faculty, and Students.

## Technology Stack
- **Framework:** Next.js 16.2.7 (App Router, Turbopack)
- **Styling:** Tailwind CSS + Framer Motion (for dynamic micro-animations and "Glassmorphism" UI)
- **Database:** Prisma ORM with SQLite (for local development, easily migratable to PostgreSQL)
- **Security:** `bcryptjs` for password hashing, Secure HTTP-only cookies for session management.
- **Icons:** Lucide React

---

## What We Built: The Three Pillars

### 1. The Super Admin Portal
The command center of the university. The Admin has full CRUD (Create, Read, Update, Delete) capabilities over the entire institution's data.
- **User Management (`/admin/users`):** Add new students, faculty, or staff. Includes a secure `bcrypt` hashing process for passwords and dynamic assignment to Class Sections and Departments. Includes bulk-upload capability UI.
- **Timetable Scheduling (`/admin/academics/timetable`):** A visual, drag-and-drop-style grid editor. Admins can assign a specific Faculty member to teach a specific Subject in a specific Room at a specific Time. The system runs real-time constraint checks to prevent double-booking faculty or rooms.
- **Faculty Directory (`/admin/faculty`):** A beautiful directory to view all faculty organized by department, tracking their assigned classes and workload.
- **Communications Hub (`/admin/communications`):** Allows Admins to send bulk push-notifications to targeted groups (e.g., "All Students in CSE-A-III" or "All Faculty").
- **Leave Approvals (`/admin/academics/leaves`):** A dashboard to review, approve, or reject leave requests submitted by Faculty, and manage faculty substitutions for canceled classes.

### 2. The Faculty Portal
A focused dashboard for educators to manage their daily academic responsibilities.
- **Teaching Schedule (`/faculty/schedule`):** A comprehensive weekly timetable grid showing exactly what subjects they are teaching, to which section, and in which room. Automatically synced from the Admin's Timetable Editor.
- **Leave Requests (`/faculty`):** Faculty can apply for leave directly from their dashboard, specifying dates and reasons. This pushes directly to the Admin's approval queue.

### 3. The Student Portal
A personalized hub for students to track their academic journey.
- **My Timetable (`/student/timetable`):** A beautifully rendered weekly schedule grid. This automatically fetches the timetable assigned to the student's specific Class Section.
- **Fee Payments (`/student/fees`):** A financial portal where students can view their current tuition dues, check payment history, and see pending balances.
- **Notifications Inbox (`/student/notifications`):** A real-time inbox to receive important announcements and direct messages sent from the Admin's Communication Hub.
- **Academic Dashboard (`/student`):** Live tracking of attendance percentages and current semester standing.

---

## The "End-to-End" Synchronization Engine
The most powerful feature of this UMS is its perfect synchronization. There are no "mock" data silos. 
1. **Real Authentication:** The system uses a real login form (`/login`). Users enter their Roll Number and Password, which is securely verified against the database.
2. **Relational Data Flow:** When an Admin creates a new Student and assigns them to section `CSE-A-III`, and then schedules a class for `CSE-A-III`, that Student instantly sees that exact class on their personal dashboard. 
3. **Real-time State Updates:** Built entirely on Next.js Server Actions with `revalidatePath`, ensuring that when data changes (e.g., an Admin approves a leave request), the Faculty member's UI updates instantly without requiring a page reload.

## Current Status
The project has successfully transitioned from an initial UI mockup phase into a **fully functional, secure, production-ready prototype**. The database schema is robust, the authentication is real, and the three user portals are perfectly synced.
