import { getAutoReplyTemplateFields, AUTO_REPLY_TEMPLATE_FIELDS } from "../../utils/autoReplyTemplate.js";

const MAX_RULES = 50;
const MAX_HISTORY = 100;

export default function ({ automationModel, conversationMessageModel }) {
  function requestError(message, status = 400) {
    return Object.assign(new Error(message), { status });
  }

  function validateRules(rules) {
    if (!Array.isArray(rules) || rules.length > MAX_RULES) {
      throw requestError(`rules must be an array with no more than ${MAX_RULES} items.`);
    }

    const keywords = new Set();
    return rules.map((rule) => {
      if (!rule || typeof rule !== "object" || Array.isArray(rule)) {
        throw requestError("Each rule must be an object.");
      }
      if (typeof rule.keyword !== "string" || !rule.keyword.trim() || rule.keyword.trim().length > 120) {
        throw requestError("Each rule needs a keyword or phrase of 1-120 characters.");
      }
      if (typeof rule.response !== "string" || !rule.response.trim() || rule.response.trim().length > 4096) {
        throw requestError("Each rule needs a response template of 1-4096 characters.");
      }
      if (rule.enabled !== undefined && typeof rule.enabled !== "boolean") {
        throw requestError("Rule enabled must be a boolean.");
      }

      const keyword = rule.keyword.trim();
      const normalizedKeyword = keyword.toLocaleLowerCase();
      if (keywords.has(normalizedKeyword)) {
        throw requestError("Rule keywords must be unique.");
      }
      keywords.add(normalizedKeyword);

      const unknownFields = getAutoReplyTemplateFields(rule.response.trim())
        .filter((field) => !AUTO_REPLY_TEMPLATE_FIELDS.includes(field));
      if (unknownFields.length) {
        throw requestError(`Unknown response template fields: ${[...new Set(unknownFields)].join(", ")}.`);
      }

      return {
        keyword,
        response: rule.response.trim(),
        enabled: rule.enabled !== false,
      };
    });
  }

  async function getRecentMessages(owner) {
    return conversationMessageModel?.getLatest
      ? conversationMessageModel.getLatest({ owner }, MAX_HISTORY)
      : [];
  }

  async function get(req, res) {
    try {
      const owner = req.session.userId;
      const [configuration, recentMessages] = await Promise.all([
        automationModel.getOne({ owner }),
        getRecentMessages(owner),
      ]);
      return res.json({
        enabled: configuration?.enabled || false,
        rules: configuration?.rules || [],
        recentMessages,
      });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  async function update(req, res) {
    try {
      const owner = req.session.userId;
      const body = req.body || {};
      if (typeof body.enabled !== "boolean") {
        throw requestError("enabled must be a boolean.");
      }
      const rules = validateRules(body.rules);
      const current = await automationModel.getOne({ owner });
      const configuration = current
        ? await automationModel.update(current._id, { enabled: body.enabled, rules }, { runValidators: true })
        : await automationModel.save({ owner, enabled: body.enabled, rules });
      return res.json({
        enabled: configuration.enabled,
        rules: configuration.rules,
      });
    } catch (error) {
      return res.status(error.status || 500).json({ error: error.message });
    }
  }

  return { get, update };
}
