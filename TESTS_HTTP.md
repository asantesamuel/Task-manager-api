# Task Manager API — Example curl commands

Replace values for `$BASE` and `$TOKEN` as needed. The examples assume the server runs on port 3000.

Set environment variables:

```bash
BASE=http://localhost:3000
```

1) Register a user
```bash
curl -X POST $BASE/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Alice","email":"alice@example.com","password":"password123"}'
```

2) Login (save token from response)
```bash
curl -X POST $BASE/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"alice@example.com","password":"password123"}'
# Response: {"token":"..."}

3) Create a task
```bash
TOKEN=<<paste token>>
curl -X POST $BASE/api/tasks \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"title":"My Task","description":"Details"}'
```

4) List my tasks
```bash
curl -X GET $BASE/api/tasks -H "Authorization: Bearer $TOKEN"
```

5) Update a task
```bash
curl -X PUT $BASE/api/tasks/1 \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"status":"completed"}'
```

6) Delete a task
```bash
curl -X DELETE $BASE/api/tasks/1 -H "Authorization: Bearer $TOKEN"
```

Admin actions (use an admin token):

```bash
ADMIN_TOKEN=<<paste admin token>>
curl -X GET $BASE/api/admin/users -H "Authorization: Bearer $ADMIN_TOKEN"
curl -X GET $BASE/api/admin/tasks -H "Authorization: Bearer $ADMIN_TOKEN"
curl -X DELETE $BASE/api/admin/tasks/1 -H "Authorization: Bearer $ADMIN_TOKEN"
```

Testing auth/authorization edge cases:

- Unauthenticated request (expect 401):
  `curl -X GET $BASE/api/tasks` (no Authorization header)
- Forbidden attempt (expect 403):
  - Create two users; user A creates a task; user B attempts to delete it using their token.
- Not found (expect 404):
  - Request a non-existent task id.
