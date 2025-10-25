# T3VO Tag System

## 🎯 Overview

T3VO uses a simple tag system (`#@tag=value`) that automatically organizes your notes. Write naturally, add tags for structure—no forms, no complexity.

## 🏷️ Quick Reference

### Common Tags (Work Everywhere)

- `#@title=` - Note title
- `#@tags=` - Comma-separated tags (e.g., `work,urgent`)
- `#@pin=true` - Pin to top
- `#@icon=` - Emoji icon (e.g., `🔑`)
- `#@color=` - Card color (blue, red, green, yellow, purple, pink, gray, orange)

### Password Tags

- `#@email=` or `#@username=` - Login identifier
- `#@password=` - Password
- `#@2fa=` or `#@totp=` - 2FA secret
- `#@domains=` - Related websites

### Bookmark Tags

- `#@bookmark=` or `#@url=` - Website URL

## Example

### Password Note

```
#@title=GitHub Account
#@email=dev@example.com
#@password=SecurePass123!
#@2fa=JBSWY3DPEHPK3PXP
#@tags=work,important
#@color=blue
#@icon=💻
#@pin=true

Main dev account with 2FA enabled.
```

### Bookmark Note

```
#@title=Vue.js Docs
#@bookmark=https://vuejs.org/guide/
#@tags=reference,tutorial
#@color=green
#@icon=📚

Official Vue 3 documentation.
```

### Simple Note

```
#@title=Meeting Notes
#@tags=work,project-alpha
#@icon=�

Q3 planning meeting:
- Launch new feature
- Review timeline
- Assign tasks
```

## ⚡ Quick Tips

- Tags are **case-insensitive**
- Tags can be placed **anywhere** in the note
- **Pinned notes** appear at the top automatically
- Use **icons** for quick visual identification
- **Color coding** helps organize similar notes
- Tags are **hidden** in the rendered view

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
3. Use consistent color coding (e.g., red = urgent)
4. Add icons for quick scanning
5. Tag notes you'll search for later
6. Keep password domains updated
