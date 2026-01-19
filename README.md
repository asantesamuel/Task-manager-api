Task Manager API

Quick setup:

1. Create a PostgreSQL database and set environment variables in a `.env` file:

```
PG_HOST=localhost
PG_PORT=5432
PG_USER=youruser
PG_PASSWORD=yourpassword
PG_DATABASE=yourdb
JWT_SECRET=some_strong_secret
PORT=3000
```

2. Initialize the database schema:

```
psql "postgresql://$PG_USER:$PG_PASSWORD@$PG_HOST:$PG_PORT/$PG_DATABASE" -f db/init.sql
```

3. Install and run:

```
npm install
npm run devstart
```

Endpoints (high level):

- POST /api/auth/register  - register {name,email,password}
- POST /api/auth/login     - login {email,password}
- Tasks (authenticated):
  - POST /api/tasks        - create task {title,description,due_date}
  - GET  /api/tasks        - list my tasks
  - GET  /api/tasks/:id    - get a task (owner or admin)
  - PUT  /api/tasks/:id    - update task (owner or admin)
  - DELETE /api/tasks/:id  - delete task (owner or admin)
- Admin (requires admin user):
  - GET /api/admin/users   - list users
  - GET /api/admin/tasks   - list all tasks
  - DELETE /api/admin/tasks/:id - delete any task

Security notes:
- Passwords are hashed with bcrypt.
- JWT secret must be provided via `JWT_SECRET` env var.
- All DB queries are parameterized.
- Tasks are deleted when a user is deleted (ON DELETE CASCADE).
