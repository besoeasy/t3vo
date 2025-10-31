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
 * - #@crypto=... - Cryptocurrency tracking (e.g., bitcoin,ethereum)
 * - #@qrcode=... - Generates QR code from text
 * - #@pin=true|false - Pin note to top
 * - #@icon=... - Custom emoji icon for card
 * - #@tags=... - Comma-separated tags
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
 * Cryptocurrency address patterns
 */
const CRYPTO_ADDRESS_PATTERNS = {
  // Bitcoin Legacy (P2PKH) - starts with 1
  bitcoinLegacy: /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
  // Bitcoin SegWit (P2SH) - starts with 3
  bitcoinSegWit: /\b(3[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
  // Bitcoin Bech32 (Native SegWit) - starts with bc1
  bitcoinBech32: /\b(bc1[a-z0-9]{39,59})\b/gi,
  // Bitcoin Taproot - starts with bc1p
  bitcoinTaproot: /\b(bc1p[a-z0-9]{58})\b/gi,
  // Ethereum - 0x followed by 40 hex characters
  ethereum: /\b(0x[a-fA-F0-9]{40})\b/g,
  // Solana - base58, 32-44 chars, usually 44
  solana: /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g,
  // Litecoin Legacy (starts with L), SegWit (starts with M), Bech32 (ltc1)
  litecoinLegacy: /\b(L[a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
  litecoinSegWit: /\b(M[a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
  litecoinBech32: /\b(ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59})\b/gi,
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
      cryptoAddresses: [],
    };
  }

  const tags = {};
  const matches = content.matchAll(TAG_REGEX);

  // Extract all tags
  for (const match of matches) {
    const [, key, value] = match;
    if (key.toLowerCase() === 'card') {
      // Parse card as number-expiry-cvv
      const cardParts = value.trim().split('-');
      tags.card = {
        cardNumber: cardParts[0] || '',
        expiry: cardParts[1] || '',
        cvv: cardParts[2] || ''
      };
    } else {
      tags[key.toLowerCase()] = value.trim();
    }
  }

  // Remove tags from content to get clean text
  const cleanContent = content.replace(TAG_REGEX, '').trim();

  // Determine note type based on tags
  const type = detectNoteType(tags);

  // Get title (either from tag or first line)
  const title = getTitle(tags, cleanContent);

  // Extract media references
  const references = extractReferences(content);

  // Extract crypto addresses
  const cryptoAddresses = extractCryptoAddresses(content);

  // Parse special organizational tags
  const pinned = tags.pin === 'true' || tags.pin === '1';
  const icon = tags.icon || null;
  const customTags = tags.tags ? tags.tags.split(',').map(t => t.trim()).filter(Boolean) : [];

  return {
    raw: content,
    content: cleanContent,
    tags,
    type,
    title,
    references,
    cryptoAddresses,
    pinned,
    icon,
    customTags,
  };
}

/**
 * Detect note type based on available tags
 * @param {Object} tags - Extracted tags
 * @returns {string} - 'password', 'bookmark', 'crypto', or 'note'
 */
function detectNoteType(tags) {
  // Check for crypto indicators
  if (tags.crypto) {
    return 'crypto';
  }

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
    { tag: '#@tags=', description: 'Comma-separated tags', type: 'all' },
    { tag: '#@pin=true', description: 'Pin note to top', type: 'all' },
    { tag: '#@icon=', description: 'Custom emoji icon', type: 'all' },
    { tag: '#@bookmark=', description: 'URL for bookmark', type: 'bookmark' },
    { tag: '#@url=', description: 'Alternative to bookmark', type: 'bookmark' },
    { tag: '#@email=', description: 'Email for login', type: 'password' },
    { tag: '#@username=', description: 'Username for login', type: 'password' },
    { tag: '#@password=', description: 'Password value', type: 'password' },
    { tag: '#@2fa=', description: 'TOTP secret for 2FA', type: 'password' },
    { tag: '#@totp=', description: 'Alternative to 2fa', type: 'password' },
    { tag: '#@domains=', description: 'Comma-separated domains', type: 'password' },
    { tag: '#@crypto=', description: 'Cryptocurrency symbols (e.g., bitcoin,ethereum)', type: 'crypto' },
  ];
}

/**
 * Extract media references from note content
 * @param {string} content - Raw note content
 * @returns {Array} - Array of reference objects
 */
function extractReferences(content) {
  // Simple URL regex (matches http/https URLs)
  const urlRegex = /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)/gi;
  const matches = content.match(urlRegex) || [];
  // Remove duplicates
  const unique = Array.from(new Set(matches));
  // Return as array of objects for compatibility
  return unique.map(url => ({ url }));
}

/**
 * Extract cryptocurrency addresses from note content
 * @param {string} content - Raw note content
 * @returns {Array} - Array of crypto address objects
 */
function extractCryptoAddresses(content) {
  // Litecoin Legacy (L...)
  const ltcLegacyMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.litecoinLegacy);
  for (const match of ltcLegacyMatches) {
    const address = match[1];
    if (!seen.has(address)) {
      seen.add(address);
      addresses.push({
        type: 'litecoin',
        subtype: 'Legacy (L...)',
        address,
        currency: 'Litecoin',
        icon: 'Ł',
      });
    }
  }

  // Litecoin SegWit (M...)
  const ltcSegWitMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.litecoinSegWit);
  for (const match of ltcSegWitMatches) {
    const address = match[1];
    if (!seen.has(address)) {
      seen.add(address);
      addresses.push({
        type: 'litecoin',
        subtype: 'SegWit (M...)',
        address,
        currency: 'Litecoin',
        icon: 'Ł',
      });
    }
  }

  // Litecoin Bech32 (ltc1...)
  const ltcBech32Matches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.litecoinBech32);
  for (const match of ltcBech32Matches) {
    const address = match[1];
    if (!seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase());
      addresses.push({
        type: 'litecoin',
        subtype: 'Bech32 (ltc1...)',
        address,
        currency: 'Litecoin',
        icon: 'Ł',
      });
    }
  }

  // Solana (base58, 32-44 chars, usually 44)
  const solanaMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.solana);
  for (const match of solanaMatches) {
    const address = match[1];
    // Solana addresses are base58, but to avoid false positives, require 32-44 chars
    if (!seen.has(address) && address.length >= 32 && address.length <= 44) {
      seen.add(address);
      addresses.push({
        type: 'solana',
        subtype: 'Base58',
        address,
        currency: 'Solana',
        icon: '◎',
      });
    }
  }
  const addresses = [];
  const seen = new Set(); // To avoid duplicates

  // Bitcoin Legacy (P2PKH)
  const legacyMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.bitcoinLegacy);
  for (const match of legacyMatches) {
    const address = match[1];
    if (!seen.has(address)) {
      seen.add(address);
      addresses.push({
        type: 'bitcoin',
        subtype: 'Legacy (P2PKH)',
        address,
        currency: 'Bitcoin',
        icon: '₿',
      });
    }
  }

  // Bitcoin SegWit (P2SH)
  const segwitMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.bitcoinSegWit);
  for (const match of segwitMatches) {
    const address = match[1];
    if (!seen.has(address)) {
      seen.add(address);
      addresses.push({
        type: 'bitcoin',
        subtype: 'SegWit (P2SH)',
        address,
        currency: 'Bitcoin',
        icon: '₿',
      });
    }
  }

  // Bitcoin Bech32 (Native SegWit)
  const bech32Matches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.bitcoinBech32);
  for (const match of bech32Matches) {
    const address = match[1];
    if (!seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase());
      addresses.push({
        type: 'bitcoin',
        subtype: 'Bech32 (Native SegWit)',
        address,
        currency: 'Bitcoin',
        icon: '₿',
      });
    }
  }

  // Bitcoin Taproot
  const taprootMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.bitcoinTaproot);
  for (const match of taprootMatches) {
    const address = match[1];
    if (!seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase());
      addresses.push({
        type: 'bitcoin',
        subtype: 'Taproot',
        address,
        currency: 'Bitcoin',
        icon: '₿',
      });
    }
  }

  // Ethereum
  const ethereumMatches = content.matchAll(CRYPTO_ADDRESS_PATTERNS.ethereum);
  for (const match of ethereumMatches) {
    const address = match[1];
    if (!seen.has(address.toLowerCase())) {
      seen.add(address.toLowerCase());
      addresses.push({
        type: 'ethereum',
        subtype: 'ERC-20',
        address,
        currency: 'Ethereum',
        icon: 'Ξ',
      });
    }
  }

  return addresses;
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
