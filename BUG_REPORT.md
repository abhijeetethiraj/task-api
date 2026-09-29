# Bug Report: The Untested API

This report documents the bugs discovered in the Task Manager API codebase during testing and code inspection.

---

## Bug 1: Off-by-One Error in Pagination (FIXED)
- **Location:** `src/services/taskService.js` (Line 12)
- **Expected Behavior:** Requesting Page 1 with limit 10 should return tasks from index 0 to 9.
- **Actual Behavior:** The formula used `offset = page * limit`. When `page = 1` and `limit = 10`, `offset` evaluated to `10`, thereby skipping the first 10 tasks (indexes 0–9).
- **How Discovered:** Discovered when writing unit tests for `getPaginated(1, 2)` in `tests/taskService.test.js`. The test asserted that 2 items would be returned, but only 1 item was received because the first 2 items were skipped.
- **Fix Implemented:** Updated the formula to correctly account for 1-based page indexing:
  ```javascript
  const offset = (page - 1) * limit;
  ```

---

## Bug 2: Unintentional Priority Reset on Task Completion (FIXED)
- **Location:** `src/services/taskService.js` (Line 69)
- **Expected Behavior:** Completing a task (`PATCH /tasks/:id/complete` or `taskService.completeTask(id)`) should update `status` to `'done'` and set `completedAt`, while preserving the task's existing `priority`.
- **Actual Behavior:** The function hardcoded `priority: 'medium'` in the updated task object, which silently demoted any `'high'` priority task to `'medium'` upon completion.
- **How Discovered:** Code review of `taskService.js` and inspecting the completed task response in Postman.
- **Fix Implemented:** Removed `priority: 'medium'` from the update payload:
  ```javascript
  const updated = {
    ...task,
    status: 'done',
    completedAt: new Date().toISOString(),
  };
  ```

---

## Bug 3: Inexact Substring Matching in `getByStatus` (FIXED)
- **Location:** `src/services/taskService.js` (Line 9)
- **Expected Behavior:** Querying `/tasks?status=todo` should return only tasks whose status is exactly `'todo'`.
- **Actual Behavior:** The service used `tasks.filter((t) => t.status.includes(status))`. Because `.includes()` performs substring matching, searching for `status=do` matched both `'todo'` and `'done'`, and searching for `status=to` matched `'todo'`.
- **How Discovered:** Code inspection of filter functions in `taskService.js`.
- **Fix Implemented:** Changed the filter to use strict equality:
  ```javascript
  const getByStatus = (status) => tasks.filter((t) => t.status === status);
  ```

---

## Bug 4: Pagination Ignored When Status Filter is Present
- **Location:** `src/routes/tasks.js` (Lines 14–24)
- **Expected Behavior:** An API consumer querying `GET /tasks?status=todo&page=1&limit=5` expects a paginated subset of the filtered `'todo'` tasks.
- **Actual Behavior:** The route checks `if (status)` first and immediately returns `res.json(tasks)`, ignoring `page` and `limit` completely when `status` is provided.
- **How Discovered:** Reviewing the query parameter handling in `routes/tasks.js`.
- **Proposed Fix:** Allow filtering and pagination to be composed together before sending the response:
  ```javascript
  router.get('/', (req, res) => {
    let tasks = status ? taskService.getByStatus(status) : taskService.getAll();

    if (page !== undefined || limit !== undefined) {
      const pageNum = parseInt(page) || 1;
      const limitNum = parseInt(limit) || 10;
      tasks = taskService.getPaginated(pageNum, limitNum, tasks);
      return res.json(tasks);
    }

    res.json(tasks);
  });
  ```
