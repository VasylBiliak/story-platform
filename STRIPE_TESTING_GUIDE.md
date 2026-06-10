# Stripe Integration Testing Guide

## Setup

1. **Add environment variables** to your `.env` file:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

2. **Get Stripe credentials:**
   - Log into Stripe Dashboard (Test Mode)
   - Get API keys from Developers > API keys
   - Create webhook endpoint: `https://your-domain.com/api/stripe/webhook`
   - Select event: `checkout.session.completed`
   - Copy webhook signing secret

## Testing Flow

### 1. Create a Paid Chapter

- Use the admin interface to create a chapter with `price > 0`
- Ensure the chapter is not free

### 2. Test Purchase Flow

1. Navigate to a paid chapter as an authenticated user
2. Click "Buy for $X.XX" button
3. Verify:
   - Button shows "Processing..." state
   - User is redirected to Stripe Checkout

### 3. Test Stripe Checkout

1. On Stripe Checkout page, use test card:
   - **Card number:** `4242 4242 4242 4242`
   - **Expiry:** Any future date (e.g., `12/34`)
   - **CVC:** Any 3 digits (e.g., `123`)
   - **Postal code:** Any 5 digits (e.g., `12345`)

2. Click "Pay"
3. Verify:
   - Payment is successful
   - User is redirected back to chapter page with `?payment=success`
   - Success banner is displayed
   - Chapter content is now accessible

### 4. Test Webhook

1. Check Stripe Dashboard > Events
2. Find `checkout.session.completed` event
3. Verify:
   - Event was delivered to your webhook endpoint
   - ChapterPurchase record was created in database
   - No errors in server logs

### 5. Test Duplicate Purchase Prevention

1. Try to purchase the same chapter again
2. Verify:
   - API returns error: "Chapter already purchased"
   - No duplicate ChapterPurchase record is created

### 6. Test Cancelled Payment

1. Start checkout process
2. Click "Cancel" on Stripe Checkout page
3. Verify:
   - User is redirected back to chapter page with `?payment=cancelled`
   - Cancelled banner is displayed
   - Chapter remains locked

### 7. Test Access Control

1. Log out
2. Navigate to paid chapter
3. Verify:
   - Chapter content is hidden
   - Paywall is displayed
   - "Buy" button is shown

4. Log in as different user (who hasn't purchased)
5. Verify:
   - Chapter content is hidden
   - Paywall is displayed

6. Log in as user who purchased
7. Verify:
   - Chapter content is visible
   - No paywall

## Webhook Testing Locally

For local development, use Stripe CLI:

```bash
# Install Stripe CLI
# Then forward webhooks to your local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will give you a webhook secret for local testing.

## Security Verification

- ✅ Frontend never grants access directly
- ✅ Backend verifies authentication before creating checkout session
- ✅ Webhook signature is verified
- ✅ Ownership is granted only after successful webhook
- ✅ Duplicate purchases are prevented by database unique constraint
- ✅ Chapter content is hidden for non-purchased paid chapters

## Common Issues

**Webhook not receiving events:**
- Verify webhook URL is correct
- Check Stripe Dashboard webhook delivery status
- Ensure server is publicly accessible (use ngrok for local testing)

**Payment successful but chapter still locked:**
- Check server logs for webhook errors
- Verify ChapterPurchase record was created
- Refresh page to clear cached ownership status

**"Chapter already purchased" error:**
- Check database for existing ChapterPurchase record
- Verify unique constraint is working

## Test Card Numbers

- **Success:** `4242 4242 4242 4242`
- **Requires authentication:** `4000 0025 0000 3155`
- **Declined:** `4000 0000 0000 0002`
- **Insufficient funds:** `4000 0026 0000 3155`
