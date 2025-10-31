
import { Bookmark, Key, Wifi, Globe, QrCode, Lock, FileText, Link, User, Mail, Shield, CreditCard, Calendar, MapPin, Database, Star, Eye, Hash, Layers, ShieldCheck } from 'lucide-vue-next';
import TagBookmark from '@/components/tags/TagBookmark.vue';
import TagPassword from '@/components/tags/TagPassword.vue';
import TagTOTP from '@/components/tags/TagTOTP.vue';
import TagCrypto from '@/components/tags/TagCrypto.vue';
import TagAttachments from '@/components/tags/TagAttachments.vue';
import TagReferences from '@/components/tags/TagReferences.vue';
import TagDomains from '@/components/tags/TagDomains.vue';
import TagUrl from '@/components/tags/TagUrl.vue';
import TagApiKey from '@/components/tags/TagApiKey.vue';
import TagQRCode from '@/components/tags/TagQRCode.vue';
import TagSecret from '@/components/tags/TagSecret.vue';
import TagWifi from '@/components/tags/TagWifi.vue';
import TagCard from '@/components/tags/TagCard.vue';
import TagDate from '@/components/tags/TagDate.vue';
import TagAddress from '@/components/tags/TagAddress.vue';

export const TAGS = [
  {
    name: 'bookmark',
    icon: Bookmark,
    description: 'Bookmark or URL',
    component: TagBookmark,
  },
  {
    name: 'url',
    icon: Globe,
    description: 'Website URL',
    component: TagUrl,
  },
  {
    name: 'password',
    icon: Key,
    description: 'Password field',
    component: TagPassword,
  },
  {
    name: 'email',
    icon: Mail,
    description: 'Email address',
    component: TagPassword,
  },
  {
    name: 'username',
    icon: User,
    description: 'Username',
    component: TagPassword,
  },
  {
    name: '2fa',
    icon: Shield,
    description: '2FA/TOTP secret',
    component: TagTOTP,
  },
  {
    name: 'totp',
    icon: ShieldCheck,
    description: 'TOTP secret',
    component: TagTOTP,
  },
  {
    name: 'crypto',
    icon: Lock,
    description: 'Cryptocurrency tracking',
    component: TagCrypto,
  },
  {
    name: 'domains',
    icon: Globe,
    description: 'Related domains',
    component: TagDomains,
  },
  {
    name: 'qrcode',
    icon: QrCode,
    description: 'QR Code',
    component: TagQRCode,
  },
  {
    name: 'apikey',
    icon: Database,
    description: 'API Key',
    component: TagApiKey,
  },
  {
    name: 'secret',
    icon: Lock,
    description: 'Secret value',
    component: TagSecret,
  },
  {
    name: 'wifi',
    icon: Wifi,
    description: 'WiFi credentials',
    component: TagWifi,
  },
  {
    name: 'card',
    icon: CreditCard,
    description: 'Card details',
    component: TagCard,
  },
  {
    name: 'date',
    icon: Calendar,
    description: 'Date',
    component: TagDate,
  },
  {
    name: 'address',
    icon: MapPin,
    description: 'Address',
    component: TagAddress,
  },
  // Add more tags as needed
];

// Utility to get tag by name
export function getTagByName(name) {
  return TAGS.find(t => t.name === name.toLowerCase()) || null;
}
