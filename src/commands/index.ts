import type { Bot, Context } from "grammy";
import { join } from "path";
import fs from "node:fs";

export interface BaseCommandType {
  name: string;
  aliases?: string[];
  description?: string;
  execute: (context: Context) => Promise<unknown>;
}

const commands: BaseCommandType[] = [];

export function registerCommands(bot: Bot) {
  const filePattern = /\.command\.ts$/; // like *.command.ts
  const files = fs
    .readdirSync(join(__dirname))
    .filter((file) => filePattern.test(file));

  for (const file of files) {
    const command = require(join(__dirname, file)).default;

    if (command) {
      commands.push(command);
      if (command.aliases) {
        for (const alias of command.aliases) {
          bot.command(alias, command.execute);
        }
      }

      // register main command
      bot.command(command.name, command.execute);
    }
  }
}

export const buildCommandList = () => {
  const commandList = commands.map((command) => {
    const { name, aliases, description } = command;
    let msg = `/${name}`;

    if (aliases) {
      msg += " (Aliases:";
      for (const alias of aliases) {
        msg += ` /${alias}`;
      }
      msg += ")";
    }
    msg += ` - ${description}`;
    return msg;
  });

  return commandList.join("\n");
};

export async function updateCommandList(bot: Bot) {
  await bot.api.deleteMyCommands();
  await bot.api.setMyCommands(
    commands.map((command) => ({
      command: command.name,
      description: command.description || "No description provided",
    })),
  );
}
