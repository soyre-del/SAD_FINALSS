# RoomQ — NORSU Classroom Operations & Availability Portal

A modern, responsive classroom management and availability platform designed for **Negros Oriental State University (NORSU - Main Campus 1)**. RoomQ provides a dual-interface architecture serving both university administrators/academic schedulers and university students/faculty members.

---

## 🏛️ System Overview

### 1. 🎓 Student & Faculty User Side (`user.html`, `user-classrooms.html`, `user-schedules.html`)
Designed for students and instructors who need quick, seamless access to classroom availability and study spaces:
- **Live Classroom Finder**: Search classrooms in real time by building (CAS, CBA, CTHM, CNPAHS, CIT, ST, CTED), floor, room code/name, or room type (Lecture Room vs Computer/Specialized Lab).
- **Real-Time Availability Indicators**: Instantly see whether a room is currently available or occupied in session, with countdowns to the next open slot.
- **Interactive Floor Plan Navigator (`user-classrooms.html`)**: Visually explore mapped classroom positions, zoom and pan across floors, check room facilities (capacity, projectors, aircon, WiFi), and inspect upcoming daily schedules.
- **Room Reservation Requests**: Submit room booking requests for study groups, thesis defense, makeup classes, or student organization activities with automated schedule conflict detection.
- **My Reservations Tracker**: View submitted room booking requests with live review statuses (`Pending Review`, `Confirmed`) and cancellation options.
- **Room Schedules Matrix (`user-schedules.html`)**: Inspect daily timetables by building, floor, and date to spot open study gaps between classes.
- **Instant Role Switcher**: Switch to the Admin portal at any time via the prominent `🔑 Admin Portal` button.

### 2. 🔒 Academic Staff / Admin Side (`index.html`, `classrooms.html`, `assignments.html`)
Designed for university scheduling staff and campus administrators:
- **Operations Dashboard (`index.html`)**: Real-time overview of total classrooms (48–97 spaces), occupied rooms, available spaces, and active room assignments.
- **Classroom Explorer (`classrooms.html`)**: Administrative floor-plan workspace with interactive room coordinate mapping and historical schedule logs.
- **Room Assignments Manager (`assignments.html`)**: Assign classrooms for specific dates and time windows (with automatic storage in `localStorage`), update room availability, and remove past assignments.
- **Instant Role Switcher**: Switch to the User portal at any time via the prominent `🎓 User Portal` button.

---

## 📁 File Structure

```text
c:\roomQ\
├── index.html                   # Root entry redirect to User Portal
└── SAD_FINAL\
    ├── user.html                # [NEW] Student & Faculty Portal Dashboard
    ├── user-classrooms.html     # [NEW] Student Classroom Explorer (Floor Plan)
    ├── user-schedules.html      # [NEW] Campus Room Timetable & Schedule Matrix
    ├── user-portal.js           # [NEW] User Side logic, real-time filters & requests
    ├── user-style.css           # [NEW] Dedicated styles for user interface components
    ├── index.html               # Admin Operations Dashboard (with User switcher)
    ├── classrooms.html          # Admin Classroom Explorer (with User switcher)
    ├── assignments.html         # Admin Room Use & Assignments Manager
    ├── classroom-explorer.js    # Floor plan coordinate system & building database
    ├── assignments.js           # Admin assignment scheduling and storage logic
    ├── roomq-time.js            # Time formatting and custom 12-hour AM/PM picker
    ├── script.js                # Common date and mobile drawer controls
    ├── style.css                # Primary RoomQ design system & glassmorphism theme
    └── README.md                # Project documentation
```

---

## ⚡ How It Works & Data Synchronization
- **Browser Storage**: All assignments (`roomq.roomUsage.v1`) and reservation requests (`roomq.roomRequests.v1`) are stored using the browser's `localStorage`.
- **Live Sync**: When an administrator saves or removes an assignment in `assignments.html`, any open User tab (`user.html` or `user-classrooms.html`) instantly updates its real-time availability badges and room statuses via the `window.addEventListener('storage', ...)` event listener without requiring a manual page refresh.
- **Conflict Prevention**: When a user submits a room booking request, the system automatically cross-references the requested building, room, date, and time window with existing assignments and flags any scheduling overlaps.
