import type { Bot, Context } from "grammy";
import { join } from "path";
import fs from "node:fs";

export interface CommandParameter {
  name: string;
  type: "string" | "number" | "boolean";
  required?: boolean;
  description?: string;
  choices?: string[] | number[];
}

export interface BaseCommandType {
  name: string;
  aliases?: string[];
  description?: string;
  parameters?: CommandParameter[];
  category?: string;
  adminOnly?: boolean;
  cooldown?: number; // in seconds
  execute: (context: Context, args?: Record<string, any>) => Promise<unknown>;
}

const commands: BaseCommandType[] = [];
const cooldowns = new Map<string, Map<string, number>>();

export function registerCommands(bot: Bot) {
  const filePattern = /\.command\.ts$/; // like *.command.ts
  const files = fs
    .readdirSync(join(__dirname))
    .filter((file) => filePattern.test(file));

  for (const file of files) {
    const command = require(join(__dirname, file)).default;

    if (command) {
      commands.push(command);

      // Register aliases
      if (command.aliases) {
        for (const alias of command.aliases) {
          bot.command(alias, (ctx) => handleCommand(ctx, command));
        }
      }

      // Register main command
      bot.command(command.name, (ctx) => handleCommand(ctx, command));
    }
  }
}

async function handleCommand(context: Context, command: BaseCommandType) {
  try {
    // Check cooldown
    if (command.cooldown && !checkCooldown(context, command)) {
      const remainingTime = getRemainingCooldown(context, command);
      await context.reply(
        `⏰ Please wait ${remainingTime} seconds before using this command again.`,
      );
      return;
    }

    // Check admin permissions
    if (command.adminOnly && !(await isAdmin(context))) {
      await context.reply(
        "❌ This command is only available for administrators.",
      );
      return;
    }

    // Parse arguments
    const args = parseArguments(context, command);

    // Validate required parameters
    if (command.parameters) {
      const validation = validateParameters(args, command.parameters);
      if (!validation.valid) {
        await context.reply(
          `❌ Invalid parameters:\n${validation.errors.join("\n")}\n\nUsage: ${getCommandUsage(command)}`,
        );
        return;
      }
    }

    // Set cooldown
    if (command.cooldown) {
      setCooldown(context, command);
    }

    // Execute command
    await command.execute(context, args);
  } catch (error) {
    console.error(`Error executing command ${command.name}:`, error);
    await context.reply("❌ An error occurred while executing this command.");
  }
}

function parseArguments(
  context: Context,
  command: BaseCommandType,
): Record<string, any> {
  if (!context.match || !command.parameters) return {};

  const text = context.match.toString().trim();
  const args: Record<string, any> = {};

  if (!text) return args;

  // Simple space-separated parsing
  const parts = text.split(/\s+/);

  command.parameters.forEach((param, index) => {
    if (parts[index] !== undefined) {
      const value = parts[index];

      switch (param.type) {
        case "number":
          const num = parseFloat(value);
          if (!isNaN(num)) {
            args[param.name] = num;
          }
          break;
        case "boolean":
          args[param.name] = ["true", "yes", "1", "on"].includes(
            value.toLowerCase(),
          );
          break;
        default:
          args[param.name] = value;
      }
    }
  });

  return args;
}

function validateParameters(
  args: Record<string, any>,
  parameters: CommandParameter[],
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const param of parameters) {
    const value = args[param.name];

    // Check required parameters
    if (
      param.required &&
      (value === undefined || value === null || value === "")
    ) {
      errors.push(`• ${param.name} is required`);
      continue;
    }

    // Skip validation if parameter is not provided and not required
    if (value === undefined || value === null) continue;

    // Validate choices
    if (param.choices && param.choices.length > 0) {
      const hasValidChoice = param.choices.some((choice) => choice === value);
      if (!hasValidChoice) {
        errors.push(
          `• ${param.name} must be one of: ${param.choices.join(", ")}`,
        );
      }
    }

    // Type validation
    if (
      param.type === "number" &&
      (typeof value !== "number" || isNaN(value))
    ) {
      errors.push(`• ${param.name} must be a valid number`);
    }
  }

  return { valid: errors.length === 0, errors };
}

