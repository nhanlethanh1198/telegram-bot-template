import type { Bot, Context } from "grammy";
import { join } from "path";
import fs from "node:fs";

export interface CallbackParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
  description?: string;
}

export interface BaseCallbackType {
  name: string;
  description?: string;
  parameters?: CallbackParameter[];
  category?: string;
  adminOnly?: boolean;
  cooldown?: number; // in seconds
  execute: (context: Context, data?: Record<string, any>) => Promise<unknown>;
}

const callbacks: BaseCallbackType[] = [];
const cooldowns = new Map<string, Map<string, number>>();

export function registerCallbacks(bot: Bot) {
  const filePattern = /\.callback\.ts$/; // like *.callback.ts
  const files = fs
    .readdirSync(join(__dirname))
    .filter((file) => filePattern.test(file));

  for (const file of files) {
    const callback = require(join(__dirname, file)).default;

    if (callback) {
      callbacks.push(callback);
    }
  }

  // Register callback query handler
  bot.on("callback_query", async (ctx) => {
    await handleCallbackQuery(ctx);
  });
}

async function handleCallbackQuery(context: Context) {
  if (!context.callbackQuery?.data) {
    await context.answerCallbackQuery("Invalid callback data");
    return;
  }

  try {
    const { action, data } = parseCallbackData(context.callbackQuery.data);
    const callback = callbacks.find((cb) => cb.name === action);

    if (!callback) {
      await context.answerCallbackQuery("Unknown action");
      return;
    }

    // Check cooldown
    if (callback.cooldown && !checkCooldown(context, callback)) {
      const remainingTime = getRemainingCooldown(context, callback);
      await context.answerCallbackQuery(
        `Please wait ${remainingTime} seconds before using this again.`,
      );
      return;
    }

    // Check admin permissions
    if (callback.adminOnly && !(await isAdmin(context))) {
      await context.answerCallbackQuery(
        "This action is only available for administrators.",
      );
      return;
    }

    // Validate parameters
    if (callback.parameters) {
      const validation = validateParameters(data, callback.parameters);
      if (!validation.valid) {
        await context.answerCallbackQuery(
          `Invalid parameters: ${validation.errors.join(", ")}`,
        );
        return;
      }
    }

    // Set cooldown
    if (callback.cooldown) {
      setCooldown(context, callback);
    }

    // Execute callback
    await callback.execute(context, data);
  } catch (error) {
    console.error("Error handling callback query:", error);
    await context.answerCallbackQuery("An error occurred");
  }
}

function parseCallbackData(callbackData: string): {
  action: string;
  data: Record<string, any>;
} {
  try {
    // Handle simple format: "action:param1=value1:param2=value2"
    if (callbackData.includes(":")) {
      const parts = callbackData.split(":");
      const action = parts[0];
      const data: Record<string, any> = {};

      for (let i = 1; i < parts.length; i++) {
        const splitPart = parts[i]?.split("=") || [];
        const key = splitPart[0];
        const value = splitPart.length > 1 ? splitPart[1] : undefined;
        if (key && value && value !== "") {
          // Try to parse as number or boolean
          if (value === "true") {
            data[key] = true;
          } else if (value === "false") {
            data[key] = false;
          } else if (!isNaN(Number(value))) {
            data[key] = Number(value);
          } else {
            data[key] = value;
          }
        }
      }

      return { action, data };
    }

    // Handle JSON format
    if (callbackData.startsWith("{")) {
      const parsed = JSON.parse(callbackData);
      const actionValue = parsed?.action || parsed?.cmd || "";
      return {
        action: String(actionValue),
        data: parsed?.data || parsed,
      };
    }

    // Simple action only
    return { action: callbackData, data: {} };
  } catch (error) {
    console.error("Error parsing callback data:", error);
    return { action: callbackData, data: {} };
  }
}

function validateParameters(
  data: Record<string, any>,
  parameters: CallbackParameter[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const param of parameters) {
    const value = data[param.name];

    // Check required parameters
    if (
      param.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`${param.name} is required`);
      continue;
    }

    // Skip validation if parameter is not provided and not required
    if (value === undefined || value === null) continue;

    // Type validation
    if (
      param.type === "number" &&
      (typeof value !== "number" || isNaN(value))
    ) {
      errors.push(`${param.name} must be a valid number`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function checkCooldown(context: Context, callback: BaseCallbackType): boolean {
  if (!callback.cooldown) return true;

  const userId = context.from?.id?.toString();
  if (!userId) return true;

  const userCooldowns = cooldowns.get(userId);
  if (!userCooldowns) return true;

  const lastUsed = userCooldowns.get(callback.name);
  if (!lastUsed) return true;

  const now = Date.now();
  const timePassed = (now - lastUsed) / 1000;

  return timePassed >= callback.cooldown;
}

function getRemainingCooldown(
  context: Context,
  callback: BaseCallbackType,
): number {
  if (!callback.cooldown) return 0;

  const userId = context.from?.id?.toString();
  if (!userId) return 0;

  const userCooldowns = cooldowns.get(userId);
  if (!userCooldowns) return 0;

  const lastUsed = userCooldowns.get(callback.name);
  if (!lastUsed) return 0;

  const now = Date.now();
  const timePassed = (now - lastUsed) / 1000;

  return Math.ceil(callback.cooldown - timePassed);
}

function setCooldown(context: Context, callback: BaseCallbackType): void {
  if (!callback.cooldown) return;

  const userId = context.from?.id?.toString();
  if (!userId) return;

  if (!cooldowns.has(userId)) {
    cooldowns.set(userId, new Map());
  }

  cooldowns.get(userId)!.set(callback.name, Date.now());
}

async function isAdmin(context: Context): Promise<boolean> {
  if (!context.chat || !context.from) return false;

  try {
    const member = await context.api.getChatMember(
      context.chat.id,
      context.from.id,
    );
    return member.status === "administrator" || member.status === "creator";
  } catch {
    return false;
  }
}

// Utility functions for creating callback data
export function createCallbackData(
  action: string,
  data: Record<string, any> = {},
): string {
  const params = Object.entries(data)
    .map(([key, value]) => `${key}=${value}`)
    .join(":");

  return params ? `${action}:${params}` : action;
}

export function createInlineKeyboard(
  buttons: Array<
    Array<{
      text: string;
      action: string;
      data?: Record<string, any>;
    }>
  >,
) {
  return {
    inline_keyboard: buttons.map((row) =>
      row.map((button) => ({
        text: button.text,
        callback_data: createCallbackData(button.action, button.data),
      })),
    ),
  };
}

export { callbacks };
