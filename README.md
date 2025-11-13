# ZeroNote: One Notes App for Everything

**Live Demo:** [Stable version](https://zeronote.js.org) | [Testing version (latest features)](https://zeronote.pages.dev)

ZeroNote is an open-source, offline-first unified app that replaces your password manager, bookmark manager, notes app, and 2FA authenticator with a single encrypted note-taking system powered by smart tags, where everything is stored locally on your device with zero-knowledge encryption and optional peer-to-peer or S3 sync.

**Stop juggling multiple apps.** One password manager. One bookmark manager. One notes app. One cloud service. One subscription. One privacy concern after another.

**ZeroNote simplifies your digital life** with a single, intelligent note system that becomes whatever you need—password vault, bookmark organizer, document storage, or personal knowledge base. Everything is just a note with smart tags.

## Why ZeroNote?

### Your Data, Your Control

In a world where companies control your passwords, notes, and bookmarks—**ZeroNote puts you back in charge.**

- **Offline-First**: Works completely without internet. Your data lives on your device, not someone's cloud.
- **P2P Sync**: Share between your devices directly using peer-to-peer—no servers, no middlemen.
- **S3 Backup**: Want cloud backup? Use your own S3 storage. Not theirs.
- **Zero-Knowledge Encryption**: Even if someone gets your backup, they can't read it without your master password.

**The only person who should hold your data is you.**

### One App, Infinite Possibilities

Stop switching between apps. Everything you need in one place:

- 🔐 **Password Manager** with 2FA/TOTP support
- 🔖 **Bookmark Manager** with rich previews
- 📝 **Note-Taking** with markdown
- 💳 **Crypto Wallet Tracker** with address detection
- 📎 **Document Storage** with attachments
- 🌐 **URL Manager** with media embeds

All powered by smart tags. Just type `#@password=`, `#@bookmark=`, or `#@cryptoaddress=` and ZeroNote does the rest.

<img width="2880" height="1688" alt="ZeroNote Interface" src="https://github.com/user-attachments/assets/9f0e6753-09ab-4afc-a1b5-655cb8d613a5" />

## ✨ Key Features

### Core Features

- **📝 Unified Notes**: Everything is just a note with smart tags
- **🔐 Client-Side Encryption**: All notes encrypted with your master password using AES
- **📱 Offline-First**: Works completely offline, all data stored locally in IndexedDB
- **🏷️ Smart Tags**: Use `#@password=`, `#@bookmark=`, etc. to auto-organize
- **🔍 Powerful Search**: Instant search across all notes, titles, and content
- **🔄 Secure P2P**: Direct device-to-device sync using WebRTC—no cloud needed

### Rich Content

- **📄 Markdown Support**: Full markdown rendering with syntax highlighting for code blocks
- **📎 File Attachments**: Attach images, PDFs, documents to any note with drag-and-drop
- **🔗 Media References**: Auto-extract and display YouTube, Instagram, Twitter, Reddit links
- **🎨 Beautiful Reading Mode**: Distraction-free reading view with edit button
- **✏️ Split-Screen Editor**: Real-time preview while editing with markdown syntax

### Security & Passwords

- **🔑 Password Manager**: Store credentials securely with structured fields
- **🔄 Real-time 2FA**: Generate TOTP codes from `#@totp=` tags with countdown timer
- **🌐 Domain Support**: Track associated domains for each password
- **👁️ Clean Display**: Monospace fonts for passwords and codes

### Organization

- **🎯 Type Detection**: Auto-detect note types (password, bookmark, note)
- **📊 Statistics**: View insights about your notes, tags, and vault
- **🔖 Bookmark Manager**: Save URLs with one-click "Open in new tab"
- **📁 Smart Filtering**: Filter notes by type and tags

### Data Management

- **💾 Backup & Restore**: Export/import encrypted JSON backups with attachments
- **🔄 Device Sync**: Peer-to-peer sync between devices using WebRTC (no cloud!)
- **☁️ S3/MinIO Sync**: Securely sync your notes to any S3-compatible storage (AWS S3, MinIO, etc.)
- **📥 Download Attachments**: Download any attached file with a click
- **🗑️ Soft Delete & Auto-Purge**: Notes can be recovered before permanent deletion. Deleted notes are automatically purged from your device after 7 days for privacy and storage efficiency.

## 🚀 Getting Started

### 1. Deploy Your Instance (Recommended)

**Fork this repository** and deploy to Vercel/Netlify for free. This gives you control over updates.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/besoeasy/ZeroNote/tree/latest)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/besoeasy/ZeroNote&branch=latest)

