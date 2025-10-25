# T3VO Tag System

## 🎯 Overview

T3VO uses a simple tag system (`#@tag=value`) that automatically organizes your notes. Write naturally, add tags for structure—no forms, no complexity.

## 🏷️ Quick Reference

### Common Tags (Work Everywhere)

- `#@title=` - Note title
- `#@tags=` - Comma-separated tags (e.g., `work,urgent`)
- `#@pin=true` - Pin to top
- `#@icon=` - Emoji icon (e.g., `🔑`)

### Password Tags

- `#@email=` or `#@username=` - Login identifier
- `#@password=` - Password
- `#@2fa=` or `#@totp=` - 2FA secret
- `#@domains=` - Related websites

### Bookmark Tags

- `#@bookmark=` or `#@url=` - Website URL

### Utility Tags

- `#@qrcode=` - Generate QR code from text

## Example

### Password Note
```
#@title=GitHub Account
#@email=dev@example.com
#@password=SecurePass123!
#@2fa=JBSWY3DPEHPK3PXP
#@tags=work,important
#@icon=💻
#@pin=true

Main dev account with 2FA enabled.
```

### Bookmark Note
```
#@title=Vue.js Docs
#@bookmark=https://vuejs.org/guide/
#@tags=reference,tutorial
#@icon=📚

Official Vue 3 documentation.
```

### Simple Note

```
#@title=Meeting Notes
#@tags=work,project-alpha
#@icon=📝

Q3 planning meeting:
- Launch new feature
- Review timeline
- Assign tasks
```

### QR Code Note

```
#@title=WiFi Access
#@qrcode=WIFI:T:WPA;S:MyNetwork;P:MyPassword123;;
#@tags=network,access
#@icon=📶

WiFi credentials for office network.
```

### Crypto Address Note

```
#@title=Wallet Addresses
#@tags=crypto,wallet
#@icon=₿

Bitcoin Legacy: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa
Ethereum: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
Bitcoin Bech32: bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kv8f3t4

Note: Crypto addresses are automatically detected and displayed with Blockchair links.
```

## ⚡ Quick Tips

- Tags are **case-insensitive**
- Tags can be placed **anywhere** in the note
- **Pinned notes** appear at the top automatically
- Use **icons** for quick visual identification
- Tags are **hidden** in the rendered view
- **Crypto addresses** (Bitcoin & Ethereum) are automatically detected
- **Media URLs** (YouTube, Instagram, Twitter, Reddit) are auto-linked

## 🔍 How It Works

**Note Types Auto-Detected:**

- **Password** - Has `#@password`, `#@email`, `#@username`, or `#@2fa`
- **Bookmark** - Has `#@bookmark` or `#@url`
- **Note** - Everything else (default)

## 🎨 Editor Features

- **Templates** - Quick-start buttons for passwords, bookmarks, and notes
- **Live Preview** - See how your note will look as you type
- **Validation** - Warnings for missing required tags

## 🔐 Security

- All notes are encrypted before storage
- Passwords are hidden in card view
- 2FA codes are generated live
- Tags are encrypted with content

## 🎯 Best Practices

1. Always use `#@title=` for clarity
2. Pin only important notes
3. Use consistent icons for similar note types
4. Add tags for quick filtering
5. Tag notes you'll search for later
6. Keep password domains updated
