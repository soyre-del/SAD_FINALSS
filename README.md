# RoomQ — NORSU Classroom Operations & Availability Portal

A modern, responsive classroom management and availability platform designed for **Negros Oriental State University (NORSU - Main Campus 1)**. RoomQ provides a dual-interface architecture serving both university administrators/academic schedulers and university students/faculty members.

---

## 🏛️ System Overview

### 1. 🎓 Student & Faculty User Side (`user/index.html`, `user/classrooms.html`, `user/schedules.html`)
Designed for students and instructors who need quick, seamless access to classroom availability and study spaces:
- **Live Classroom Finder**: Search classrooms in real time by building (CAS, CBA, CTHM, CNPAHS, CIT, ST, CTED), floor, room code/name, or room type (Lecture Room vs Computer/Specialized Lab).
- **Real-Time Availability Indicators**: Instantly see whether a room is currently available or occupied in session, with countdowns to the next open slot.
- **Interactive Floor Plan Navigator (`user/classrooms.html`)**: Visually explore mapped classroom positions, zoom and pan across floors, check room facilities (capacity, projectors, aircon, WiFi), and inspect upcoming daily schedules.
- **Room Reservation Requests**: Submit room booking requests for study groups, thesis defense, makeup classes, or student organization activities with automated schedule conflict detection.
- **My Reservations Tracker**: View submitted room booking requests with live review statuses (`Pending Review`, `Confirmed`, `Rejected`) and cancellation options. Cancelling a confirmed booking frees the room again.
- **Room Schedules Matrix (`user/schedules.html`)**: Inspect daily timetables by building, floor, and date to spot open study gaps between classes.
- **Instant Role Switcher**: Switch to the Admin portal at any time via the prominent `🔑 Admin Portal` button.

### 2. 🔒 Academic Staff / Admin Side (`admin/index.html`, `admin/classrooms.html`, `admin/assignments.html`)
Designed for university scheduling staff and campus administrators:
- **Operations Dashboard (`admin/index.html`)**: Overview of classroom availability and room assignments.
- **Classroom Explorer (`admin/classrooms.html`)**: Administrative floor-plan workspace with interactive room coordinate mapping and schedule details.
- **Room Assignments Manager (`admin/assignments.html`)**: Assign classrooms for specific dates and time windows (with automatic storage in `localStorage`), update room availability, and remove past assignments.
- **Reservation Requests Review (`admin/assignments.html`)**: See every booking request submitted from the User portal. **Approve** turns the request into a room assignment (blocked if it overlaps an existing one) and marks it `Confirmed`; **Reject** marks it `Rejected`. The requester's *My Reservations* list updates live.
- **Instant Role Switcher**: Switch to the User portal at any time via the prominent `🎓 User Portal` button.

---

## 🚀 Running Locally

Requires [Node.js](https://nodejs.org/) (no `npm install` needed — the server has zero dependencies).

```powershell
npm start
```

Or double-click **`start.bat`** (starts the server and opens the browser).

| Page | URL |
| --- | --- |
| User portal | http://localhost:8002/user/ |
| Admin portal | http://localhost:8002/admin/ |

`http://localhost:8002/` redirects to the User portal. Stop the server with `Ctrl+C`.
To use another port: `set PORT=8080 && npm start` (Command Prompt) or `$env:PORT=8080; npm start` (PowerShell).

---

## 📁 File Structure

```text
SAD_FINAL/
├── admin/                        # 🔒 Admin side
│   ├── css/
│   │   └── admin-style.css       # Admin-only styles
│   ├── js/
│   │   └── assignments.js        # Admin assignment scheduling and storage logic
│   ├── index.html                # Admin dashboard
│   ├── classrooms.html           # Admin classroom explorer
│   └── assignments.html          # Room assignment manager
├── user/                         # 🎓 Student & faculty side
│   ├── css/
│   │   └── user-style.css        # User interface styles
│   ├── js/
│   │   └── user-portal.js        # User filters, reservations, and requests
│   ├── index.html                # Student & faculty dashboard
│   ├── classrooms.html           # User classroom explorer
│   ├── schedules.html            # Room schedule matrix
│   └── indexU.html               # Redirect to index.html
├── assets/                       # Shared by both sides
│   ├── css/
│   │   └── style.css             # Shared design system
│   ├── js/
│   │   ├── classroom-explorer.js # Shared floor plan and availability logic
│   │   ├── roomq-time.js         # Time formatting and time picker
│   │   └── script.js             # Common page controls
│   └── images/                   # Campus and floor-plan images
├── server.js                     # Local dev server (http://localhost:8002)
├── package.json                  # npm start script
├── start.bat                     # Double-click launcher for Windows
└── README.md
```

---

## ⚡ How It Works & Data Synchronization
- **Browser Storage**: All assignments (`roomq.roomUsage.v1`) and reservation requests (`roomq.roomRequests.v1`) are stored using the browser's `localStorage`.
- **Live Sync**: When an administrator saves or removes an assignment in `admin/assignments.html`, any open User tab instantly updates its real-time availability badges and room statuses via the `window.addEventListener('storage', ...)` event listener without requiring a manual page refresh.
- **Conflict Prevention**: When a user submits a room booking request, the system automatically cross-references the requested building, room, date, and time window with existing assignments and flags any scheduling overlaps.
