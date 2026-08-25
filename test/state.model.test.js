import test from 'node:test';
import assert from 'node:assert/strict';

import { StateModel as State } from '../models/models.js';

test('State model exposes the standard OwlModel operations', () => {
  assert.equal(typeof State.save, 'function');
  assert.equal(typeof State.getAll, 'function');
  assert.equal(typeof State.getById, 'function');
  assert.equal(typeof State.getByCoincidence, 'function');
  assert.equal(typeof State.getOne, 'function');
  assert.equal(typeof State.update, 'function');
  assert.equal(typeof State.delete, 'function');
});
