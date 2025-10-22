# T3VO - Unified Note Vault

T3VO is a secure, offline-first note-taking app with smart tag-based organization. Everything is a note—use simple tags to automatically organize passwords, bookmarks, and regular notes.

## 🎯 Key Features

- **📝 Unified Notes**: Everything is just a note with smart tags
- **🔐 Secure**: Client-side encryption with your master password
- **📱 Offline-First**: Works completely offline, no server needed
- **🏷️ Smart Tags**: Use `#@password=`, `#@bookmark=`, etc. to auto-organize
- **🔍 Powerful Search**: Search across all your notes instantly
- **🎨 Beautiful UI**: Clean, modern interface with live preview
- **🔄 Real-time 2FA**: Generate TOTP codes from `#@2fa=` tags
- **📦 Import/Export**: Backup and restore your vault anytime

## 🚀 Quick Start

### Tag System Examples

**Password Note:**
```
#@title=Gmail Account
#@email=user@gmail.com
#@password=SecurePassword123
#@2fa=JBSWY3DPEHPK3PXP

My main email account
```

**Bookmark Note:**
```
#@title=YouTube
#@bookmark=https://www.youtube.com/

Great video platform
```

**Regular Note:**
```
#@title=Meeting Notes

Discussed project timeline...
```

👉 See [TAGS.md](./TAGS.md) for complete tag documentation

## Deployment

### Easy

1. Fork this repository.
2. Enable GitHub Pages on your fork.

### Super Easy

Use these free services to deploy the app with a single click:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/besoeasy/t3vo/tree/latest)

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/besoeasy/t3vo&branch=latest)

## Contribute

Feel free to fork the repository and submit your edits and improvements.
