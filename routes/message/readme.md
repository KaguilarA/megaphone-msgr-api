# Message Routes

Base path: `/message`.

All routes use `OwlIsAuth` and the matching message permission.

| Method | Path | Responsibility |
| --- | --- | --- |
| POST | `/` | Send a message to owned contacts and record recipient delivery results. Accepts multipart form data with at most one optional `media` file. |
| GET | `/` | List messages sent by the session user. |
| GET | `/whatsapp/chats?sourcePhoneId=...` | Read chat summaries directly from the selected WAHA session. |
| GET | `/whatsapp/chats/:chatId/messages?sourcePhoneId=...` | Read chat messages directly from the selected WAHA session. |
| GET | `/:id` | Read a message and its recipients. |
| DELETE | `/:id` | Remove a message from Megaphone history only; this does not delete it from WhatsApp or email. |

WAHA chat history is fetched on demand and is not copied into MongoDB; the WAHA session must have Store enabled. Attachments are limited to JPEG, PNG or static WebP images (5 MiB), and MP4 or 3GP videos (16 MiB). For messages with media, content is sent as the caption and is limited to 1024 characters; text-only messages allow 4096. Images are optimized locally with Sharp without resizing, then image or video bytes are sent directly to WAHA as base64. Attachment bytes and metadata are not stored in MongoDB. WAHA and WhatsApp account policies still apply.
