import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "admin_stats",
  description: "Show detailed bot statistics",
  category: "Admin",
  adminOnly: true,
  execute: async (context: Context) => {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();

    const statsMessage = `📊 **Detailed Bot Statistics**

⏱️ **Performance:**
• Uptime: ${formatUptime(uptime)}
• Memory Heap Used: ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB
• Memory Heap Total: ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB
• Memory RSS: ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB
• Memory External: ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB

🖥️ **System:**
• Node.js Version: ${process.version}
• Platform: ${process.platform} ${process.arch}
• Process ID: ${process.pid}
• Working Directory: ${process.cwd()}

📈 **Runtime:**
• Started: ${new Date(Date.now() - uptime * 1000).toLocaleString()}
• Environment: ${process.env.NODE_ENV || "development"}
• Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}

💾 **Features:**
• Commands: Dynamic loading enabled
• Callbacks: Interactive buttons enabled
• Cooldowns: Active
• Admin Controls: Enabled`;

    const keyboard = createInlineKeyboard([
      [
        { text: "🔄 Refresh", action: "admin_stats" },
        { text: "🔧 System Info", action: "admin_system" },
      ],
      [{ text: "🏠 Admin Panel", action: "admin_panel" }],
    ]);

    await context.editMessageText(statsMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery("Statistics refreshed!");
  },
};

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(" ");
}

export default callback;
