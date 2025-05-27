# Stripe Payment Implementation Recipe

This document provides a comprehensive explanation of how Stripe payment processing is implemented in a Next.js application, based on the sample code analysis.

## 1. Project Structure Overview

```
├── app/
│   ├── api/
│   │   ├── create-checkout-session/
│   │   │   └── route.js            # API route to create Stripe checkout session
│   │   └── session-status/
│   │       └── route.js            # API route to verify session status
│   ├── checkout/
│   │   └── [priceId]/              # Dynamic route for checkout based on product
│   │       ├── CheckoutForm.jsx    # Component with payment form
│   │       └── page.jsx            # Page that initializes Stripe and renders form
│   ├── done/
│   │   └── page.jsx                # Confirmation page after payment
│   ├── global.css                  # Global styles
│   ├── layout.jsx                  # App layout
│   └── page.jsx                    # Product listing page
├── lib/
│   └── stripe.js                   # Stripe initialization
├── package.json                    # Project dependencies
└── README.md                       # Project documentation
```

## 2. Stripe Configuration and Initialization

### 2.1 Setting Up Stripe Client

The Stripe client is initialized in `lib/stripe.js`:

```javascript
import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-03-31.basil',
});
```

Key points:
- Uses server-side Stripe secret key from environment variables
- Specifies API version for compatibility

### 2.2 Environment Variables Required

The project requires these environment variables:
- `STRIPE_SECRET_KEY`: Server-side key for backend operations
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Client-side key for frontend
- `DOMAIN`: Base URL for return URLs after payment

## 3. Product Display and Selection

Products are defined in `app/page.jsx` with their Stripe price IDs:

```javascript
const products = [
  {
    name: "Consultency",
    priceId: "price_1RSv5sGxEOwhw38jlZ3IOqME",
    price: "$1.00",
    image: "https://i.imgur.com/6Mvijcm.png"
  },
];
```

Each product is rendered with a link to its checkout page:

```javascript
<Link href={`/checkout/${priceId}`} className="button">
  Checkout
</Link>
```

The `priceId` is passed in the URL to identify which product is being purchased.

## 4. Checkout Session Creation

### 4.1 Backend API Route

When a customer selects a product, the application creates a checkout session through a server-side API route in `app/api/create-checkout-session/route.js`:

```javascript
export async function POST(request) {
  const { priceId } = await request.json()

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "payment",
    ui_mode: "custom",
    return_url: `${process.env.DOMAIN}/done?session_id={CHECKOUT_SESSION_ID}`,
  });

  return Response.json({ clientSecret: session.client_secret });
}
```

Key configuration options:
- `line_items`: Products being purchased (using the Stripe price ID)
- `mode`: "payment" for one-time payments (alternatives: "subscription", "setup")
- `ui_mode`: "custom" to render using Elements instead of hosted checkout
- `return_url`: Where to redirect after payment, with session ID placeholder

### 4.2 Frontend Integration

The checkout page (`app/checkout/[priceId]/page.jsx`) renders the payment form:

```javascript
"use client";

import { loadStripe } from "@stripe/stripe-js";
import { CheckoutProvider } from "@stripe/react-stripe-js";

// Initialize Stripe with publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Page() {
  const { priceId } = useParams();
  
  // Function to call the API and get client secret
  const fetchClientSecret = useCallback(() => {
    return fetch("/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId }),
    })
      .then((res) => res.json())
      .then((data) => data.clientSecret);
  }, [priceId]);

  return (
    <CheckoutProvider
      stripe={stripePromise}
      options={{
        fetchClientSecret,
        elementsOptions: {
          appearance: {
            variables: {
              colorPrimary: "#556cd6",
            },
          },
        },
      }}
    >
      <CheckoutForm />
    </CheckoutProvider>
  );
}
```

Key points:
- Uses `loadStripe` with publishable key
- `CheckoutProvider` wraps the payment form
- `fetchClientSecret` calls the backend API to create session
- Customizes appearance via `elementsOptions`

## 5. Payment Form Implementation

The payment form (`CheckoutForm.jsx`) collects customer information and payment details:

