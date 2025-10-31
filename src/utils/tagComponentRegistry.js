/**
 * Tag Component Registry
 * Maps tag names to their corresponding Vue components
 */

import TagBookmark from '@/components/tags/TagBookmark.vue'
import TagPassword from '@/components/tags/TagPassword.vue'
import TagTOTP from '@/components/tags/TagTOTP.vue'
import TagCrypto from '@/components/tags/TagCrypto.vue'
import TagAttachments from '@/components/tags/TagAttachments.vue'
import TagReferences from '@/components/tags/TagReferences.vue'
import TagDomains from '@/components/tags/TagDomains.vue'
import TagUrl from '@/components/tags/TagUrl.vue'


import TagApiKey from '@/components/tags/TagApiKey.vue'
import TagQRCode from '@/components/tags/TagQRCode.vue'
import TagSecret from '@/components/tags/TagSecret.vue'
import TagWifi from '@/components/tags/TagWifi.vue'
import TagCard from '@/components/tags/TagCard.vue'
import TagDate from '@/components/tags/TagDate.vue'
import TagAddress from '@/components/tags/TagAddress.vue'

/**
 * Component registry mapping tag names to Vue components
 */
export const TAG_COMPONENTS = {
  // Bookmark tags
  bookmark: TagBookmark,
  url: TagUrl,

  // Password tags - grouped together
  password: TagPassword,
  email: TagPassword,
  username: TagPassword,

  // 2FA tags
  '2fa': TagTOTP,
  totp: TagTOTP,

  // Crypto tracking
  crypto: TagCrypto,

  // Domains
  domains: TagDomains,

  // QR Code
  qrcode: TagQRCode,

  // API Key
  apikey: TagApiKey,

  // New tags
  secret: TagSecret,
  wifi: TagWifi,
  card: TagCard,
  date: TagDate,
  address: TagAddress,
}

/**
 * Get the component for a given tag name
 * @param {string} tagName - The tag name (e.g., 'bookmark', 'password')
 * @returns {Component|null} The Vue component or null if not found
 */
export function getComponentForTag(tagName) {
  return TAG_COMPONENTS[tagName.toLowerCase()] || null
}

/**
 * Check if a tag should be rendered as a component
 * @param {string} tagName - The tag name
 * @returns {boolean} True if the tag has a component
 */
export function hasComponent(tagName) {
  return tagName.toLowerCase() in TAG_COMPONENTS
}

/**
 * Get all tags that should be rendered as components from parsed note
 * @param {Object} parsed - Parsed note object
 * @returns {Array} Array of {tag, component, value} objects
 */
export function getTagComponents(parsed) {
  if (!parsed || !parsed.tags) return []
  
  const components = []
  const processedGroups = new Set()
  
  for (const [tag, value] of Object.entries(parsed.tags)) {
    const component = getComponentForTag(tag)
    
    if (!component) continue
    
    // Group password-related tags together
    if (['password', 'email', 'username'].includes(tag)) {
      if (!processedGroups.has('password')) {
        components.push({
          tag: 'password',
          component: TagPassword,
          value,
          group: true
        })
        processedGroups.add('password')
      }
      continue
    }
    
    // Group 2FA-related tags
    if (['2fa', 'totp'].includes(tag)) {
      if (!processedGroups.has('totp')) {
        components.push({
          tag: tag,
          component: TagTOTP,
          value,
          group: true
        })
        processedGroups.add('totp')
      }
      continue
    }
    
    // Add other components
    components.push({
      tag,
      component,
      value,
      group: false
    })
  }
  
  return components
}