Or run with Docker:

```bash
docker run -d --name ZeroNote -p 8000:8000 ghcr.io/besoeasy/zeronote:main
```

### 2. Set Up Your Vault

1. **Create Master Password**: Choose a strong password on first launch
2. **Create Your First Note**: Click the + button
3. **Add Smart Tags**: Type `#@title=My First Note` to start

### 3. Start Organizing

Everything is a note. Just add tags to make it special:

**Store a password:**

```
#@title=Gmail
#@email=user@example.com
#@password=SecurePass123
#@totp=JBSWY3DPEHPK3PXP
```

**Save a bookmark:**

```
#@title=Great Article
#@bookmark=https://example.com

My notes about this article...
```

**Track crypto wallet:**

```
#@title=Bitcoin Wallet
#@cryptoaddress=1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa

Main BTC wallet for savings
```

👉 See [TAGS.md](src/supertags/README.md) for all available tags

## 🔐 How It Works

### Privacy by Design

1. **You create** a master password (never sent anywhere)
2. **Your device encrypts** all notes with AES encryption
3. **Everything stays local** in IndexedDB on your device
4. **Optional P2P sync** connects devices directly (WebRTC)
5. **Optional S3 backup** uses your own storage (not ours)

**Result:** Your data never touches our servers. We can't read it. We can't lose it. We can't sell it.

### Smart Tags System

Tags automatically transform your notes:

| Tag                | What It Does            | Example                          |
| ------------------ | ----------------------- | -------------------------------- |
| `#@title=`         | Sets note title         | `#@title=My Bank Account`        |
| `#@email=`         | Creates email field     | `#@email=user@example.com`       |
| `#@username=`      | Creates username field  | `#@username=john_doe`            |
| `#@password=`      | Password with show/hide | `#@password=SecurePass123`       |
| `#@totp=`          | 2FA code generator      | `#@totp=JBSWY3DPEHPK3PXP`        |
| `#@bookmark=`      | Saved link              | `#@bookmark=https://example.com` |
| `#@cryptoaddress=` | Crypto wallet lookup    | `#@cryptoaddress=1A1zP1e...`     |
| `#@apikey=`        | API key storage         | `#@apikey=sk_live_abc123`        |
| `#@secret=`        | Hidden text field       | `#@secret=TopSecretInfo`         |

[See all 19+ tags →](src/supertags/README.md)

### Sync Options

**Option 1: P2P Sync (No Server)**

- Create a room with code like "happydog123"
- Other devices join with same code
- Direct device-to-device sync via WebRTC
- Works across different WiFi networks

**Option 2: S3 Backup (Your Cloud)**

- Configure your S3 endpoint (AWS, MinIO, etc.)
- One-click upload/download
- Full encryption before upload
- You control the storage

**Option 3: Offline Only**

- Don't sync at all
- Use export/import for backups
- Maximum privacy

## 💡 Use Cases

**Replace 4+ Apps with One:**

- ✅ Password Manager (Bitwarden, 1Password)
- ✅ Bookmark Manager (Raindrop, Pocket)
- ✅ Note-Taking (Notion, Evernote)
- ✅ 2FA App (Authy, Google Authenticator)
- ✅ Crypto Wallet Tracker
- ✅ Document Storage

**Perfect For:**

