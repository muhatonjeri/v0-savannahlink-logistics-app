# Moventra API Activation Guide

## APIs Working RIGHT NOW (no setup needed)

| API | What it does |
|-----|-------------|
| `/api/bookings` | Create/read/update/delete bookings |
| `/api/clients` | Client management (CRUD) |
| `/api/invoices` | Invoice management |
| `/api/receipts` | Receipt management |
| `/api/transactions` | Accounts/transactions |
| `/api/fleet` | Company fleet vehicles |
| `/api/fleet-out` | Fleet-out records |
| `/api/sublet-vehicles` | Sublet assets |
| `/api/sublet-bookings` | Sublet bookings |
| `/api/blacklist` | Blacklist management |
| `/api/staff` | Users/staff management |
| `/api/search` | Global search |
| `/api/notifications` | Alerts & overdue items |
| `/api/verify-payment` | Payment reference lookup |
| `/api/client-profile` | Full client history |
| `/api/generate-number` | Auto receipt/invoice numbers |
| `/api/health` | System health check |
| `/api/audit-log` | Change history |
| `/api/kra` | KRA PIN validation |
| `/api/kra/lookup` | KRA PIN lookup (redirect) |
| `/api/mpesa/callback` | M-Pesa payment confirmation |
| `/api/etims` | eTIMS (generates local numbers without keys) |

---

## APIs needing keys to go live

### 1. M-Pesa (STK Push payments)
**Status:** Works in mock/simulate mode. Needs keys for real payments.

**Steps:**
1. Go to https://developer.safaricom.co.ke
2. Sign up → Create App → Enable "Lipa Na M-Pesa Sandbox"
3. Copy Consumer Key and Consumer Secret
4. Add to `.env.local`:
```
MPESA_CONSUMER_KEY=your_consumer_key
MPESA_CONSUMER_SECRET=your_consumer_secret
MPESA_SHORTCODE=174379
MPESA_PASSKEY=bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919
MPESA_ENV=sandbox
MPESA_CALLBACK_URL=https://your-domain.com/api/mpesa/callback
```
5. Test with phone: 0708374149 (Safaricom sandbox test number)

**Go live:** Apply at developer.safaricom.co.ke → Go Live section. Replace shortcode and passkey with production values.

---

### 2. Email via Resend
**Status:** Returns mock response without key. FREE tier = 3,000 emails/month.

**Steps:**
1. Go to https://resend.com → Sign Up (free)
2. Go to API Keys → Create API Key
3. Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxx
FROM_EMAIL=receipts@moventrasafarislogisticsltd.com
```
4. **Important:** Verify your domain at resend.com/domains
   - Or use `onboarding@resend.dev` for testing (no domain needed)

**What it sends:** Booking confirmations, receipts, invoices — all branded with Moventra logo.

---

### 3. SMS via Africa's Talking
**Status:** Returns mock response without key. FREE sandbox for testing.

**Steps:**
1. Go to https://africastalking.com → Sign Up
2. Dashboard → Settings → API Key → Copy
3. Add to `.env.local`:
```
AT_API_KEY=your_api_key
AT_USERNAME=sandbox
AT_SENDER_ID=MOVENTRA
```
4. For production: change `AT_USERNAME` to your actual AT username and top up SMS credits (KES 1 per SMS approx)

**What it sends:** Booking confirmations, payment received, return reminders, balance reminders.

---

### 4. KRA eTIMS (receipt signing)
**Status:** Generates valid-looking local receipt numbers without device. Legal compliance needs real device.

**Steps:**
1. Go to https://etims.kra.go.ke → Register your business
2. Apply for a Virtual Sales Control Unit (VSCU)
3. KRA will issue a Device Number and API Key
4. Add to `.env.local`:
```
ETIMS_DEVICE_NUMBER=your_device_number
ETIMS_API_KEY=your_api_key
ETIMS_VSCU_URL=https://etims-api.kra.go.ke
```

**Note:** eTIMS registration requires your KRA PIN, business certificate, and valid email. Takes 3–5 business days.

---

### 5. Google Maps (optional)
**Status:** Returns Nairobi as default without key. Only needed for location autocomplete.

**Steps:**
1. Go to https://console.cloud.google.com
2. Create project → Enable "Maps JavaScript API" + "Geocoding API" + "Places API"
3. Credentials → Create API Key → Restrict to your domain
4. Add to `.env.local`:
```
NEXT_PUBLIC_GOOGLE_MAPS_KEY=AIzaxxxxxxxxxxxxxxxx
```

---

## How to add keys to .env.local

Open your `.env.local` file in the project root and add:
```
# Add after existing lines
MPESA_CONSUMER_KEY=paste_here
MPESA_CONSUMER_SECRET=paste_here
RESEND_API_KEY=paste_here
AT_API_KEY=paste_here
AT_USERNAME=sandbox
```

Then restart:
```bash
pnpm dev
```

No code changes needed — the APIs automatically detect the keys and switch from mock to live mode.

---

## Test each API is working

Visit these URLs after adding keys:

| Check | URL |
|-------|-----|
| System health | http://localhost:3002/api/health |
| M-Pesa test | POST to /api/mpesa with `{phone, amount, reference}` |
| Email test | POST to /api/email with `{to, subject, type:"booking", data:{}}` |
| SMS test | POST to /api/sms with `{phone, message}` |
| eTIMS test | POST to /api/etims with receipt data |

