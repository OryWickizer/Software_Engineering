# Taste Buddies - Troubleshooting

**Version:** 1.0.0  
**Base URL:** `http://localhost:8000`

---

## Table of Contents

1. [Common Issues and Solutions](#common-issues-and-solutions)
2. [Error Response Reference](#error-response-reference)
3. [Getting Help](#getting-help)

---


### Common Issues and Solutions

#### Issue: Port Already in Use

**Symptoms:**
```
Error: Bind for 0.0.0.0:5173 failed: port is already allocated
```

**Solution:**
1. Check what's using the port:
   ```bash
   # On Linux/Mac
   lsof -i :5173
   
   # On Windows
   netstat -ano | findstr :5173
   ```

2. Stop the conflicting process or change the port in `docker-compose.yml`

3. Restart Docker services:
   ```bash
   docker-compose down
   docker-compose up --build
   ```

---

#### Issue: MongoDB Connection Failed

**Symptoms:**
```
pymongo.errors.ServerSelectionTimeoutError: localhost:27017: [Errno 111] Connection refused
```

**Solution:**
1. Ensure MongoDB container is running:
   ```bash
   docker-compose ps
   ```

2. Check MongoDB logs:
   ```bash
   docker-compose logs mongodb
   ```

3. Restart MongoDB:
   ```bash
   docker-compose restart mongodb
   ```

4. If persistent, remove volumes and rebuild:
   ```bash
   docker-compose down -v
   docker-compose up --build
   ```

---

#### Issue: Database Indexes Not Created

**Symptoms:**
```
⚠️ Index creation note: E11000 duplicate key error
```

**Solution:**
This warning is usually harmless (indexes already exist). If you need to rebuild indexes:

1. Stop the application:
   ```bash
   docker-compose down
   ```

2. Remove database volumes:
   ```bash
   docker-compose down -v
   ```

3. Restart and rebuild:
   ```bash
   docker-compose up --build
   ```

---

#### Issue: Authentication Failed (401 Unauthorized)

**Symptoms:**
```json
{
  "detail": "Not authenticated"
}
```

**Solution:**
1. Ensure you're including the Authorization header:
   ```
   Authorization: Bearer <your-email>
   ```

2. Verify your email is verified:
   - Check verification email
   - Use the verification link

3. Test with debug endpoint:
   ```bash
   curl http://localhost:8000/api/debug/users
   ```

---

#### Issue: Email Verification Not Working

**Symptoms:**
- No verification email received
- Verification link returns error

**Solution:**
1. Check if verification email functionality is configured (currently mock implementation)

2. Manually verify user in database:
   ```bash
   docker exec -it <mongodb-container> mongosh
   use tastebuddies
   db.users.updateOne(
     {email: "user@example.com"},
     {$set: {verified: true, status: "active"}}
   )
   ```

3. Find container name:
   ```bash
   docker-compose ps
   ```

---

#### Issue: Docker Build Fails

**Symptoms:**
```
ERROR [backend internal] load metadata for docker.io/library/python:3.11-slim
```

**Solution:**
1. Check Docker daemon is running:
   ```bash
   docker info
   ```

2. Check internet connection

3. Clear Docker cache:
   ```bash
   docker system prune -a
   ```

4. Rebuild:
   ```bash
   docker-compose build --no-cache
   docker-compose up
   ```

---

#### Issue: Frontend Not Loading

**Symptoms:**
- Browser shows "Can't reach this page"
- `http://localhost:5173` doesn't load

**Solution:**
1. Check frontend container status:
   ```bash
   docker-compose ps
   ```

2. View frontend logs:
   ```bash
   docker-compose logs frontend
   ```

3. Restart frontend service:
   ```bash
   docker-compose restart frontend
   ```

4. Access frontend inside container:
   ```bash
   docker-compose exec frontend sh
   ```

---

#### Issue: Backend Tests Failing

**Symptoms:**
```
FAILED tests/test_auth.py::test_register_user
```

**Solution:**
1. Check test logs:
   ```bash
   docker-compose logs backend-tests
   ```

2. Ensure test database is clean:
   ```bash
   docker-compose down -v
   docker-compose up backend-tests --build
   ```

3. Run tests with verbose output:
   ```bash
   docker-compose run backend-tests pytest -v
   ```

---

#### Issue: Password Validation Errors

**Symptoms:**
```json
{
  "detail": [
    {
      "msg": "Password must contain at least one uppercase letter"
    }
  ]
}
```

**Solution:**
Ensure password meets all requirements:
- ✓ At least 8 characters
- ✓ Maximum 72 characters
- ✓ At least one uppercase letter (A-Z)
- ✓ At least one lowercase letter (a-z)
- ✓ At least one number (0-9)

Example valid password: `MyPass123`

---

#### Issue: Invalid ObjectId Format

**Symptoms:**
```json
{
  "detail": "Invalid meal ID"
}
```

**Solution:**
1. Ensure you're using valid MongoDB ObjectId format (24 hex characters)

2. Example valid ObjectId: `507f1f77bcf86cd799439011`

3. Get valid IDs from API responses or database queries

---

### Error Response Reference

All API errors follow this format:

```json
{
  "detail": "Error message description"
}
```

**HTTP Status Codes:**
- `400 Bad Request` - Invalid input data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `422 Unprocessable Entity` - Validation errors
- `500 Internal Server Error` - Server error

---

### Getting Help

If you encounter issues not covered here:

1. **Check Logs:**
   ```bash
   docker-compose logs -f
   ```

2. **View Specific Service Logs:**
   ```bash
   docker-compose logs backend
   docker-compose logs frontend
   docker-compose logs mongodb
   ```

3. **Check API Documentation:**
   Visit http://localhost:8000/docs for interactive API docs

4. **Verify Service Health:**
   ```bash
   curl http://localhost:8000/health
   ```

5. **Report Issues:**
   - GitHub: https://github.com/madisonbook/CSC510/issues
   - Include: Error messages, logs, and steps to reproduce

---
