# Help Functionality for Telegram Bot

## Overview

This document demonstrates the new `--help` functionality added to the Telegram bot. Every command now supports detailed help information that can be accessed using the `--help` flag.

## How to Use

### Basic Usage
```
/<command> --help
```

### Examples
- `/poll --help` - Shows detailed help for the poll command
- `/calc --help` - Shows detailed help for the calculator command  
- `/start --help` - Shows detailed help for the start command
- `/help --help` - Shows detailed help for the help command itself

## What Information is Displayed

When you use `--help` with any command, you'll see:

1. **Description** - What the command does
2. **Usage** - Correct syntax with required/optional parameters
3. **Aliases** - Alternative names for the command (if any)
4. **Parameters** - Detailed parameter information including:
   - Parameter name and type
   - Whether it's required or optional
   - Description of what it does
   - Valid options (if applicable)
5. **Examples** - Real usage examples
6. **Category** - Command category
7. **Admin Only** - If the command requires admin privileges
8. **Cooldown** - If there's a waiting period between uses

## Example Output

### `/poll --help`
```
📖 **Help for /poll**

📝 **Description:**
Create interactive polls with multiple options

🔧 **Usage:**
`/poll <question> <options> [anonymous] [multiple]`

🔗 **Aliases:**
`/vote`, `/survey`

📋 **Parameters:**
• `question` (String) - **Required**
  The poll question

• `options` (String) - **Required**
  Poll options separated by semicolons (;)

• `anonymous` (Boolean) - *Optional*
  Make the poll anonymous (true/false, default: false)

• `multiple` (Boolean) - *Optional*
  Allow multiple answers (true/false, default: false)

💡 **Examples:**
`/poll "What's your favorite color?" "Red;Blue;Green;Yellow"`
`/poll "Choose a meeting time" "9 AM;10 AM;11 AM" true false`

📁 **Category:** Social
⏰ **Cooldown:** 10 seconds

💡 **Tip:** You can use `/poll --help` anytime to see this help message.
```

## Integration with Existing Help System

The `--help` functionality works alongside the existing `/help` command:

- `/help` - Shows all available commands
- `/help <command>` - Shows detailed help for a specific command
- `/<command> --help` - Shows detailed help for that command directly

## Error Messages Enhancement

When command parameters are invalid, error messages now include a helpful tip:
```
❌ Invalid parameters:
• question is required

Usage: /poll <question> <options> [anonymous] [multiple]

💡 Use `/poll --help` for detailed help.
```

## Features

### Automatic Detection
The system automatically detects when `--help` is used with any command and shows the help instead of executing the command.

### Flexible Usage
- Works with partial text: `/poll --help`
- Works with mixed content: `/poll some text --help`
- Case insensitive

### Rich Formatting
- Uses Markdown formatting for better readability
- Emojis for visual organization
- Clear parameter type indicators
- Required vs optional parameter distinction

### Command-Specific Examples
Special examples are provided for commonly used commands like:
- `/poll` - Shows poll creation examples
- `/calc` - Shows calculation examples
- Generic examples for other commands based on their parameters

## Implementation Details

### Code Changes Made

1. **Modified `handleCommand()` function** - Added help detection before command execution
2. **Added `generateCommandHelp()` function** - Creates formatted help text
3. **Enhanced error messages** - Added help tips to validation errors
4. **Updated `/help` command** - Added mention of `--help` functionality
5. **Exported help function** - Made it available for the help command

### Technical Features

- **Parameter Analysis** - Automatically generates examples based on parameter types
- **Alias Support** - Shows all available aliases for commands
- **Type Safety** - Maintains full TypeScript compatibility
- **Performance** - Help generation is fast and doesn't impact normal command execution
- **Extensible** - Easy to add custom examples for specific commands

## Benefits

1. **User-Friendly** - Users can get help without leaving the current context
2. **Comprehensive** - Shows all relevant information about a command
3. **Consistent** - Same format across all commands
4. **Accessible** - Works with any command, including aliases
5. **Educational** - Helps users learn proper command syntax and options

## Usage Tips

- Use `--help` when you're unsure about command parameters
- Check examples section for real-world usage patterns
- Note the cooldown information to avoid rate limiting
- Pay attention to required vs optional parameters
- Use aliases if you prefer shorter command names

This enhancement makes the bot much more user-friendly and self-documenting!