```javascript
import { PaymentElement, useCheckout } from "@stripe/react-stripe-js";

export const CheckoutForm = () => {
  const checkout = useCheckout();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Get email address and update the customer
    const email = e.target.email.value;
    const updateResult = await checkout.updateEmail(email);
    if (updateResult.error) {
      setError(updateResult.error);
      setIsLoading(false);
      return;
    }

    // Confirm the payment
    const result = await checkout.confirm();
    if (result.type === "error") {
      setError(result.error);
    }

    setIsLoading(false);
  };

  return (
    <form className="checkout-elements" onSubmit={handleSubmit}>
      <h2>Total amount for the order: {checkout.total.total.amount}</h2>
      <div className="email">
        <label>Email</label>
        <input type="text" name="email" />
      </div>

      <PaymentElement
        className="payment-element"
        options={{ layout: "accordion" }}
      />

      <button className="button" disabled={isLoading}>
        <span id="button-text">
          {isLoading ? <div className="spinner"></div> : "Pay now"}
        </span>
      </button>

      {error && <div className="checkout-form-error">{error.message}</div>}
    </form>
  );
};
```

Key components:
- `useCheckout` hook provides access to the checkout session
- `PaymentElement` renders the dynamic payment form
- Form collects email and payment details
- `checkout.updateEmail()` associates email with payment
- `checkout.confirm()` processes the payment
- Automatic redirect happens on successful payment

## 6. Payment Completion and Verification

### 6.1 Confirmation Page

After payment, the customer is redirected to the confirmation page (`app/done/page.jsx`) with the session ID:

```javascript
export default function Page() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [status, setStatus] = useState(null);

  useEffect(() => {
    // Verify the session status
    if (sessionId) {
      fetch(`/api/session-status?session_id=${sessionId}`)
        .then((res) => res.json())
        .then((data) => setStatus(data.status));
    }
  }, [sessionId]);

  // Show loading indicator until status is retrieved
  if (!status) {
    return <div className="spinner" />;
  }

  // Redirect if payment wasn't completed
  if (status === "open") {
    return redirect("/");
  }

  return (
    <div className="container">
      <p className="message">Your purchase was successful</p>
      <Link href="/" className="button">
        Back to products
      </Link>
    </div>
  );
}
```

### 6.2 Session Status Verification

The status is verified through an API endpoint (`app/api/session-status/route.js`):

```javascript
export async function GET(request) {
  const { searchParams } = request.nextUrl;
  const session_id = searchParams.get('session_id');
  const session = await stripe.checkout.sessions.retrieve(session_id);
  return Response.json({ status: session.status });
}
```

This confirms whether the payment was successful by checking the session status directly with Stripe.

## 7. Implementation Flow Summary

1. **Product Selection**: User views products on the home page and clicks "Checkout"
2. **Checkout Initialization**: 
   - App loads the checkout page with the product's price ID
   - Stripe is initialized with the publishable key
   - The app calls the API to create a checkout session with the price ID
   - Stripe returns a client secret for the session
3. **Payment Form Rendering**:
   - The `CheckoutProvider` sets up Stripe Elements with the client secret
   - The payment form is rendered with the `PaymentElement` component
4. **Payment Submission**:
   - User enters email and payment details
   - On form submission, the app updates the customer's email
   - The `checkout.confirm()` method processes the payment
   - On success, Stripe redirects to the completion URL with the session ID
5. **Payment Verification**:
   - The completion page loads and extracts the session ID from the URL
   - The app calls the API to verify the session status
   - If verified as complete, a success message is displayed

## 8. Key Implementation Details

### 8.1 UI Mode: Custom vs. Hosted

This implementation uses `ui_mode: "custom"` which uses Stripe Elements for embedded checkout rather than Stripe's hosted checkout page. This provides:
- More control over the UI
- Seamless integration with the app's design
- Ability to collect additional information alongside payment

### 8.2 Payment vs. Subscription Mode

The sample uses `mode: "payment"` for one-time payments. For recurring payments, you would use `mode: "subscription"`.

### 8.3 Security Considerations

- Stripe API keys are properly segregated:
  - Secret key is only used server-side
  - Publishable key is used client-side
- Session verification happens on the server
- Redirect URLs use placeholders that Stripe populates

## 9. Adapting to Other Projects

To adapt this implementation to your projects:

1. **Install Dependencies**:
   ```bash
   npm install stripe @stripe/stripe-js @stripe/react-stripe-js
   ```

2. **Configure Environment Variables**:
   ```
   STRIPE_SECRET_KEY=sk_test_...
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
   DOMAIN=http://localhost:3000
   ```

3. **Create Stripe Product and Price IDs** in the Stripe Dashboard

4. **Copy the Core Implementation Files**:
   - Stripe initialization (`lib/stripe.js`)
   - API routes for session creation and verification
   - Checkout components with minimal adaptation

5. **Customize the Product Display** to match your inventory

6. **Customize the Payment Form** to collect any additional required information

7. **Test the Implementation** using Stripe's test cards
