<img width="2002" height="1515" alt="Screenshot_20251023_210835" src="https://github.com/user-attachments/assets/1a245b36-f30d-4d6d-95d1-2ead228bd853" />
<img width="6400" height="2160" alt="Screenshot_20251023_210858" src="https://github.com/user-attachments/assets/92adff40-f565-4b89-9fe9-eb4f59cf7cdd" />
<img width="2002" height="1515" alt="Screenshot_20251023_210841" src="https://github.com/user-attachments/assets/df965073-c629-4b9f-ae1c-93d2ebd60e2e" />


# T3VO - Unified Note Vault

T3VO is a secure, offline-first note-taking app with smart tag-based organization and rich features. Everything is a note—use simple tags to automatically organize passwords, bookmarks, and regular notes with markdown support, file attachments, and media references.

## ✨ Key Features

### Core Features

- **📝 Unified Notes**: Everything is just a note with smart tags
- **🔐 Client-Side Encryption**: All notes encrypted with your master password using AES
- **📱 Offline-First**: Works completely offline, all data stored locally in IndexedDB
- **🏷️ Smart Tags**: Use `#@password=`, `#@bookmark=`, etc. to auto-organize
- **🔍 Powerful Search**: Instant search across all notes, titles, and content

### Rich Content

- **📄 Markdown Support**: Full markdown rendering with syntax highlighting for code blocks
- **📎 File Attachments**: Attach images, PDFs, documents to any note with drag-and-drop
- **🔗 Media References**: Auto-extract and display YouTube, Instagram, Twitter, Reddit links
- **🎨 Beautiful Reading Mode**: Distraction-free reading view with edit button
- **✏️ Split-Screen Editor**: Real-time preview while editing with markdown syntax

### Security & Passwords

- **🔑 Password Manager**: Store credentials securely with structured fields
- **🔄 Real-time 2FA**: Generate TOTP codes from `#@2fa=` tags with countdown timer
- **🌐 Domain Support**: Track associated domains for each password
- **�️ Clean Display**: Monospace fonts for passwords and codes

### Organization

- **🎯 Type Detection**: Auto-detect note types (password, bookmark, note)
- **📊 Statistics**: View insights about your notes, tags, and vault
- **🔖 Bookmark Manager**: Save URLs with one-click "Open in new tab"
- **📁 Smart Filtering**: Filter notes by type and tags

### Data Management

- **💾 Backup & Restore**: Export/import encrypted JSON backups with attachments
- **🔄 Device Sync**: Peer-to-peer sync between devices using WebRTC (no cloud!)
- **📥 Download Attachments**: Download any attached file with a click
- **🗑️ Soft Delete**: Notes can be recovered before permanent deletion

## 🚀 Quick Start

1. **Set Master Password**: On first launch, create a secure master password
2. **Create Notes**: Click the + button to create your first note
3. **Use Tags**: Add `#@title=`, `#@password=`, etc. to structure your notes
4. **Attach Files**: Drag and drop files or click the attachment button
5. **Add References**: Paste YouTube, Twitter, Instagram, or Reddit URLs
6. **Write in Markdown**: Use markdown syntax for rich formatting

### Tag System Examples

**Password Note with 2FA:**

```
#@title=Gmail Account
#@email=user@gmail.com
#@password=SecurePassword123
#@2fa=JBSWY3DPEHPK3PXP
#@domains=gmail.com, mail.google.com

## Notes
My main email account with 2FA enabled

## Recovery
- Recovery email: backup@email.com
- Recovery phone: +1-555-0123
```

**Bookmark with References:**

```
#@title=Awesome Tutorial
#@bookmark=https://example.com/tutorial

Great tutorial I found on YouTube
https://www.youtube.com/watch?v=dQw4w9WgXcQ

Also discussed on Reddit:
https://www.reddit.com/r/programming/comments/abc123
```

**Note with Markdown & Code:**

```
#@title=API Documentation

## Endpoint
`POST /api/users`

### Example Code
\`\`\`javascript
fetch('/api/users', {
  method: 'POST',
  body: JSON.stringify({ name: 'John' })
})
\`\`\`
```

**Regular Note with Attachments:**

```
#@title=Project Proposal

Attach presentation.pdf, mockups.png for reference.

## Overview
- Budget: $10,000
- Timeline: 3 months
- Team: 5 people
```

👉 See [TAGS.md](./TAGS.md) for complete tag documentation

## 🛠️ Technology Stack

- **Vue 3**: Composition API for reactive UI
- **Vite**: Lightning-fast build tool
- **IndexedDB**: Client-side database via Dexie.js
- **CryptoJS**: AES encryption for security
- **Marked**: Markdown parsing and rendering
- **PeerJS**: WebRTC for peer-to-peer sync
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Beautiful icon set

## 📱 Features in Detail

### Markdown Support

Write notes using full markdown syntax:

- Headers, lists, links, images
- Code blocks with syntax highlighting
- Tables, blockquotes, horizontal rules
- Inline code and formatting

### File Attachments

- Drag and drop files directly into notes
- Support for images, PDFs, documents, any file type
- Preview thumbnails for images
- Download attachments anytime
- Stored encrypted in your local database

### Media References

Automatically extract and display links from:

- **YouTube**: Video links with YouTube icon
- **Instagram**: Post links with Instagram icon
- **Twitter/X**: Tweet links with Twitter icon
- **Reddit**: Post/comment links with Reddit icon

### Device Sync

- Peer-to-peer sync using WebRTC (no cloud server!)
- Generate QR code for easy pairing
- Automatic conflict resolution
- Encrypted data transfer
- Works across different networks

### Backup & Restore

- Export all notes as encrypted JSON
- Includes all attachments (converted to base64)
- Import backups without losing existing notes
- Duplicate detection during restore

## 🔒 Security & Privacy

- **Zero-Knowledge**: Your master password never leaves your device
- **Client-Side Encryption**: All notes encrypted using AES before storage
- **No Cloud**: Everything stored locally in your browser
- **No Tracking**: No analytics, no telemetry, no data collection
- **Offline-First**: Works completely without internet
- **P2P Sync**: Direct device-to-device sync, no intermediary servers

## 🚀 Deployment

### Easy

1. Fork this repository
2. Deploy on Vercel or Netlify

### Super Easy

Use these free services to deploy the app with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/besoeasy/t3vo/tree/latest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/besoeasy/t3vo&branch=latest)

## 🤝 Contribute

Contributions are welcome! Feel free to:

- 🐛 Report bugs
- 💡 Suggest new features
- 🔧 Submit pull requests
- 📖 Improve documentation

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## ⭐ Show Your Support

If you find T3VO useful, please consider giving it a star on GitHub!
