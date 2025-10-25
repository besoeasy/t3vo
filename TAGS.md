# T3VO Tag System Guide

## 🎯 Overview

T3VO now uses a **unified note system** with smart tags. Everything is a note, and tags (`#@tag=value`) automatically determine how your note is displayed and organized.

## 📝 Basic Concept

Write naturally, add tags for structure. No forms, no mode switching—just pure note-taking with smart organization.

## 🏷️ Available Tags

### Universal Tags
- `#@title=Your Title` - Sets the title for any note type
- `#@category=Work` - Organize notes into categories/folders
- `#@tags=urgent,review-later,personal` - Add comma-separated tags for filtering
- `#@pin=true` - Pin note to the top of your list
- `#@icon=🔑` - Add a custom emoji icon to your note card
- `#@color=blue` - Set card color theme (blue, red, green, yellow, purple, pink, gray, indigo, teal, orange)

### Password Tags
Use these tags to store login credentials:

```
#@title=Gmail Account
#@email=user@gmail.com
#@password=SecurePassword123
#@2fa=JBSWY3DPEHPK3PXP
#@domains=gmail.com,google.com

Notes about this account...
```

**Available password tags:**
- `#@email=` - Email address for login
- `#@username=` - Username (alternative to email)
- `#@password=` - The password
- `#@2fa=` or `#@totp=` - TOTP secret for 2FA
- `#@domains=` - Comma-separated list of domains

### Bookmark Tags
Use these tags to save websites:

```
#@title=YouTube
#@bookmark=https://www.youtube.com/

Great video platform for tutorials and entertainment
```

**Available bookmark tags:**
- `#@bookmark=` or `#@url=` - The website URL
- `#@title=` - Title of the bookmark

### Regular Notes
No special tags needed! Just write:

```
#@title=Meeting Notes

Discussed project timeline and deliverables.
Next meeting on Friday at 2 PM.
```

## 🔍 How Detection Works

T3VO automatically detects note type based on tags:

1. **Password**: Has `#@password`, `#@email`, `#@username`, `#@2fa`, or `#@totp`
2. **Bookmark**: Has `#@bookmark` or `#@url`
3. **Note**: Everything else (default)

## 💡 Examples

### Example 1: Password with 2FA

```
#@title=GitHub Account
#@email=developer@example.com
#@password=SuperSecret2024!
#@2fa=ORODSHBYMZ2NT5RBRRJKDLSGWNP65BXD
#@domains=github.com,*.github.com
#@category=Development
#@tags=work,important
#@color=blue
#@icon=💻
#@pin=true

Main development account. Enable 2FA with authenticator app.
```

**Displays as:** Pinned password card with blue theme, computer icon, category badge, custom tags, email, hidden password, live 2FA code, and notes

### Example 2: Bookmark

```
#@title=Vue.js Documentation
#@bookmark=https://vuejs.org/guide/introduction.html
#@category=Development
#@tags=reference,tutorial
#@color=green
#@icon=📚

Official Vue 3 docs - great for learning composition API
```

**Displays as:** Green bookmark card with book icon, category, tags, clickable URL and description

### Example 3: Simple Note

```
#@title=Grocery List
#@category=Personal
#@tags=shopping,urgent
#@color=yellow
#@icon=🛒

- Milk
- Eggs
- Bread
- Coffee
```

**Displays as:** Yellow note card with shopping cart icon, category, and custom tags

### Example 4: Mixed Content Note

```
#@title=Project Resources
#@category=Work
#@tags=project-alpha,resources
#@color=purple
#@pin=true

GitHub Repo: https://github.com/user/repo
API Key: abc123xyz (stored separately)

Remember to update dependencies weekly.
```

**Displays as:** Pinned purple regular note with category and tags (no special type tags detected)

## ⚡ Quick Tips

1. **Tags are case-insensitive**: `#@EMAIL=` works the same as `#@email=`
2. **Tags can be anywhere**: Place them at top, bottom, or mixed with content
3. **One value per tag**: Don't repeat the same tag multiple times
4. **Clean formatting**: Tags are hidden in the rendered view
5. **Use templates**: Click template buttons in editor for quick start
6. **Pin important notes**: Use `#@pin=true` to keep notes at the top
7. **Color code your notes**: Use `#@color=` for visual organization
8. **Add custom icons**: Use any emoji with `#@icon=` for personality
9. **Organize with categories**: Group related notes with `#@category=`
10. **Tag for filtering**: Use `#@tags=` to create your own organization system

## 🎨 Editor Features

### Templates
Click these buttons to insert pre-formatted templates:
- **Password Template** - Pre-filled password structure
- **Bookmark Template** - Pre-filled bookmark structure

### Live Preview
The right panel shows how your note will look as you type.

### Validation
Yellow warnings appear if:
- Password without email/username
- 2FA without password
- Duplicate tags
- Empty bookmark URL

### Keyboard Shortcuts
- `Tab` - Insert two spaces for indentation
- `Cmd/Ctrl + N` - New note
- `Cmd/Ctrl + K` - Focus search
- `Esc` - Close editor

## 🔐 Security Notes

- All content is encrypted before storage
- Tags are part of encrypted content
- 2FA secrets are stored encrypted
- Passwords are never visible in card view (click to edit)

## 📊 Filtering & Search

### Filter by Type
Use the filter buttons to show only:
- **All** - Everything
- **Passwords** - Only password notes
- **Bookmarks** - Only bookmark notes
- **Notes** - Only regular notes

### Search
Search looks through all content including:
- Tag values
- Note content
- Titles

## 🚀 Migration from Old System

If you're upgrading from the previous version:
1. Your data will be automatically detected
2. A migration dialog will appear on first load
3. All passwords, bookmarks, and notes will be converted
4. Original data structure will be preserved
5. Migration is one-way (no going back)

## 🆘 Troubleshooting

**Q: My password note shows as a regular note**  
A: Make sure you have at least one password-related tag (`#@password`, `#@email`, `#@username`)

**Q: 2FA code not showing**  
A: Verify your `#@2fa` secret is a valid Base32 string (letters A-Z and numbers 2-7)

**Q: Bookmark URL not clickable**  
A: Ensure you have `#@bookmark=` or `#@url=` tag with a valid URL

**Q: Tags visible in card**  
A: This shouldn't happen - tags are automatically hidden. Try refreshing.

## 🎯 Best Practices

1. **Be Consistent**: Use the same tag format throughout
2. **Add Titles**: Always use `#@title=` for better organization
3. **Add Context**: Write notes below tags for additional info
4. **Use Domains**: For passwords, list all related domains
5. **Update Regularly**: Keep notes current, especially passwords
6. **Color Code Wisely**: Use consistent colors for similar types (e.g., red for urgent)
7. **Pin Sparingly**: Only pin truly important notes to avoid clutter
8. **Tag Strategically**: Use tags for things you'll search for later
9. **Categorize Logically**: Create a category system that works for you
10. **Use Icons**: Add visual cues with emojis for quick scanning

## 📱 Coming Soon

- Markdown support in notes
- Custom tags
- Tag autocomplete
- Import/export with tag preservation
- Mobile app with same tag system

---

**Need help?** Open an issue on [GitHub](https://github.com/besoeasy/t3vo)
