import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import { MongoMemoryReplSet } from 'mongodb-memory-server';
import { bootstrapInstallation } from '../setup/bootstrap.js';
import { createOperator, validateAccountInput } from '../setup/accounts.js';
import { permissionCatalog, isOperatorPermission } from '../setup/catalog.js';

const credentials = { name: 'Primera', lastName: 'Administradora', email: 'ADMIN@example.com', password: 'Example-password-42' };
let replica;

test.before(async () => {
  replica = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  await mongoose.connect(replica.getUri(), { autoIndex: false });
  for (const model of Object.values(mongoose.models)) { await model.createCollection(); await model.createIndexes(); }
});
test.after(async () => { await mongoose.disconnect(); if (replica) await replica.stop(); });
test.beforeEach(async () => { for (const model of Object.values(mongoose.models)) await model.deleteMany({}); });

test('a completely empty installation creates an active administrator, login email and every permission', async () => {
  const result = await bootstrapInstallation(credentials);
  assert.equal(result.created, true);
  const { User, State, Email, Permission, UserPermission, Installation } = mongoose.models;
  const admin = await User.findById(result.administratorId).populate('state');
  assert.equal(admin.state.name, 'Activo');
  assert.notEqual(admin.password, credentials.password);
  assert.equal(Object.hasOwn(admin.toJSON(), 'password'), false);
  const email = await Email.findOne({ owner: admin._id });
  assert.equal(email.email, 'admin@example.com');
  assert.ok(await State.findById(email.state));
  assert.equal(await Permission.countDocuments(), permissionCatalog.length);
  assert.equal(await UserPermission.countDocuments({ user: admin._id }), permissionCatalog.length);
  assert.ok((await Installation.findById('initial-setup')).completedAt);
});

test('repeating setup preserves the administrator password and customized assignments', async () => {
  const result = await bootstrapInstallation(credentials);
  const before = await mongoose.models.User.findById(result.administratorId);
  const assignment = await mongoose.models.UserPermission.findOne({ user: before._id });
  await assignment.deleteOne();
  const repeated = await bootstrapInstallation({ ...credentials, password: 'Different-password-42' });
  assert.equal(repeated.created, false);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
  assert.equal((await mongoose.models.User.findById(before._id)).password, before.password);
  assert.equal(await mongoose.models.UserPermission.countDocuments({ user: before._id }), permissionCatalog.length - 1);
});

test('concurrent installers create exactly one administrator', async () => {
  const results = await Promise.all([bootstrapInstallation(credentials), bootstrapInstallation({ ...credentials, email: 'other@example.com' })]);
  assert.equal(results.filter((result) => result.created).length, 1);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
  assert.equal(await mongoose.models.Email.countDocuments(), 1);
});

test('invalid credentials roll back catalogs and the installation marker', async () => {
  await assert.rejects(bootstrapInstallation({ ...credentials, password: 'short' }));
  assert.equal(await mongoose.models.Installation.countDocuments(), 0);
  assert.equal(await mongoose.models.Permission.countDocuments(), 0);
  assert.equal(await mongoose.models.User.countDocuments(), 0);
});

test('setup refuses to promote users in a preexisting database', async () => {
  await new mongoose.models.User({ name: 'Existing', lastName: 'User', password: 'Existing-password-42' }).save();
  await assert.rejects(bootstrapInstallation(credentials), (error) => error.code === 'EXISTING_INSTALLATION');
  assert.equal(await mongoose.models.Installation.countDocuments(), 0);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
  assert.equal(await mongoose.models.Permission.countDocuments(), 0);
});

