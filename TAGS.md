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
| `#@secret=`   | Generic secret                | `#@secret=abcd1234`        |
| `#@wifi=`     | WiFi credentials (SSID:pass)  | `#@wifi=HomeWiFi:password` |
| `#@card=`     | Card number, expiry, and CVV  | `#@card=4111 1111 1111 1111-12/27-123` |
| `#@date=`     | Date (any format)             | `#@date=2025-10-31`        |
| `#@address=`  | Physical address (opens OpenStreetMap and searches the address) | `#@address=1600 Amphitheatre Parkway, Mountain View, CA` |
| `#@ip=`       | IP address info (lookup and geolocation) | `#@ip=8.8.8.8` |



# Auto Parsing

1. Parse Crypto Address - Currently Bitcoin, Litecoin, Ethereum, Solana
2. Links - All https links

## Add More ?

For this repo and add more 
