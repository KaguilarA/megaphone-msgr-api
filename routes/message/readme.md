# Message Routes

Base path: `/message`.

All routes use `OwlIsAuth` and the matching message permission.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Send a message to owned contacts and record recipient delivery results. Accepts multipart form data with at most one optional `media` file. |
| GET | `/` | List messages sent by the session user. |
| GET | `/:id` | Read a message and its recipients. |
Attachments are limited to JPEG, PNG or static WebP images (5 MiB), and MP4 or 3GP videos (16 MiB). For messages with media, content is sent as the caption and is limited to 1024 characters; text-only messages allow 4096. Images require TinyPNG and Cloudinary; videos require Cloudinary. WAHA and WhatsApp account policies still apply.
