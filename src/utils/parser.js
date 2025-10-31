// Centralized parseable entities for notes
// Each entity: name, regex/function, icon, description, component

import { Paperclip, Link, Bitcoin, FileText, Ethereum, Coins, BadgeEuro, QrCode } from 'lucide-vue-next';
import TagReferences from '@/components/tags/TagReferences.vue';
import TagCryptoAddress from '@/components/tags/TagCryptoAddress.vue';

export const PARSERS = [
  {
    name: 'references',
    regex: /https?:\/\/[\w.-]+(?:\.[\w\.-]+)+(?:[\w\-\._~:/?#[\]@!$&'()*+,;=]*)/gi,
    icon: Link,
    description: 'External references/links',
    component: TagReferences,
  },
  // Multiple crypto address types
  {
    name: 'bitcoin_legacy',
    regex: /\b(1[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
    icon: Bitcoin,
    description: 'Bitcoin Legacy (P2PKH)',
  component: TagCryptoAddress,
  },
  {
    name: 'bitcoin_segwit',
    regex: /\b(3[a-km-zA-HJ-NP-Z1-9]{25,34})\b/g,
    icon: Bitcoin,
    description: 'Bitcoin SegWit (P2SH)',
  component: TagCryptoAddress,
  },
  {
    name: 'bitcoin_bech32',
    regex: /\b(bc1[a-z0-9]{39,59})\b/gi,
    icon: Bitcoin,
    description: 'Bitcoin Bech32 (Native SegWit)',
  component: TagCryptoAddress,
  },
  {
    name: 'bitcoin_taproot',
    regex: /\b(bc1p[a-z0-9]{58})\b/gi,
    icon: Bitcoin,
    description: 'Bitcoin Taproot',
  component: TagCryptoAddress,
  },
  {
    name: 'ethereum',
    regex: /\b(0x[a-fA-F0-9]{40})\b/g,
    icon: Ethereum,
    description: 'Ethereum (ERC-20)',
  component: TagCryptoAddress,
  },
  {
    name: 'solana',
    regex: /\b([1-9A-HJ-NP-Za-km-z]{32,44})\b/g,
    icon: Coins,
    description: 'Solana (base58)',
  component: TagCryptoAddress,
  },
  {
    name: 'litecoin_legacy',
    regex: /\b(L[a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
    icon: BadgeEuro,
    description: 'Litecoin Legacy (L...)',
  component: TagCryptoAddress,
  },
  {
    name: 'litecoin_segwit',
    regex: /\b(M[a-km-zA-HJ-NP-Z1-9]{26,33})\b/g,
    icon: BadgeEuro,
    description: 'Litecoin SegWit (M...)',
  component: TagCryptoAddress,
  },
  {
    name: 'litecoin_bech32',
    regex: /\b(ltc1[qpzry9x8gf2tvdw0s3jn54khce6mua7l]{39,59})\b/gi,
    icon: BadgeEuro,
    description: 'Litecoin Bech32 (ltc1...)',
  component: TagCryptoAddress,
  },
  // Add more parseable entities as needed
];

// Utility to get parser by name
export function getParserByName(name) {
  return PARSERS.find(p => p.name === name) || null;
}
