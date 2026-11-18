export const AUTO_REPLY_TEMPLATE_FIELDS = [
  "contact.name",
  "contact.phone",
  "message.text",
  "history.lastInbound",
  "history.lastReply",
];

const TEMPLATE_FIELD_PATTERN = /{{\s*([\w.]+)\s*}}/g;

export function getAutoReplyTemplateFields(template) {
  return [...template.matchAll(TEMPLATE_FIELD_PATTERN)].map((match) => match[1]);
}

export function renderAutoReplyTemplate(template, values) {
  let missingField = false;
  const text = template.replace(TEMPLATE_FIELD_PATTERN, (_match, field) => {
    const value = values[field];
    if (typeof value !== "string" || !value.trim()) {
      missingField = true;
      return "";
    }
    return value;
  });
  return missingField ? undefined : text.trim() || undefined;
}
