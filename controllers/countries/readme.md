# Countries Controller

## Responsibility

Provides a read-only country dataset supplied by `country-codes-flags-phone-codes`.

## Public methods

- `getAll`: maps the injected dataset into the API response, removes unusable entries, and sorts the result for display.

## Dependencies

The factory accepts `{ id, model }`, where `model` is the imported country dataset rather than an `OwlModel` instance.

## Authentication

The current `/countries` router is public and does not use `OwlIsAuth`.
