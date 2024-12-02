### **Requirements for Lockout/Tagout (LOTO) Tracker**

---

## **Project Overview**

The Lockout/Tagout (LOTO) Tracker is a digital system designed to modernize safety protocols and improve compliance with OSHA standards. Using QR codes for tagging and tracking, the app will provide a streamlined interface for managing lockout events, equipment statuses, and personnel actions.

The application will be built using:

- **Frontend**: Next.js
- **Backend**: Prisma ORM
- **Database**: Neon.tech PostgreSQL

---

## **Core Features**

### **1. Authentication**

- Implement authentication using **NextAuth.js**:
  - **Role-based access control**:
    - **Admin**: Full access to all features.
    - **Authorized Personnel**: Ability to lock/unlock equipment.
    - **Viewer**: Read-only access to data.
  - OAuth support for providers such as Google, GitHub, or custom SSO.
  - Secure login/logout functionality.
  - API routes for authentication using `pages/api/auth/[...nextauth].ts`.

---

### **2. Lock Management**

- Add, edit, and delete locks with the following attributes:
  - Lock Number
  - Item/Equipment
  - Status (Locked/Unlocked)
  - Assigned Personnel
  - Timestamps (Created, Updated)
- Emergency override for unlocking when primary personnel are unavailable.

---

### **3. Event Tracking**

- Log all events related to locks, including:
  - Lock actions (Lock/Unlock).
  - Emergency overrides.
- Associate events with specific users and timestamps.

---

### **4. QR Code Scanning**

- Support QR codes for:
  - Lock tagging.
  - Mobile scanning to identify and manage locks.

---

### **5. Audit Trail**

- Backend audit logs of all system actions for compliance purposes.
- Include event details: user, timestamp, and action type.

---

### **6. Notifications**

- Notify relevant departments when equipment is tagged.

---

### **7. Data Reporting**

- Provide downloadable JSON reports containing:
  - All logged events.
  - Current statuses of locks.
  - Associated personnel data.
- Enable weekly data downloads for backups and compliance.

---

### **8. Responsive Design**

- Create a fully responsive UI for both desktop and mobile devices.
- Implement a **light/dark mode toggle**:
  - Use a moon icon for dark mode and a sun icon for light mode.
  - Detect system theme preference on initial load.

---

## **Technology Stack**

- **Frontend**: Next.js
- **Backend**: Node.js with Prisma ORM
- **Database**: Neon.tech PostgreSQL
- **Tools**:
  - npm for dependency management.
  - Tailwind CSS for styling.
  - NextAuth.js for authentication.
  - shadcn/ui for component library.

---

## **Deployment**

- Initial deployment to a test environment.
- Production deployment on a cloud platform with real-time database connections.

---

## **Milestones**

### **Phase 1: Setup and Core Functionality**

- Initialize project with Next.js, Prisma, and Neon.tech database.
- Implement user authentication with NextAuth.js.
- Develop lock management functionality (CRUD).
- Enable QR code scanning for locks.
- Add responsive design and light/dark mode.

**Deliverables:**

- Functional app with basic UI and lock management.
- Responsive layout with theme toggle.
- Test deployment in a staging environment.

---

### **Phase 2: Advanced Features**

- Implement event tracking and backend audit trail.
- Add emergency override functionality.
- Enhance the UI for a better mobile experience.

**Deliverables:**

- Fully tested app with event logging and override capabilities.
- Staging deployment for user feedback.

---

### **Phase 3: Reporting and Deployment**

- Enable JSON data export for weekly backups.
- Conduct stress testing and ensure compliance with OSHA standards.
- Final production deployment.

**Deliverables:**

- Production-ready app with full functionality.
- Documentation and training materials for end-users.

---

## **Database Models**

### **User**

```prisma
model User {
  id          Int       @id @default(autoincrement())
  name        String
  email       String    @unique
  role        String    // Admin, AuthorizedPersonnel, Viewer
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### **Lock**

```prisma
model Lock {
  id          Int       @id @default(autoincrement())
  lockNumber  String    @unique
  item        String
  status      String    // Locked, Unlocked
  personnelId Int
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### **Event**

```prisma
model Event {
  id          Int       @id @default(autoincrement())
  type        String    // Lock, Unlock, EmergencyOverride
  lockId      Int
  userId      Int
  timestamp   DateTime  @default(now())
}
```

---

## **Testing and Validation**

### **Phase 1 Testing**

- Verify authentication using NextAuth.js and role-based access.
- Test CRUD operations for locks.
- Validate QR code scanning functionality.
- Confirm responsive design across devices.
- Test light/dark mode toggle.

### **Phase 2 Testing**

- Ensure accurate event logging and audit trail creation.
- Test emergency override actions.
- Confirm enhanced mobile experience.

### **Phase 3 Testing**

- Validate JSON data exports.
- Conduct stress tests to ensure scalability.

---

## **Maintenance and Future Enhancements**

- Weekly backups of all data in JSON format.
- Possible future integration of NFC support for advanced tagging.
- Extend reporting capabilities for additional KPIs.

---
