Great! Here's a detailed breakdown of both the **API Specification** and the **Next.js project file structure** tailored to your stack:

---

## 🔌 API SPECIFICATION (for AI Agent + Fortune Flow)

### `POST /api/fortune/submit`

**Description**: Accepts user details and an uploaded image, sends everything to Claude Sonnet 3.7 via AWS Bedrock, returns the fortune, and stores the record.

---

### ✅ Request

**Headers**:

* `Authorization: Bearer <Clerk JWT token>`
* `Content-Type: multipart/form-data`

**Body**:

```ts
{
  name: string;
  age: number;
  intent: string;
  email: string;
  image: File; // coffee cup photo (jpg/png)
}
```

---

### 🪄 Backend Logic

1. **Validate**: Clerk session, inputs, and file
2. **Process Payment**: Handle Stripe payment transaction
3. **Upload Image**: Send to Firebase Storage
4. **Prepare Prompt**:

```txt
Act as an experienced Tasseography Fortune Teller. 
The user is named {name}, age {age}, with the intent: "{intent}".
Here is their coffee cup image. 
Please provide a meaningful and detailed fortune based on the symbols and texture in the cup.
```

5. **Call AWS Bedrock** (Claude 3.7 Multimodal) with:

   * `text` = prompt above
   * `image` = uploaded photo
6. **Save**: Store user info + fortune result in Firebase (`fortunes` collection)
7. **Send Email** (optional: Resend/SendGrid)
8. **Return Response**

---

### 🔁 Response

```json
{
  "status": "success",
  "fortune": "You are about to enter a new phase in your life...",
  "timestamp": "2025-05-16T10:00:00Z"
}
```

---

## 🧱 NEXT.JS FILE STRUCTURE (TypeScript + Clerk + Firebase + Stripe + Bedrock)

```
/coffee-fortune-tell
├── app/
│   ├── layout.tsx
│   ├── page.tsx               # Landing page
│   ├── login/                 # Clerk login route
│   ├── dashboard/             # (Optional) authenticated area
│   └── api/
│       └── fortune/
│           └── submit/route.ts  # API Route for form submission
│
├── components/
│   ├── form.tsx              # Input form for name, age, intent, image, email
│   ├── navbar.tsx            # Top nav with "How It Works" and Login
│   └── result.tsx            # (Optional) fortune display component
│
├── lib/
│   ├── bedrock.ts            # AWS Bedrock client config (Claude Sonnet)
│   ├── firebase.ts           # Firebase SDK init
│   ├── stripe.ts             # Stripe config and payment functions
│   └── upload.ts             # Handle file uploads to Firebase Storage
│
├── styles/
│   └── globals.css           # Includes shadcn styles
│
├── ui/                       # shadcn components
│   └── button.tsx, input.tsx, textarea.tsx, etc.
│
├── public/                   # Static assets
│
├── .env.local                # API keys for Clerk, Firebase, AWS, Stripe
├── tailwind.config.ts
├── shadcn.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 📦 Required Packages

Install:

```bash
npm install next @clerk/nextjs firebase stripe aws-sdk sharp shadcn-ui react-hook-form zod axios
```

---

## 🔐 .env.local Example

```env
CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
NEXT_PUBLIC_CLERK_FRONTEND_API=...

FIREBASE_API_KEY=...
FIREBASE_PROJECT_ID=...
FIREBASE_STORAGE_BUCKET=...
FIREBASE_MESSAGING_SENDER_ID=...
FIREBASE_APP_ID=...

STRIPE_SECRET_KEY=...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=...

AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
```

---

Would you like me to generate the actual **form code**, **API route handler**, or **AWS Bedrock wrapper** next?
