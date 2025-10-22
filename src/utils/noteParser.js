/**
 * Note Parser - Extracts and parses #@ tags from note content
 * 
 * Supported tags:
 * - #@title=... - Title for any note type
 * - #@color=... - Color for the note card (yellow, coral, purple, cyan, lime, etc.)
 * - #@bookmark=... or #@url=... - Marks as bookmark
 * - #@email=... or #@username=... - Marks as password
 * - #@password=... - Password value
 * - #@2fa=... or #@totp=... - TOTP secret
 * - #@domains=... - Comma-separated domains for password
 */

const TAG_REGEX = /#@([a-zA-Z0-9]+)=([^\n]+)/g;

// Available colors for notes
export const NOTE_COLORS = {
  yellow: { bg: '#F5C26B', name: 'Yellow' },
  coral: { bg: '#F08A7A', name: 'Coral' },
  purple: { bg: '#9B7EDE', name: 'Purple' },
  cyan: { bg: '#4DD4E8', name: 'Cyan' },
  lime: { bg: '#D4E157', name: 'Lime' },
  pink: { bg: '#F49A89', name: 'Pink' },
  blue: { bg: '#7EB6FF', name: 'Blue' },
  green: { bg: '#81C784', name: 'Green' },
};

/**
 * Parse a note and extract all #@ tags
 * @param {string} content - Raw note content
 * @returns {Object} Parsed note with tags and cleaned content
 */
export function parseNote(content) {
  if (!content) {
    return {
      raw: '',
      content: '',
      tags: {},
      type: 'note',
      title: '',
    };
  }

  const tags = {};
  const matches = content.matchAll(TAG_REGEX);

  // Extract all tags
  for (const match of matches) {
    const [, key, value] = match;
    tags[key.toLowerCase()] = value.trim();
  }

  // Remove tags from content to get clean text
  const cleanContent = content.replace(TAG_REGEX, '').trim();

  // Determine note type based on tags
  const type = detectNoteType(tags);

  // Get title (either from tag or first line)
  const title = getTitle(tags, cleanContent);

  return {
    raw: content,
    content: cleanContent,
    tags,
    type,
    title,
    color: tags.color || 'yellow', // Default color
  };
}

/**
 * Detect note type based on available tags
 * @param {Object} tags - Extracted tags
 * @returns {string} - 'password', 'bookmark', or 'note'
 */
function detectNoteType(tags) {
  // Check for password indicators
  const hasPasswordTags = 
    tags.password || 
    tags.email || 
    tags.username || 
    tags['2fa'] || 
    tags.totp;
  
  if (hasPasswordTags) {
    return 'password';
  }

  // Check for bookmark indicators
  const hasBookmarkTags = 
    tags.bookmark || 
    tags.url;
  
  if (hasBookmarkTags) {
    return 'bookmark';
  }

  // Default to note
  return 'note';
}

/**
 * Extract title from tags or content
 * @param {Object} tags - Extracted tags
 * @param {string} content - Clean content
 * @returns {string} - Title
 */
function getTitle(tags, content) {
  // First check for explicit title tag
  if (tags.title) {
    return tags.title;
  }

  // For bookmarks, use URL if no title
  if (tags.bookmark || tags.url) {
    return tags.bookmark || tags.url;
  }

  // For passwords, try to construct a meaningful title
  if (tags.email || tags.username) {
    const identifier = tags.email || tags.username;
    const domain = tags.domains?.split(',')[0] || '';
    return domain ? `${domain}` : identifier;
  }

  // Fallback to first line of content
  const firstLine = content.split('\n')[0]?.trim();
  return firstLine || 'Untitled Note';
}

/**
 * Get password-specific data from parsed note
 * @param {Object} parsedNote - Result from parseNote()
 * @returns {Object} - Password data structure
 */
export function getPasswordData(parsedNote) {
  const { tags, content } = parsedNote;
  
  return {
    title: parsedNote.title,
    username: tags.username || '',
    email: tags.email || '',
    password: tags.password || '',
    totpSecret: tags['2fa'] || tags.totp || '',
    urls: tags.domains || tags.domain || '',
    note: content,
  };
}

/**
 * Get bookmark-specific data from parsed note
 * @param {Object} parsedNote - Result from parseNote()
 * @returns {Object} - Bookmark data structure
 */
export function getBookmarkData(parsedNote) {
  const { tags, content } = parsedNote;
  
  return {
    title: parsedNote.title,
    url: tags.bookmark || tags.url || '',
    note: content,
  };
}