- 🔐 Storing passwords with 2FA codes
- 🔖 Organizing bookmarks with notes
- 📝 Technical documentation with code blocks
- 🔑 API keys and secrets
- 📄 Personal knowledge base
- 🌐 URL collections with metadata

## 🙋 FAQ

**Q: Is my data safe?**  
A: Yes. Everything is encrypted on your device before storage. Your master password never leaves your device. Even if someone steals your device or backup, they can't decrypt it without your password.

**Q: What if I forget my master password?**  
A: There's no recovery. This is by design for zero-knowledge security. Your password is the encryption key—without it, data cannot be decrypted.

**Q: Can I use this on mobile?**  
A: Yes! It's a web app that works on any device with a browser. Install it as a PWA for app-like experience.

**Q: Do I need internet?**  
A: No. ZeroNote works 100% offline. Internet is only needed for optional P2P sync or S3 backup.

**Q: Where is my data stored?**  
A: In your browser's IndexedDB. It never leaves your device unless you explicitly sync via P2P or S3.

**Q: Is it really free?**  
A: Yes. Open source (MIT license). Deploy your own instance for free on Vercel/Netlify.

## 🤝 Contributing

We welcome contributions!

- 🐛 [Report bugs](https://github.com/besoeasy/ZeroNote/issues)
- 💡 [Suggest features](https://github.com/besoeasy/ZeroNote/issues)
- 🔧 Submit pull requests
- ⭐ Star the repo if you find it useful!

## 📊 Comparison with Other Apps

Below is a detailed comparison of **ZeroNote** with other popular note-taking and password management apps:

| Feature / App              | **ZeroNote** | Bitwarden | Joplin | Notion | Obsidian |
| -------------------------- | :----------: | :-------: | :----: | :----: | :------: |
| **Client-Side Encryption** |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Zero-Knowledge**         |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Offline-First**          |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Smart Tag System**       |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **Markdown Support**       |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **File Attachments**       |      ✅      |    ✅     |   ✅   |   ✅   |    ✅    |
| **Media Embeds**           |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **Password Manager**       |      ✅      |    ✅     |   ❌   |   ❌   |    ❌    |
| **2FA/TOTP Support**       |      ✅      |    ✅     |   ❌   |   ❌   |    ❌    |
| **Bookmark Manager**       |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **P2P Device Sync**        |      ✅      |    ❌     |   ❌   |   ❌   |    ❌    |
| **S3/MinIO Sync**          |      ✅      |    ❌     |   ❌   |   ❌   |    ❌    |
| **Cloud Sync**             |      ✅      |    ✅     |   ✅   |   ✅   |    ✅    |
| **Mobile Support**         |      ✅      |    ✅     |   ✅   |   ✅   |    ✅    |
| **Open Source**            |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **No Tracking/Analytics**  |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Free to Self-Host**      |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Rich Statistics**        |      ✅      |    ❌     |   ❌   |   ❌   |    ❌    |
| **Split-Screen Editor**    |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **Distraction-Free Mode**  |      ✅      |    ❌     |   ✅   |   ✅   |    ✅    |
| **Works Without Server**   |      ✅      |    ❌     |   ✅   |   ❌   |    ✅    |
| **Works on Web**           |      ✅      |    ✅     |   ✅   |   ✅   |    ❌    |
| **Self-Hosted**            |      ✅      |    ✅     |   ✅   |   ❌   |    ✅    |
| **Unlimited Usage**        |      ✅      |   ✅\*    |   ✅   |  ❌\*  |    ✅    |

> **Legend:**
>
> - ✅ = Supported / Available
> - ❌ = Not Supported / Not Available
> - ✅\* = Unlimited for self-hosted/community version
> - ❌\* = Usage limits on free plan

**ZeroNote** stands out for its unified approach (notes, passwords, bookmarks, and more in one place), strong privacy, offline-first design, and unique peer-to-peer sync with optional S3/MinIO cloud backup. For a full breakdown of tag-based features, see [TAGS.md](src/supertags/README.md).
