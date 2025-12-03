# Mortgage Rates Widget Setup

## Overview
The MortgageRatesWidget displays current 30-year and 15-year fixed mortgage rates updated weekly from Freddie Mac data via the API Ninjas Mortgage Rate API.

## API Provider
**API Ninjas Mortgage Rate API**
- Website: https://api-ninjas.com/api/mortgagerate
- Data Source: Freddie Mac Primary Mortgage Market Survey
- Update Frequency: Weekly
- Free Tier: Yes (50,000 requests/month)

## Setup Instructions

### 1. Get Free API Key
1. Visit https://api-ninjas.com/register
2. Sign up for a free account (no credit card required)
3. Verify your email address
4. Navigate to your dashboard at https://api-ninjas.com/profile
5. Copy your API key

### 2. Configure the Widget
Open `MortgageRatesWidget.tsx` and replace `YOUR_API_KEY_HERE` with your actual API key:

```typescript
const response = await fetch('https://api.api-ninjas.com/v1/mortgagerate', {
  method: 'GET',
  headers: {
    'X-Api-Key': 'YOUR_ACTUAL_API_KEY_HERE', // Replace this
  },
});
```

### 3. Test the Widget
1. Save the file
2. Vite HMR will automatically reload the component
3. Navigate to the portal dashboard
4. The mortgage rates should appear in the bottom row between the blog posts and app launcher

## Fallback Behavior
If the API call fails (network error, rate limit, invalid key), the widget will:
1. Display an error message
2. Show sample data (6.85% for 30-year, 6.10% for 15-year)
3. Add a note "Using sample data"

## API Response Format
```json
[
  {
    "week": "2024-10-17",
    "frm_30": 6.44,
    "frm_15": 5.63
  }
]
```

## Widget Features
- **30-Year Fixed Rate**: Blue-teal gradient card
- **15-Year Fixed Rate**: Green gradient card
- **Date Display**: Shows the week the rates are from
- **Loading State**: Animated skeleton loader
- **Error Handling**: Graceful fallback to sample data
- **Responsive Design**: Works on mobile, tablet, and desktop

## Customization

### Change Colors
Edit the gradient backgrounds in `MortgageRatesWidget.tsx`:

```typescript
// 30-Year card
style={{
  background: 'linear-gradient(135deg, #2563eb 0%, #2dd4da 100%)',
}}

// 15-Year card
style={{
  background: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)',
}}
```

### Add More Rate Types
API Ninjas also provides ARM rates. To add them, extend the interface:

```typescript
interface MortgageRate {
  week: string;
  frm_30: number;
  frm_15: number;
  arm_5_1?: number; // Optional ARM rate
}
```

## Production Considerations

### Security
**IMPORTANT**: For production, the API key should NOT be hardcoded in the frontend code. Instead:

1. **Create a WordPress REST API endpoint** in PHP:
```php
register_rest_route('frs/v1', '/mortgage-rates', [
    'methods' => 'GET',
    'callback' => function() {
        $api_key = get_option('frs_api_ninjas_key'); // Store in WordPress options
        $response = wp_remote_get('https://api.api-ninjas.com/v1/mortgagerate', [
            'headers' => ['X-Api-Key' => $api_key]
        ]);
        return json_decode(wp_remote_retrieve_body($response));
    },
    'permission_callback' => '__return_true'
]);
```

2. **Update the widget** to call your endpoint:
```typescript
const response = await fetch('/wp-json/frs/v1/mortgage-rates', {
  credentials: 'same-origin',
});
```

### Caching
To reduce API calls, implement caching:
- Cache rates in WordPress transients (24-hour expiry recommended)
- Rates only update weekly, so daily cache is sufficient

### Rate Limits
Free tier allows 50,000 requests/month:
- With caching: ~1,500 daily requests = ~100 users checking dashboard 15x/day
- Without caching: Would hit limit quickly

## Troubleshooting

### Widget Shows "Unable to load rates"
1. Check API key is correct
2. Verify network connection
3. Check browser console for errors
4. Test API directly: `curl -H "X-Api-Key: YOUR_KEY" https://api.api-ninjas.com/v1/mortgagerate`

### CORS Errors
If you get CORS errors, the API key may be invalid or the endpoint is blocked. API Ninjas supports CORS for browser requests.

### Rate Limit Exceeded
If you hit the 50,000/month limit:
1. Implement caching (recommended)
2. Upgrade to paid plan ($9.99/month for 500,000 requests)
3. Switch to a different provider

## Alternative APIs

If you need a different provider:

1. **Zillow Group Mortgage API** (requires application)
2. **Commercial Loan Direct API** (commercial rates only)
3. **Custom scraper** (legal compliance required)

## Support
For API issues: https://api-ninjas.com/support
For widget issues: Contact plugin developer
