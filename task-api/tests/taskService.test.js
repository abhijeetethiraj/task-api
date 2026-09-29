const taskService = require('../src/services/taskService');

describe('taskService (Unit Test', () => {
  beforeEach(() => {
    taskService._reset();
  });

  describe('create()', () => {
    it('should create a task with default values', () => {
      const task = taskService.create({ title: 'Learn Testing' });

      expect(task.id).toBeDefined();
      expect(task.title).toBe('Learn Testing');
      expect(task.description).toBe('');
      expect(task.status).toBe('todo');
      expect(task.priority).toBe('medium');
      expect(task.dueDate).toBeNull();
      expect(task.completedAt).toBeNull();
      expect(task.createdAt).toBeDefined();
    });

    it('should create a task wwith custom field', () => {
      const customData = {
        title: 'Submit Assignment',
        description: 'Complete all steps',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2026-12-31T00:00:00.000Z',
      };

      const task = taskService.create(customData);

      expect(task.title).toBe('Submit Assignment');
      expect(task.description).toBe('Complete all steps');
      expect(task.status).toBe('in_progress');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2026-12-31T00:00:00.000Z');

    });
  })

  describe('getAll()', () => {
    it('should return an empty array when no tasks exist', () => {
      const tasks = taskService.getAll();
      expect(tasks).toEqual([]);
    })
    it('should return all created tasks', () => {
      taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });

      const tasks = taskService.getAll();
      expect(tasks.length).toBe(2);
      expect(tasks[0].title).toBe('Task 1');
      expect(tasks[1].title).toBe('Task 2');

    })
  })

  describe('findById()', () => {
    it('should find a task by its ID', () => {
      const created = taskService.create({ title: 'Specific Task' });
      const found = taskService.findById(created.id);
      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
      expect(found.title).toBe('Specific Task');
    });

    it('should return undefined when task ID does not exist', () => {
      const found = taskService.findById('fake-non-existent-id');
      expect(found).toBeUndefined();
    });
  })


  describe('upadate()', () => {
    it('should update specified fields of an existing task', () => {
      const task = taskService.create({ title: 'Old Title', priority: 'low' });

      const updated = taskService.update(task.id, { title: 'New Title', priority: 'high' });
      expect(updated).toBeDefined();
      expect(updated.title).toBe('New Title');
      expect(updated.priority).toBe('high');
      expect(updated.status).toBe('todo');

    });

    it('should return null when updating a non-existent task', () => {
      const result = taskService.update('fake-id', { title: 'New Title' });
      expect(result).toBeNull();
    });
  })

  describe('remove()', () => {
    it('should delete an existing task and return true', () => {
      const task = taskService.create({ title: 'Task to Delete' });
      const deleted = taskService.remove(task.id);
      expect(deleted).toBe(true);

      expect(taskService.findById(task.id)).toBeUndefined();
      expect(taskService.getAll().length).toBe(0);

    });

    it('should return false when trying to remove a non-existent task', () => {
      const deleted = taskService.remove('fake-id');
      expect(deleted).toBe(false);
    });

  })

  describe('completeTask()', () => {
    it('should mark task as done and set completedAt timeStamp', () => {
      const task = taskService.create({ title: 'Complete me' });
      const completed = taskService.completeTask(task.id);
      expect(completed.status).toBe('done');
      expect(completed.completedAt).toBeDefined();
      expect(isNaN(Date.parse(completed.completedAt))).toBe(false);
    })

    it('should return null when completing a non-existent task', () => {
      const result = taskService.completeTask('fake-id');
      expect(result).toBeNull();
    });
  })

  describe('getByStatus()', () => {
    it('should filter tasks matching the exact status', () => {
      taskService.create({ title: 'Task A', status: 'todo' });
      taskService.create({ title: 'Task B', status: 'in_progress' });
      taskService.create({ title: 'Task C', status: 'done' });

      const todoTasks = taskService.getByStatus('todo');
      expect(todoTasks.length).toBe(1);
      expect(todoTasks[0].title).toBe('Task A');

    })


    it('should return an empty array if no tasks match the status', () => {
      taskService.create({ title: 'Task A', status: 'todo' });
      const doneTasks = taskService.getByStatus('done');
      expect(doneTasks).toEqual([]);
    });

  })

  describe('getStats()', () => {
    it('should calculate counts by status and overdue count', () => {
      const yesterday = new Date(Date.now() - 86400000).toISOString();
      const tomorrow = new Date(Date.now() + 86400000).toISOString();

      taskService.create({ title: 'Overdue Task', status: 'todo', dueDate: yesterday });
      taskService.create({ title: 'Future Task', status: 'in_progress', dueDate: tomorrow });
      taskService.create({ title: 'Finished Task', status: 'done', dueDate: yesterday });

      const stats = taskService.getStats();
      expect(stats.todo).toBe(1);
      expect(stats.in_progress).toBe(1);
      expect(stats.done).toBe(1);
      expect(stats.overdue).toBe(1);

    })
  })


  describe('getPaginated()',() =>{
    it('should return the correct slice of tasks for page 1',()=>{
       taskService.create({ title: 'Task 1' });
      taskService.create({ title: 'Task 2' });
      taskService.create({ title: 'Task 3' });

      const page1 = taskService.getPaginated(1, 2);

      expect(page1.length).toBe(2);
      expect(page1[0].title).toBe('Task 1');
      expect(page1[1].title).toBe('Task 2');
    })
  })
})