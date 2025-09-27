import type { Context } from "grammy";
import type { BaseCommandType } from ".";

const command: BaseCommandType = {
  name: "whatime",
  aliases: ["time", "wt"],
  description: "Display current time with optional timezone",
  category: "Utility",
  cooldown: 5, // 5 seconds cooldown
  parameters: [
    {
      name: "timezone",
      type: "string",
      required: false,
      description: "Timezone (e.g., UTC, America/New_York, Europe/London)",
      choices: [
        "UTC",
        "America/New_York",
        "Europe/London",
        "Asia/Tokyo",
        "Australia/Sydney",
      ],
    },
    {
      name: "format",
      type: "string",
      required: false,
      description: "Time format (12h or 24h)",
      choices: ["12h", "24h"],
    },
  ],
  execute: async (context: Context, args?: Record<string, any>) => {
    try {
      const timezone = args?.timezone || "UTC";
      const format = args?.format || "24h";

      const now = new Date();

      let timeOptions: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      };

      if (format === "12h") {
        timeOptions.hour12 = true;
      } else {
        timeOptions.hour12 = false;
      }

      const formattedTime = now.toLocaleString("en-US", timeOptions);

      const message =
        `🕐 **Current Time**\n\n` +
        `📅 Date & Time: ${formattedTime}\n` +
        `🌍 Timezone: ${timezone}\n` +
        `⏰ Format: ${format === "12h" ? "12-hour" : "24-hour"}\n` +
        `⏱️ Unix Timestamp: ${Math.floor(now.getTime() / 1000)}`;

      await context.reply(message, { parse_mode: "Markdown" });
    } catch (error) {
      console.error("Error in whatime command:", error);

      if (
        args?.timezone &&
        ![
          "UTC",
          "America/New_York",
          "Europe/London",
          "Asia/Tokyo",
          "Australia/Sydney",
        ].includes(args.timezone)
      ) {
        await context.reply(
          "❌ Invalid timezone. Please use one of: UTC, America/New_York, Europe/London, Asia/Tokyo, Australia/Sydney",
        );
      } else {
        const simpleTime = new Date().toLocaleTimeString();
        await context.reply(`🕐 Current time: ${simpleTime}`);
      }
    }
  },
};

export default command;
