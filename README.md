# Collaborative Code Review Platform 

A Node.js & TypeScript API-driven backend that allows developers and teams to post code snippets, request feedback, and collaborate on code reviews in real-time.

---

## Features

* **Authentication & User Management**

  * User registration & login
  * JWT-based authentication
  * Roles: Submitter, Reviewer
* **Projects**

  * Create and manage projects
  * Assign or remove members
* **Code Submissions**

  * Upload code snippets or files (text only)
  * Track submission status: `pending`, `in_review`, `approved`, `changes_requested`
* **Comments**

  * Add inline or general comments on submissions
  * CRUD operations with proper role-based permissions
* **Review Workflow**

  * Approve submissions
  * Request changes
  * Track review history per submission
* **Notifications**

  * User activity feed for comments, reviews, and submissions
* **Project Analytics**

  * Average review time
  * Submission status summary
  * Top reviewers
* **Middleware & Validation**

  * Error handling middleware
  * Input validation middleware

---

## Tech Stack

* Node.js with TypeScript
* Express.js
* PostgreSQL (with `pg` package)
* JWT for authentication
* Bcrypt for password hashing
* WebSockets (socket.io) for real-time notifications
* pgAdmin for database management

---

## Getting Started

### Clone the repository

```bash
git clone https://github.com/Musiki8213/Collaborative-Code-Review.git
cd collaborative-code-review
```

### Install dependencies

```bash
npm install
```

### Setup environment variables

Create a `.env` file in the root:

```
PORT=4000
DATABASE_URL=postgres://username:password@localhost:5432/codereview_dev
JWT_SECRET=supersecretjwtkey
```

> Make sure to URL-encode special characters in your password.

### Setup the database

Use **pgAdmin** or `psql` to create the database:

```sql
CREATE DATABASE codereview_dev;
```

Create tables:

```sql
-- Users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100) UNIQUE,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) DEFAULT 'submitter',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Projects
CREATE TABLE projects (
  id SERIAL PRIMARY KEY,
  name VARCHAR(150),
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Project Members
CREATE TABLE project_members (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'reviewer'
);

-- Submissions
CREATE TABLE submissions (
  id SERIAL PRIMARY KEY,
  project_id INTEGER REFERENCES projects(id) ON DELETE CASCADE,
  submitter_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  code TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE comments (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  line_number INTEGER,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reviews
CREATE TABLE reviews (
  id SERIAL PRIMARY KEY,
  submission_id INTEGER REFERENCES submissions(id) ON DELETE CASCADE,
  reviewer_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Run the server

```bash
npm run dev
```

The API is available at `http://localhost:4000`.

---

## API Endpoints

### Authentication

* `POST /api/auth/register` — Register a new user
* `POST /api/auth/login` — Login an existing user

### Projects

* `POST /api/projects` — Create project
* `GET /api/projects` — List all projects
* `POST /api/projects/:id/members` — Add member
* `DELETE /api/projects/:id/members/:userId` — Remove member
* `GET /api/projects/:id/stats` — Get project statistics

### Submissions

* `POST /api/submissions` — Create submission
* `GET /api/submissions/project/:id` — List submissions for a project

### Comments

* `POST /api/comments` — Add comment
* `GET /api/comments/submission/:id` — List comments for a submission

### Reviews

* `POST /api/reviews/:id/approve` — Approve submission
* `POST /api/reviews/:id/request-changes` — Request changes
* `GET /api/reviews/:id` — Get review history

### Notifications

* `GET /api/user/:id` — Fetch user notifications

---

## Notes

* **Authorization:** All routes (except registration/login) require `Authorization: Bearer <token>` header.
* **Validation:** Requests are validated using middleware.
* **Error Handling:** All errors return JSON with an `error` key.
* **Real-Time Updates:** Socket.io is included for future notifications.