/**
 * Get note-specific data from parsed note
 * @param {Object} parsedNote - Result from parseNote()
 * @returns {Object} - Note data structure
 */
export function getNoteData(parsedNote) {
  return {
    title: parsedNote.title,
    content: parsedNote.content,
  };
}

/**
 * Convert structured data back to tagged note format
 * @param {string} type - 'password', 'bookmark', or 'note'
 * @param {Object} data - Structured data
 * @returns {string} - Formatted note with tags
 */
export function structuredToNote(type, data) {
  const lines = [];

  if (type === 'password') {
    // Add title tag if different from derived title
    if (data.title) {
      lines.push(`#@title=${data.title}`);
    }
    
    if (data.email) {
      lines.push(`#@email=${data.email}`);
    }
    
    if (data.username) {
      lines.push(`#@username=${data.username}`);
    }
    
    if (data.password) {
      lines.push(`#@password=${data.password}`);
    }
    
    if (data.totpSecret) {
      lines.push(`#@2fa=${data.totpSecret}`);
    }
    
    if (data.urls) {
      lines.push(`#@domains=${data.urls}`);
    }
    
    // Add note content
    if (data.note) {
      lines.push('');
      lines.push(data.note);
    }
  } else if (type === 'bookmark') {
    if (data.title) {
      lines.push(`#@title=${data.title}`);
    }
    
    if (data.url) {
      lines.push(`#@bookmark=${data.url}`);
    }
    
    // Add note content
    if (data.note) {
      lines.push('');
      lines.push(data.note);
    }
  } else {
    // Regular note
    if (data.title) {
      lines.push(`#@title=${data.title}`);
    }
    
    if (data.content) {
      lines.push('');
      lines.push(data.content);
    }
  }

  return lines.join('\n');
}

/**
 * Highlight tags in content for display
 * @param {string} content - Raw note content
 * @returns {string} - HTML with highlighted tags
 */
export function highlightTags(content) {
  if (!content) return '';
  
  return content.replace(
    TAG_REGEX,
    '<span class="tag-highlight">#@$1=<span class="tag-value">$2</span></span>'
  );
}

/**
 * Get all available tag suggestions
 * @returns {Array} - Array of tag objects with name and description
 */
export function getTagSuggestions() {
  return [
    { tag: '#@title=', description: 'Title for the note', type: 'all' },
    { tag: '#@color=', description: 'Color (yellow, coral, purple, cyan, lime, pink, blue, green)', type: 'all' },
    { tag: '#@bookmark=', description: 'URL for bookmark', type: 'bookmark' },
    { tag: '#@url=', description: 'Alternative to bookmark', type: 'bookmark' },
    { tag: '#@email=', description: 'Email for login', type: 'password' },
    { tag: '#@username=', description: 'Username for login', type: 'password' },
    { tag: '#@password=', description: 'Password value', type: 'password' },
    { tag: '#@2fa=', description: 'TOTP secret for 2FA', type: 'password' },
    { tag: '#@totp=', description: 'Alternative to 2fa', type: 'password' },
    { tag: '#@domains=', description: 'Comma-separated domains', type: 'password' },
  ];
}

/**
 * Validate note content and return warnings
 * @param {string} content - Raw note content
 * @returns {Array} - Array of warning messages
 */
export function validateNote(content) {
  const warnings = [];
  const parsed = parseNote(content);

  // Check for password without email/username
  if (parsed.tags.password && !parsed.tags.email && !parsed.tags.username) {
    warnings.push('Password found but no email or username specified');
  }

  // Check for 2FA without password
  if ((parsed.tags['2fa'] || parsed.tags.totp) && !parsed.tags.password) {
    warnings.push('2FA secret found but no password specified');
  }

  // Check for empty bookmark URL
  if (parsed.type === 'bookmark' && !parsed.tags.bookmark && !parsed.tags.url) {
    warnings.push('Bookmark detected but no URL specified');
  }

  // Check for duplicate tags
  const tagCounts = {};
  const matches = content.matchAll(TAG_REGEX);
  for (const match of matches) {
    const key = match[1].toLowerCase();
    tagCounts[key] = (tagCounts[key] || 0) + 1;
  }
  
  for (const [tag, count] of Object.entries(tagCounts)) {
    if (count > 1) {
      warnings.push(`Duplicate tag found: #@${tag} (appears ${count} times)`);
    }
  }

  return warnings;
}
