# Tag System

| Tag           | Description                | Example Value             |
| ------------- | -------------------------- | ------------------------- |
| `#@title=`    | Note title                 | `#@title=GitHub Account`  |
| `#@tags=`     | Comma-separated tags       | `#@tags=work,urgent`      |
| `#@pin=    `  | Pin note to top            | `#@pin=true`              |
| `#@icon=`     | Emoji icon for note        | `#@icon=🔑`               |
| `#@email=`    | Email address (login)      | `#@email=dev@example.com` |
| `#@username=` | Username (login)           | `#@username=myuser`       |
| `#@password=` | Password                   | `#@password=Secret123!`   |
| `#@2fa=`      | 2FA/TOTP secret            | `#@2fa=JBSWY3DPEHPK3PXP`  |
| `#@totp=`     | TOTP secret (same as 2fa)  | `#@totp=JBSWY3DPEHPK3PXP` |
| `#@domains=`  | Related domains/websites   | `#@domains=github.com`    |
| `#@bookmark=` | Website URL (bookmark)     | `#@bookmark=https://...`  |
| `#@url=`      | Website URL (bookmark)     | `#@url=https://...`       |
| `#@qrcode=`   | Generate QR code from text | `#@qrcode=SomeText`       |
| `#@crypto=`   | Get Information Crypto     | `#@crypto=bitcoin`        |
| `#@apikey=`   | API Key for integrations   | `#@apikey=sk-1234abcd`    |


# Auto Parsing

1. Parse Crypto Address - Currently Bitcoin, Litecoin, Ethereum, Solana
2. Links - All https links

## Add More ?

For this repo and add more 
