# Project Submission: The Untested API

**Candidate:** Abhijeet Ethiraj  
**Position:** Full Stack Developer Intern  

---

## What I Did

- **Wrote 33 Automated Tests:** Created unit tests for all service functions and integration tests for every API route using Jest and Supertest.
- **Achieved 92%+ Test Coverage:** Ran `npm run coverage` to make sure all functions, routes, and edge cases are well-tested (well above the 80% goal).
- **Found and Fixed Bugs:** Documented 4 bugs in `BUG_REPORT.md`, including fixing the pagination math bug and the accidental priority reset bug.
- **Built the New Feature:** Added the `PATCH /tasks/:id/assign` endpoint with input validation (checking for empty or blank names) along with tests.

---

## Answers to Reflection Questions

### 1. What would you test next if you had more time?
- **Real Database Testing:** Currently, tasks reset whenever the server restarts. I would test connecting to a real database (like MongoDB or PostgreSQL) and test saving/loading data.
- **Date Inputs:** Test more edge cases for `dueDate` (like wrong formats or different timezones).
- **Simultaneous Requests:** Test what happens if two people try to update or delete the exact same task at the same second.

### 2. Anything that surprised you in the codebase?
- **Priority Reset:** In `completeTask`, marking a task as done silently changed its priority back to "medium". If someone had a "high" priority task, completing it lost that information.
- **Pagination Skipping Page 1:** The formula `offset = page * limit` meant that asking for Page 1 with limit 10 skipped the first 10 tasks completely.
- **Filter Matching:** The status filter used `.includes()`, which meant searching for "do" returned both "todo" and "done".

### 3. Questions you'd ask before shipping this to production:
1. **Database:** Which real database should we connect this to so data isn't lost on restart?
2. **User Login:** Do we need user accounts and login so users can only view and edit their own tasks?
3. **Assignees:** Right now, anyone can type any name as an assignee. Should assignees be real registered team members from a user list?

---

## How to Run

```bash
cd task-api
npm install
npm test           # Runs all 33 tests
npm run coverage   # Shows the 92% coverage table
npm start          # Starts server on http://localhost:3000
```
