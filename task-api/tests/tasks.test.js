const request = require('supertest');
const app = require('../src/app');
const taskService = require('../src/services/taskService');

describe('Task API Integration Tests', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('GET /tasks', () => {
    it('should return an empty array when no tasks exist', async () => {
      const res = await request(app)
        .get('/tasks')
        .expect('content-Type', /json/)
        .expect(200);

      expect(res.body).toEqual([]);
    });
    it('should return all tasks', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const res = await request(app)
        .get('/tasks')
        .expect(200);

      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Task 1');
      expect(res.body[1].title).toBe('Task 2');
    });


    it('should filter tasks by status with query param ?status=', async () => {
      taskService.create({ title: 'Todo Task', status: 'todo' });
      taskService.create({ title: 'Done Task', status: 'done' });
      const res = await request(app)
        .get('/tasks?status=todo')
        .expect(200);
      expect(res.body.length).toBe(1);
      expect(res.body[0].title).toBe('Todo Task');
      expect(res.body[0].status).toBe('todo');
    });

    it('should paginate tasks with ?page= and ?limit=', async () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });


      const res = await request(app)
        .get('/tasks?page=1&limit=2')
        .expect(200);
      expect(res.body.length).toBe(2);
      expect(res.body[0].title).toBe('Task 1');
      expect(res.body[1].title).toBe('Task 2');

    });

    describe('GET /tasks/stats', () => {
      it('should return status counts and overdue count', async () => {
        taskService.create({ title: 'Task 1', status: 'todo' });
        taskService.create({ title: 'Task 2', status: 'done' });
        const res = await request(app)
          .get('/tasks/stats')
          .expect(200);
        expect(res.body.todo).toBe(1);
        expect(res.body.done).toBe(1);
        expect(res.body.in_progress).toBe(0);
        expect(res.body.overdue).toBe(0);
      });
    });
  })

  describe('POST/task', () => {
    it('should create a new task and return 201', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Integration Test Task', priority: 'high' })
        .expect(201);

      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Integration Test Task');
      expect(res.body.priority).toBe('high');
      expect(res.body.status).toBe('todo');
      expect(res.body.assignee).toBeNull();

    })

    it('should return 400 if title is missing or empty', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: '   ' })
        .expect(400);
      expect(res.body.error).toBeDefined();
    });

    it('should return 400 if status is invalid', async () => {
      const res = await request(app)
        .post('/tasks')
        .send({ title: 'Task', status: 'invalid_status' })
        .expect(400);
      expect(res.body.error).toContain('status must be one of');
    });
  });


  describe('PUT /tasks/:id', () => {
    it('should update an existing task and return 200', async () => {
      const task = taskService.create({ title: 'Old Title', priority: 'low' });

      const res = await request(app)
        .put(`/tasks/${task.id}`)
        .send({ title: 'Updated Title', priority: 'high' })
        .expect(200);
      expect(res.body.title).toBe('Updated Title');
      expect(res.body.priority).toBe('high');
    })

    it('should return 404 if task to update is not found', async () => {
      const res = await request(app)
        .put('/tasks/non-existent-id')
        .send({ title: 'Updated' })
        .expect(404);
      expect(res.body.error).toBe('Task not found');
    });
  })

  describe('DELETE /tasks/:id', () => {
    it('should delete a task and return 204 No Content', async () => {
      const task = taskService.create({ title: 'Delete me' });
      await request(app)
        .delete(`/tasks/${task.id}`)
        .expect(204);
      // Verify it is genuinely removed from data
      expect(taskService.findById(task.id)).toBeUndefined();
    });
    it('should return 404 if task to delete is not found', async () => {
      const res = await request(app)
        .delete('/tasks/non-existent-id')
        .expect(404);
      expect(res.body.error).toBe('Task not found');
    });
  });


  describe('PATCH /tasks/:id/complete', () => {
    it('should mark a task complete and return 200', async () => {
      const task = taskService.create({ title: 'Complete me', priority: 'high' });
      const res = await request(app)
        .patch(`/tasks/${task.id}/complete`)
        .expect(200);
      expect(res.body.status).toBe('done');
      expect(res.body.completedAt).toBeDefined();
    });
    it('should return 404 if task to complete is not found', async () => {
      await request(app)
        .patch('/tasks/non-existent-id/complete')
        .expect(404);
    });
  });

  describe('PATCH /tasks/:id/assign', () => {
    it('should assign a user to an existing task and return 200', async () => {
      const task = taskService.create({ title: 'Assign Test' });
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: 'Alex' })
        .expect(200);
      expect(res.body.assignee).toBe('Alex');
    });
    it('should return 400 if assignee is empty or blank', async () => {
      const task = taskService.create({ title: 'Assign Test' });
      const res = await request(app)
        .patch(`/tasks/${task.id}/assign`)
        .send({ assignee: '   ' })
        .expect(400);
      expect(res.body.error).toBeDefined();
    });
    it('should return 404 if task to assign is not found', async () => {
      await request(app)
        .patch('/tasks/non-existent-id/assign')
        .send({ assignee: 'Alex' })
        .expect(404);
    });
  });

})