test('subsequent users can log in and access their own profile without managing other users', async () => {
  await bootstrapInstallation(credentials);
  const operator = await createOperator({ name: 'Operator', lastName: 'User', email: 'operator@example.com', password: 'Operator-password-42', state: 'injected', onboardingCompletedAt: new Date() });
  const stored = await mongoose.models.User.findById(operator._id).populate('state');
  assert.equal(stored.state.name, 'Activo');
  assert.equal(stored.onboardingCompletedAt, undefined);
  const assigned = await mongoose.models.UserPermission.find({ user: stored._id }).populate('permission');
  assert.equal(assigned.length, permissionCatalog.filter(isOperatorPermission).length);
  assert.ok(assigned.some(({ permission }) => permission.entity === 'User' && permission.name === 'getInfo'));
  assert.ok(assigned.every(({ permission }) => permission.entity !== 'User' || ['getInfo', 'update'].includes(permission.name)));
  assert.equal(assigned.some(({ permission }) => permission.entity === 'ActionLog'), false);
});

test('duplicate login email never leaves an orphan account or assignments', async () => {
  await bootstrapInstallation(credentials);
  await assert.rejects(createOperator(credentials), (error) => error.status === 409);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
  assert.equal(await mongoose.models.Email.countDocuments(), 1);
  assert.equal(await mongoose.models.UserPermission.countDocuments(), permissionCatalog.length);
});

test('missing permissions roll back account creation', async () => {
  await bootstrapInstallation(credentials);
  await mongoose.models.Permission.deleteOne({ entity: 'User', name: 'getInfo' });
  await assert.rejects(createOperator({ ...credentials, email: 'new@example.com' }), /permisos básicos/);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
});

test('credential validation rejects object injection and unsafe bcrypt input', () => {
  for (const input of [{ ...credentials, email: { $gt: '' } }, { ...credentials, password: 'a'.repeat(73) }, { ...credentials, password: ' password-with-space ' }]) {
    assert.throws(() => validateAccountInput(input));
  }
});

// Exercise the real CLI against the isolated, disposable replica set, never the project's .env.
test('the server CLI creates a usable administrator and can run again without credentials', async () => {
  const { execFile } = await import('node:child_process');
  const { promisify } = await import('node:util');
  const run = promisify(execFile);
  const env = { ...process.env, DB_HOST: replica.getUri(), DB_NAME: 'sessions', NODE_ENV: 'test', FRONTEND_URL: 'http://localhost:4200', SESSION_SECRET: 'test-session-secret-with-more-than-32-characters',
    SETUP_ADMIN_NAME: credentials.name, SETUP_ADMIN_LAST_NAME: credentials.lastName, SETUP_ADMIN_EMAIL: credentials.email, SETUP_ADMIN_PASSWORD: credentials.password };
  const first = await run(process.execPath, ['scripts/setup.js'], { env, cwd: new URL('..', import.meta.url), timeout: 60000 });
  assert.match(first.stdout, /Instalación completada/);
  assert.equal(first.stdout.includes(credentials.password), false);
  const email = await mongoose.models.Email.findOne({ email: 'admin@example.com' });
  const { UserModel } = await import('../models/models.js');
  assert.equal(await UserModel.compareHash(email.owner, 'password', credentials.password), true);
  for (const key of ['SETUP_ADMIN_NAME', 'SETUP_ADMIN_LAST_NAME', 'SETUP_ADMIN_EMAIL', 'SETUP_ADMIN_PASSWORD']) delete env[key];
  const second = await run(process.execPath, ['scripts/setup.js'], { env, cwd: new URL('..', import.meta.url), timeout: 60000 });
  assert.match(second.stdout, /ya estaba completada/);
  assert.equal(await mongoose.models.User.countDocuments(), 1);
});

test('the installed administrator authenticates through the actual login controller', async () => {
  const result = await bootstrapInstallation(credentials);
  const { default: AuthController } = await import('../controllers/auth/controller.js');
  const { UserModel, EmailModel } = await import('../models/models.js');
  const controller = AuthController({ userModel: UserModel, emailModel: EmailModel });
  const session = { save: (done) => done(null) };
  const response = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(body) { this.body = body; return this; } };
  await controller.logIn({ body: { email: credentials.email, password: credentials.password }, session }, response);
  assert.equal(response.statusCode, 200);
  assert.equal(String(session.userId), String(result.administratorId));
  assert.equal(JSON.stringify(response.body).includes(credentials.password), false);
});
