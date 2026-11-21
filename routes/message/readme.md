# Message Routes

Base path: `/message`.

All routes use `OwlIsAuth` and the matching message permission.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Send a message to owned contacts and record recipient delivery results. Accepts up to 10 image files and one optional video as repeated `media` multipart fields. |
| GET | `/` | List messages sent by the session user. |
| GET | `/whatsapp/chats?sourcePhoneId=...` | Read chat summaries directly from the selected WAHA session. |
| GET | `/whatsapp/chats/:chatId/messages?sourcePhoneId=...` | Read chat messages directly from the selected WAHA session. |
| GET | `/:id` | Read a message and its recipients. |
| DELETE | `/:id` | Remove a message from Megaphone history only; this does not delete it from WhatsApp or email. |

WAHA chat history is fetched on demand and is not copied into MongoDB; the WAHA session must have Store enabled. Attachments are limited to 10 JPEG, PNG or static WebP images (5 MiB each) and one MP4 or 3GP video (16 MiB), with a 50 MiB total request limit. For messages with media, content is limited to 1024 characters; text-only messages allow 4096. Images are optimized locally with Sharp without resizing, then image or video bytes are sent directly to WAHA as base64. Images and an optional video may be mixed. In the `per-media` sender mode, each selected image is sent concurrently to every recipient from a distinct selected sender; the optional video uses the first sender and text is captioned on the first image only. Attachment bytes are not stored in MongoDB; image URLs and per-attachment delivery results are retained. WAHA and WhatsApp account policies still apply.
