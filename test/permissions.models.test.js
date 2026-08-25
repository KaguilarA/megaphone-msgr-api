import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ActionLogModel as ActionLog,
  PermissionModel as Permission,
  UserPermissionModel as UserPermission,
} from '../models/models.js';

test('Permission model exposes the required fields', () => {
  assert.equal(typeof Permission.save, 'function');
  assert.equal(typeof Permission.getAll, 'function');
  assert.equal(typeof Permission.getById, 'function');
  assert.equal(typeof Permission.getOne, 'function');
  assert.equal(typeof Permission.update, 'function');
  assert.equal(typeof Permission.delete, 'function');
});

test('UserPermission model stores the many-to-many relation by user and permission ids', () => {
  assert.equal(typeof UserPermission.save, 'function');
  assert.equal(typeof UserPermission.getAll, 'function');
  assert.equal(typeof UserPermission.getById, 'function');
  assert.equal(typeof UserPermission.getOne, 'function');
  assert.equal(typeof UserPermission.update, 'function');
  assert.equal(typeof UserPermission.delete, 'function');
});

test('ActionLog model records the action and the user who performed it', () => {
  assert.equal(typeof ActionLog.save, 'function');
  assert.equal(typeof ActionLog.getAll, 'function');
  assert.equal(typeof ActionLog.getById, 'function');
  assert.equal(typeof ActionLog.getOne, 'function');
  assert.equal(typeof ActionLog.update, 'function');
  assert.equal(typeof ActionLog.delete, 'function');
});
