import { Bot } from "grammy";
import { registerCommands, updateCommandList } from "./commands";

function main() {
  const telegramToken = Bun.env.TELEGRAM_BOT_TOKEN;
  if (!telegramToken) {
    console.error("Telegram bot token is missing.");
    process.exit(1);
  }
  const bot = new Bot(telegramToken, {
    client: {
      environment: "prod",
      timeoutSeconds: 10000,
    },
  });

  updateCommandList(bot);

  registerCommands(bot);

  bot.start();
}

main();
