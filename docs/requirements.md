# Garden Town - Community Garden Management App

## Overview

Garden Town is a responsive web application that helps community gardens manage plots, coordinate tasks, connect members, and provide plant growing information. The app integrates with plant data APIs to give gardeners science-backed guidance on what to grow and how to care for it.

## Users & Roles

### Individual Gardeners
- Browse and request garden plots
- Track what they're growing in their assigned plot(s)
- View task schedules and sign up for community workdays
- Look up plant care information (watering, sunlight, spacing, companions)
- Communicate with other gardeners and coordinators
- Receive announcements and notifications

### Garden Coordinators
- Assign and manage plot reservations
- Create and manage task schedules (watering rotations, workdays, harvests)
- Post announcements to the community
- View member activity and plot status at a glance
- Coordinate shared resources (tools, compost, water access)

### Admins / Board Members
- Full access to all coordinator capabilities
- Manage member accounts and role assignments
- Configure garden settings (plot layout, rules, seasons)
- View reports on garden usage, membership, and activity
- Manage waitlists for plot availability

## Core Features

### 1. Plot Management
- Interactive map or grid view of all garden plots
- Plot status tracking: available, reserved, active, fallow
- Plot assignment workflow: request > approve > assign
- Per-plot planting log: what's planted, when, and by whom
- Seasonal plot rotation support
- Waitlist for when all plots are taken
- Plot size, location, and sunlight metadata

### 2. Task Scheduling
- Shared calendar for community events and tasks
- Recurring task support (weekly watering, monthly workdays)
- Task categories: watering, weeding, harvesting, maintenance, events
- Sign-up system for volunteer tasks
- Task reminders and notifications
- Coordinator ability to assign tasks to members

### 3. Member Directory
- Member profiles with name, contact info, and plot assignment(s)
- Role-based access control (gardener, coordinator, admin)
- Member search and filtering
- Join date, activity history, and contribution tracking
- Privacy controls for contact information visibility

### 4. Communication Hub
- Community announcements (coordinator/admin-posted)
- Discussion board or comment threads by topic
- Per-plot or per-event comment threads
- Notification preferences (email, in-app)
- @mention support for tagging members

### 5. Plant Information API Integration
- Integration with OpenFarm API and/or Perenual API
- Plant search by common name or scientific name
- Plant detail pages: description, sun requirements, water needs, soil type, spacing, companions, growing season
- Ability to link plant data to a member's plot planting log
- Seasonal planting recommendations based on plant data
- Companion planting suggestions

## Non-Functional Requirements

### Authentication & Authorization
- Email/password registration and login
- Role-based access control (gardener, coordinator, admin)
- Password reset flow
- Session management with secure tokens

### Performance
- Page load under 2 seconds on broadband
- Responsive design: usable on desktop, tablet, and phone
- Optimistic UI updates for common actions

### Accessibility
- WCAG 2.1 AA compliance
- Keyboard navigable
- Screen reader friendly
- Sufficient color contrast

### Data & Privacy
- Member data stored securely
- Contact info visibility controlled by each member
- GDPR-friendly data practices

## Tech Stack

- **Framework**: Next.js (App Router) with TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: NextAuth.js (or Auth.js)
- **Plant APIs**: OpenFarm API, Perenual API (fallback/supplement)
- **Deployment**: Vercel (recommended)

## Pages / Routes

| Route | Description | Access |
|---|---|---|
| `/` | Landing page / marketing | Public |
| `/login` | Sign in | Public |
| `/register` | Create account | Public |
| `/dashboard` | Overview: my plots, upcoming tasks, announcements | Authenticated |
| `/plots` | Garden plot map/grid with status | Authenticated |
| `/plots/[id]` | Plot detail: planting log, assigned member | Authenticated |
| `/schedule` | Community calendar and task sign-ups | Authenticated |
| `/members` | Member directory | Authenticated |
| `/members/[id]` | Member profile | Authenticated |
| `/plants` | Plant search and browse (API-powered) | Authenticated |
| `/plants/[id]` | Plant detail page | Authenticated |
| `/announcements` | Community announcements feed | Authenticated |
| `/admin` | Admin panel: settings, reports, role management | Admin only |

## Data Models (High-Level)

### User
- id, name, email, passwordHash, role, profileImage, joinDate, contactVisibility

### Plot
- id, label, size, location, sunlight, status, assignedUserId, season

### PlantingLog
- id, plotId, userId, plantName, plantApiId, datePlanted, dateHarvested, notes

### Task
- id, title, description, category, date, recurrence, createdByUserId

### TaskSignup
- id, taskId, userId, status

### Announcement
- id, title, body, authorUserId, createdAt, pinned

### Discussion
- id, title, contextType (plot/task/general), contextId, authorUserId, createdAt

### Comment
- id, discussionId, authorUserId, body, createdAt

## Future Considerations (Out of Scope for V1)
- Weather integration for local forecasts
- Photo uploads for plot progress journals
- Harvest tracking and yield statistics
- Tool lending library
- Integration with local food banks for surplus produce
- Mobile push notifications
- Multi-garden support (one org managing several garden sites)
