import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "time",
  description: "Show current time via callback with timezone options",
  category: "Utility",
  cooldown: 3, // 3 seconds cooldown
  execute: async (context: Context, data?: Record<string, any>) => {
    try {
      const timezone = data?.timezone || "UTC";
      const format = data?.format || "24h";

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

      // Create timezone selection keyboard
      const keyboard = createInlineKeyboard([
        [
          { text: "🌍 UTC", action: "time", data: { timezone: "UTC", format } },
          {
            text: "🇺🇸 New York",
            action: "time",
            data: { timezone: "America/New_York", format },
          },
        ],
        [
          {
            text: "🇬🇧 London",
            action: "time",
            data: { timezone: "Europe/London", format },
          },
          {
            text: "🇯🇵 Tokyo",
            action: "time",
            data: { timezone: "Asia/Tokyo", format },
          },
        ],
        [
          {
            text: "🇦🇺 Sydney",
            action: "time",
            data: { timezone: "Australia/Sydney", format },
          },
        ],
        [
          {
            text: format === "12h" ? "🕐 24-hour" : "🕐 12-hour",
            action: "time",
            data: { timezone, format: format === "12h" ? "24h" : "12h" },
          },
          { text: "🔄 Refresh", action: "time", data: { timezone, format } },
        ],
        [{ text: "🏠 Back to Menu", action: "back_to_start" }],
      ]);

      await context.editMessageText(message, {
        parse_mode: "Markdown",
        reply_markup: keyboard,
      });

      await context.answerCallbackQuery(
        `Time updated for ${timezone} (${format})`,
      );
    } catch (error) {
      console.error("Error in time callback:", error);
      await context.answerCallbackQuery("Error getting time information");
    }
  },
};

export default callback;
