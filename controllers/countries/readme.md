# Countries controller

## Overview

`CountriesController` exposes a read-only, in-memory list of countries and their dial codes,
sourced from the `country-codes-flags-phone-codes` package and injected as the controller's
`model` in `config.js`.

The controller is created through a factory function:

```js
export default ({ id, model }) => new CountriesController(id, model);
```

## Responsibilities

- Normalize the raw country dataset into `{ code, idd }` pairs.
- Filter out entries missing a country code or a dial code.
- Return the list sorted alphabetically by country code.

This controller does not read from or write to the database; it derives its response purely
from the injected in-memory dataset.

## Methods

| Method | HTTP route | Description |
| --- | --- | --- |
| `getAll` | `GET /countries` | Returns every supported country as `{ code, idd }`, sorted by `code`. |

## Error handling

`getAll` performs synchronous data transformation only and does not have a failure path; no
`try/catch` or error status is used.

## Related files

- `controllers/countries/controller.js`: implementation.
- `routes/countries/routes.js`: route bindings, all protected by `OwlIsAuth`.
- `config.js`: supplies the `countries` dataset as the controller `model`.
