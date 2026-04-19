# 🛡️ Vanguard | Advanced Moderation Bot

<div align="center">  
  [![Discord Support](https://img.shields.io/badge/Discord-Support-5865F2?style=for-the-badge&logo=discord&logoColor=white)](https://discord.gg/3TJEacm6RD)
  [![Version](https://img.shields.io/badge/Version-1.0.0-blue?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot)
  [![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](https://github.com/SEJED-DEV/Vanguard-discord-bot/blob/main/LICENSE)
</div>

---

## 💎 Overview

**Vanguard** is a premium, high-performance moderation bot designed to protect your Discord community with surgical precision. Engineered for stability and highly customizable, Vanguard provides server administrators with the tools they need to maintain order while ensuring a seamless user experience.

> "Protecting your community, one command at a time."

---

## 🔥 Key Features

### 🎨 Per-Guild Custom Branding
 admins can configure their own custom emojis for all bot responses. Use `/config emojis` to set unique icons for success, error, ban, and more.

### ⚡ Industrial-Grade Performance
Built with an optimized In-memory configuration cache (LRU-based) and `better-sqlite3`, Vanguard reduces database latency to near-zero, even in high-traffic environments.

### 🛡️ Atomic Case Management
Every moderation action is recorded in a transaction-safe SQLite database. Case numbers are assigned atomically to prevent race conditions and ensure a perfect audit trail.

### 🔐 Multi-Layer Privacy
Internal monitoring logs (for developers) are strictly isolated from guild-local logs. **Error Logs** are transmitted to the support server for rapid diagnostics, while moderation history remains private.

### 🚀 Smart Interaction Handling
Vanguard uses an advanced interaction recovery system that handles expired tokens and provides fallback responses to prevent "ghosting" when commands fail.

### 🛡️ Fail-Safe Resilience
Complete with strict environment parameter validation, native API outage `try/catch` fallbacks, and exact Discord hierarchy synchronization, Vanguard prevents erratic ghost-punishments and zombie processes entirely.

---

## 🛠️ Configuration

Vanguard is fully configurable via environment variables and in-command settings.

### Environment Variables
| Variable | Required | Description |
|----------|----------|-------------|
| `TOKEN` | Yes | Your Discord Bot Token |
| `CLIENT_ID` | Yes | The Application ID of your bot |
| `OWNER_ID` | Yes | The Discord ID of the bot developer |
| `SUPPORT_SERVER_ID`| No | The ID of your support server for global logs |

### In-Bot Settings
Use the `/config` command suite to manage your server:
- `/config logs <channel>`: Set where moderation logs should be sent locally.
- `/config emojis <key> <emoji>`: Replace default icons with your own custom Discord emojis.

---

## 📡 Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/SEJED-DEV/Vanguard-discord-bot.git
   cd Vanguard-discord-bot
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure the environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

4. **Start the bot**:
   ```bash
   # Development
   node src/index.js
   
   # Production (Recommended)
   pm2 start src/index.js --name "vanguard-bot"
   ```

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

- **Support Server**: [Join our Community](https://discord.gg/3TJEacm6RD)
- **Developer**: sejed

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Made with ❤️ by Sejed TRABELSSI
</p>
