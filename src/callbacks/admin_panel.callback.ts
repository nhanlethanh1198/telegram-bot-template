import type { Context } from "grammy";
import type { BaseCallbackType } from ".";
import { createInlineKeyboard } from ".";

const callback: BaseCallbackType = {
  name: "admin_panel",
  description: "Show admin control panel",
  category: "Admin",
  adminOnly: true,
  execute: async (context: Context) => {
    const uptime = process.uptime();
    const uptimeFormatted = formatUptime(uptime);
    const memoryUsage = process.memoryUsage();
    const memoryMB = (memoryUsage.heapUsed / 1024 / 1024).toFixed(2);

    const adminMessage = `👑 **Admin Control Panel**

🤖 **Bot Status:**
• Status: ✅ Online
• Uptime: ${uptimeFormatted}
• Memory Usage: ${memoryMB} MB
• Node.js Version: ${process.version}
• Platform: ${process.platform}

📊 **Quick Stats:**
• Commands Available: Available via /help
• Active Since: ${new Date(Date.now() - uptime * 1000).toISOString()}
• Process ID: ${process.pid}

🛠️ **Available Actions:**
Use the buttons below or commands:
• \`/admin stats\` - Detailed statistics
• \`/admin users\` - User information
• \`/admin broadcast\` - Broadcast help
• \`/admin restart\` - Restart confirmation`;

    const keyboard = createInlineKeyboard([
      [
        { text: "📊 Statistics", action: "admin_stats" },
        { text: "👥 Users", action: "admin_users" },
      ],
      [
        { text: "📢 Broadcast Help", action: "admin_broadcast" },
        { text: "🔧 System Info", action: "admin_system" },
      ],
      [{ text: "⚠️ Restart Bot", action: "admin_restart" }],
      [{ text: "🏠 Back to Menu", action: "back_to_start" }],
    ]);

    await context.editMessageText(adminMessage, {
      parse_mode: "Markdown",
      reply_markup: keyboard,
    });

    await context.answerCallbackQuery("Admin panel loaded!");
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