function getCommandUsage(command: BaseCommandType): string {
  let usage = `/${command.name}`;

  if (command.parameters) {
    for (const param of command.parameters) {
      const paramStr = param.required ? `<${param.name}>` : `[${param.name}]`;
      usage += ` ${paramStr}`;
    }
  }

  return usage;
}

function checkCooldown(context: Context, command: BaseCommandType): boolean {
  if (!command.cooldown) return true;

  const userId = context.from?.id?.toString();
  if (!userId) return true;

  const userCooldowns = cooldowns.get(userId);
  if (!userCooldowns) return true;

  const lastUsed = userCooldowns.get(command.name);
  if (!lastUsed) return true;

  const now = Date.now();
  const timePassed = (now - lastUsed) / 1000;

  return timePassed >= command.cooldown;
}

function getRemainingCooldown(
  context: Context,
  command: BaseCommandType,
): number {
  if (!command.cooldown) return 0;

  const userId = context.from?.id?.toString();
  if (!userId) return 0;

  const userCooldowns = cooldowns.get(userId);
  if (!userCooldowns) return 0;

  const lastUsed = userCooldowns.get(command.name);
  if (!lastUsed) return 0;

  const now = Date.now();
  const timePassed = (now - lastUsed) / 1000;

  return Math.ceil(command.cooldown - timePassed);
}

function setCooldown(context: Context, command: BaseCommandType): void {
  if (!command.cooldown) return;

  const userId = context.from?.id?.toString();
  if (!userId) return;

  if (!cooldowns.has(userId)) {
    cooldowns.set(userId, new Map());
  }

  cooldowns.get(userId)!.set(command.name, Date.now());
}

async function isAdmin(context: Context): Promise<boolean> {
  // Basic admin check - you can enhance this based on your needs
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

export const buildCommandList = () => {
  const categories = new Map<string, BaseCommandType[]>();

  // Group commands by category
  for (const command of commands) {
    const category = command.category || "General";
    if (!categories.has(category)) {
      categories.set(category, []);
    }
    categories.get(category)!.push(command);
  }

  let result = "";

  for (const [category, categoryCommands] of categories) {
    result += `\n📁 **${category}**\n`;

    for (const command of categoryCommands) {
      let commandInfo = `/${command.name}`;

      if (command.aliases && command.aliases.length > 0) {
        commandInfo += ` (${command.aliases.map((a) => `/${a}`).join(", ")})`;
      }

      if (command.parameters && command.parameters.length > 0) {
        const paramStr = command.parameters
          .map((p) => (p.required ? `<${p.name}>` : `[${p.name}]`))
          .join(" ");
        commandInfo += ` ${paramStr}`;
      }

      commandInfo += ` - ${command.description || "No description"}`;

      if (command.adminOnly) {
        commandInfo += " 👑";
      }

      if (command.cooldown) {
        commandInfo += ` ⏰${command.cooldown}s`;
      }

      result += `  ${commandInfo}\n`;
    }
  }

  return result;
};

export async function updateCommandList(bot: Bot) {
  await bot.api.deleteMyCommands();

  const mappedCommands: { command: string; description: string }[] = [];

  for (const cmd of commands) {
    let description = cmd.description || "No description provided";

    if (cmd.parameters && cmd.parameters.length > 0) {
      const paramStr = cmd.parameters
        .map((p) => (p.required ? `<${p.name}>` : `[${p.name}]`))
        .join(" ");
      description += ` ${paramStr}`;
    }

    mappedCommands.push({
      command: cmd.name,
      description: description.slice(0, 256), // Telegram limit
    });

    if (cmd.aliases) {
      for (const alias of cmd.aliases) {
        mappedCommands.push({
          command: alias,
          description: description.slice(0, 256),
        });
      }
    }
  }

  await bot.api.setMyCommands(mappedCommands);
}

export { commands };
