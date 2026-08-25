# User Controller

## Responsibility

Handles user registration and authenticated account operations.

## Public methods

- `register`: creates a user and assigns every permission whose name does not start with `user:`.
- `getInfo`: returns the current user using `req.session.userId`.
- `update`: updates the current user's account.

## Dependencies

The factory accepts `{ entityId, model, permissionModel, userPermissionModel, populatedFields }`.

## Registration behavior

The user is saved first. When permission dependencies are configured, non-user permissions are loaded and assigned with `UserPermissionModel`.

## Limitations

Permission assignment is not transactional. A failure while assigning permissions is returned as a registration error after the user may already exist.
