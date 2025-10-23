/**
 * Note Parser - Extracts and parses #@ tags from note content
 * 
 * Supported tags:
 * - #@title=... - Title for any note type
 * - #@bookmark=... or #@url=... - Marks as bookmark
 * - #@email=... or #@username=... - Marks as password
 * - #@password=... - Password value
 * - #@2fa=... or #@totp=... - TOTP secret
 * - #@domains=... - Comma-separated domains for password
 */

const TAG_REGEX = /#@([a-zA-Z0-9]+)=([^\n]+)/g;

/**
 * URL patterns for detecting media references
 */
const URL_PATTERNS = {
  youtube: [
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/gi,
    /(?:https?:\/\/)?(?:www\.)?youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/gi,
  ],
  instagram: [
    /(?:https?:\/\/)?(?:www\.)?instagram\.com\/(?:p|reel)\/([a-zA-Z0-9_-]+)/gi,
  ],
  twitter: [
    /(?:https?:\/\/)?(?:www\.)?(?:twitter\.com|x\.com)\/([a-zA-Z0-9_]+)\/status\/([0-9]+)/gi,
  ],
  reddit: [
    /(?:https?:\/\/)?(?:www\.)?reddit\.com\/r\/([a-zA-Z0-9_]+)\/comments\/([a-zA-Z0-9]+)/gi,
  ],
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
      references: [],
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

  // Extract media references
  const references = extractReferences(content);

  return {
    raw: content,
    content: cleanContent,
    tags,
    type,
    title,
    references,
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
 * Get all available tag suggestions
 * @returns {Array} - Array of tag objects with name and description
 */
export function getTagSuggestions() {
  return [
    { tag: '#@title=', description: 'Title for the note', type: 'all' },
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
 * Extract media references from note content
 * @param {string} content - Raw note content
 * @returns {Array} - Array of reference objects
 */
function extractReferences(content) {
  const references = [];
  const seen = new Set(); // To avoid duplicates

  // YouTube
  URL_PATTERNS.youtube.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const videoId = match[1];
      const url = match[0].startsWith('http') ? match[0] : `https://youtube.com/watch?v=${videoId}`;
      const key = `youtube:${videoId}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        references.push({
          type: 'youtube',
          url,
          videoId,
          platform: 'YouTube',
        });
      }
    }
  });

  // Instagram
  URL_PATTERNS.instagram.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const postId = match[1];
      const url = match[0].startsWith('http') ? match[0] : `https://instagram.com/p/${postId}`;
      const key = `instagram:${postId}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        references.push({
          type: 'instagram',
          url,
          postId,
          platform: 'Instagram',
        });
      }
    }
  });

  // Twitter/X
  URL_PATTERNS.twitter.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const username = match[1];
      const tweetId = match[2];
      const url = match[0].startsWith('http') ? match[0] : `https://twitter.com/${username}/status/${tweetId}`;
      const key = `twitter:${tweetId}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        references.push({
          type: 'twitter',
          url,
          tweetId,
          username,
          platform: 'Twitter/X',
        });
      }
    }
  });

  // Reddit
  URL_PATTERNS.reddit.forEach((pattern) => {
    const matches = content.matchAll(pattern);
    for (const match of matches) {
      const subreddit = match[1];
      const postId = match[2];
      const url = match[0].startsWith('http') ? match[0] : `https://reddit.com/r/${subreddit}/comments/${postId}`;
      const key = `reddit:${postId}`;
      
      if (!seen.has(key)) {
        seen.add(key);
        references.push({
          type: 'reddit',
          url,
          postId,
          subreddit,
          platform: 'Reddit',
        });
      }
    }
  });

  return references;
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
