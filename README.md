# 🛡️ Vanguard | Advanced Discord Moderation Ecosystem

<div align="center">  
  [![Discord Support](https://img.shields.io/badge/Discord-Support-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/3TJEacm6RD)
  [![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot)
  [![Node.JS](https://img.shields.io/badge/Node.js-%3E%3D20.0.0-brightgreen?style=for-the-badge&logo=node.js)](https://nodejs.org/)
  [![Discord.JS](https://img.shields.io/badge/Discord.js-v14-blue?style=for-the-badge&logo=discord)](https://discord.js.org/)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot/blob/main/LICENSE)
</div>

---

## 💎 Overview

**Vanguard** is not just another moderation bot; it is a premium, high-performance community protection framework engineered specifically to prevent chaos with surgical precision. 

Built on top of a blazing fast in-memory LRU caching system paired with atomic SQLite database transactions, Vanguard completely eliminates race conditions, API phantom-actions, and runtime errors to guarantee that your server's moderation trail is **always perfect, synchronized, and secure.**

> "Protecting your community, one command at a time."

---

## 🔥 Enterprise Architecture & Resilience

Vanguard operates on a fundamentally different reliability layer than conventional bots.

### 🛡️ Fail-Safe Moderation Synchronization ("DM-And-Fail" Protection)
A notorious flaw in Discord bots is attempting to direct message an offender *before* punishing them, only for the subsequent punishment (like a ban) to fail due to missing hierarchical permissions—resulting in an unpunished user receiving a false ban alert. Vanguard enforces targeted absolute boolean checks (`PermissionFlagsBits`) completely independent of the standard execution path to ensure it 100% holds the required rights before initiating any external interactions.

### ⚡ True Least-Recently-Used (LRU) Caching
Vanguard does not read configurations from the disk for every user interaction. Everything is securely stored in a dynamic Javascript Map matrix utilizing a true LRU algorithm. If a server goes quiet, its local cache falls to the back of the eviction queue, ensuring zero memory bloat while optimizing your most active guilds.

### 📊 Atomic Case Management Transactions
Powered by `better-sqlite3`, every single punishment log handles database locks internally. Case numbers are assigned through an atomic subquery `(SELECT IFNULL(MAX(caseNumber), 0) + 1)`, meaning if 50 server raids occur on the same exact millisecond, every single case ID will be precisely sequential without race-condition collisions.

---

## 📚 General Feature Offerings

- **🎨 Per-Guild Custom Branding:** Overwrite default emojis seamlessly with your own. Use `/config emojis` to set unique icons for success, error, ban, timeout, and warn operations.
- **🔐 Multi-Layer Privacy:** Error and diagnostic operations are strictly isolated. Critical bot failures are routed selectively via Developer Privacy Guards to the support server, whereas actual guild infractions remain firmly inside that specific server's log channel.
- **🚨 Advanced Error Recovery:** Rejections from expired interaction tokens or Discord API 500 Outages are natively intercepted through global nested `try/catch` fallbacks ensuring your bot *never* turns offline unexpectedly.

---

## 💻 Full Command Registry

Vanguard uses full Discord Application (Slash) Commands.

### 🔨 Moderation Protocol
| Command | Description | Required Permissions |
| --- | --- | --- |
| `/ban [user] [reason]` | Permanently banishes a user from the guild | `Ban Members` |
| `/unban [user] [reason]` | Revokes a permanent ban from a specific ID | `Ban Members` |
| `/kick [user] [reason]` | Swiftly kicks an active user from the guild | `Kick Members` |
| `/timeout [user] [duration] [reason]` | Restricts a user's communication (5s - 28d) | `Moderate Members` |
| `/untimeout [user] [reason]` | Immediately removes a user from communication timeout | `Moderate Members` |
| `/warn [user] [reason]` | Formally logs a warning into the user's permanent record | `Moderate Members` |
| `/unwarn [user] [reason]` | Retracts a specific warning from the database log | `Moderate Members` |
| `/logs [user]` | Fetches the comprehensive infraction history of an ID | `Moderate Members` |

### ⚙️ Guild Configuration Management
| Command | Description | Required Permissions |
| --- | --- | --- |
| `/config logs [channel]` | Routes all moderation embeds for that specific server to a designated channel | `Administrator` |
| `/config emojis [key] [emoji]` | Maps a custom Discord Emoji (e.g. `<:check:1234>`) to overwrite default UI symbols | `Administrator` |

---

## 📡 Full Setup & Installation

Vanguard operates cleanly on modern Node.js environments.

### 🛠️ Prerequisites
- **Node.js**: `v20.0.0` or higher.
- **NPM Modules**: Built specifically around `discord.js v14` and Native Fetch (`undici`).

### 📥 1. Cloning & Staging
Pull the production codebase from the secure repository.
```bash
git clone https://github.com/SEJED-DEV/Vanguard-discord-bot.git
cd Vanguard-discord-bot
```

### 📦 2. Dependency Matrix
Install the raw package modules.
```bash
npm install
```

### 🔑 3. Environment Population
You must define your Discord Application Portal secrets. The bot will automatically **HALT** with a `[CRITICAL-FATAL]` log if these are missing to protect your runtime environment.
```bash
cp .env.example .env
```
Populate your `.env` securely:
```env
# Application Core (REQUIRED)
TOKEN="your_discord_bot_token_here"
CLIENT_ID="your_bot_application_id_here"

# Privacy & Logging Matrix
OWNER_ID="your_discord_developer_id"
SUPPORT_SERVER_ID="server_id_where_errors_log"
```

### 🚀 4. Deployment & Boot Sequence
For local development and testing:
```bash
node src/index.js
```

**For Production Environments (Recommended):**
Do not run `node` natively in production. Utilize `pm2` for daemon clustering and crash redundancy.
```bash
npm install -g pm2
pm2 start src/index.js --name "vanguard-bot"
pm2 save
pm2 startup
```

---

## 🛠️ Diagnostics & Troubleshooting

Vanguard provides verbose deployment logging. If you run into issues, consult the list below:

* `[ERROR] CLIENT_ID is missing from environment variables.`
  * **Fix:** The bot requires your Discord Application ID to register the Slash Commands with the global API. Add `CLIENT_ID` to your `.env` and restart.
* `Failed to log to guild... Missing Log Permissions.`
  * **Fix:** Ensure the Bot has been granted `Send Messages`, `View Channel`, and `Embed Links` in whatever `#log` channel you selected via `/config logs`.
* The server configuration isn't updating correctly or commands say "Interaction Failed".
  * **Fix:** You may be suffering an extreme momentary Discord API Outage. Thanks to Vanguard's Smart Interaction recovery, simply try the command again.

---

## 🤝 Support & Socials

<div align="left">
  <a href="https://discord.gg/3TJEacm6RD">
    <img src="https://img.shields.io/badge/Discord-Support-5865F2?style=for-the-badge&logo=discord&logoColor=white" alt="Discord Support">
  </a>
  <a href="https://www.instagram.com/http.sejed.official/">
    <img src="https://img.shields.io/badge/Instagram-Follow-E4405F?style=for-the-badge&logo=instagram&logoColor=white" alt="Instagram">
  </a>
</div>

- **Support Server**: [Join Vanguard Headquarters](https://discord.gg/3TJEacm6RD)
- **Developer Origin**: sejed

---

## 📄 License & Legal

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for complete distribution constraints and warranty limitations.

---

<p align="center">
  Engineered with ❤️ by Sejed TRABELSSI
</p>
