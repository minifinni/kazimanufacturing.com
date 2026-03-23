# Kazi Manufacturing - Quote Form API

## Setup

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Set Environment Variables
Create `.env` file or set in Vercel dashboard:

```env
# Supabase (use existing project)
SUPABASE_URL=https://snzxjckavtrdwcudyran.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Resend (email already configured)
RESEND_API_KEY=re_VHGS2KBp_7HHUvrbg5HWCnwDyJMvtL8J8
```

### 3. Create Database Table
Run the SQL in `supabase-schema.sql` in your Supabase SQL editor.

### 4. Deploy
```bash
vercel --prod
```

## Features

- **Quote Storage**: All quotes stored in Supabase with full details
- **Email Notifications**: 
  - Admin notification to hello@kazimanufacturing.com
  - Customer confirmation with next steps
- **Status Tracking**: Track quotes through pipeline (new → contacted → quoted → accepted/rejected)
- **Spam Protection**: Basic validation + rate limiting via Vercel

## API Endpoint

**POST** `/api/quote`

Request body:
```json
{
  "name": "Customer Name",
  "email": "customer@example.com",
  "company": "Brand Name",
  "productType": "t-shirts",
  "decorationType": "screen-print",
  "printLocations": ["front", "back"],
  "numColors": "3-4",
  "quantity": "200",
  "timeline": "standard",
  "message": "Project details..."
}
```

## Admin Dashboard

View all quotes in Supabase:
```sql
SELECT * FROM kazi_quotes ORDER BY created_at DESC;
```

Or connect to a simple admin UI (to be built).