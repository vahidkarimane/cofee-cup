**detailed PRD (Product Requirements Document)**
 **Tasseography (Coffee Fortune Telling) Web App**:

---

# 🪄 Product Requirements Document (PRD)

## Product Name: Coffee Fortune Telling Web App

## Version: 1.0

## Target Audience: Users interested in coffee cup reading (Tasseography)

---

## 1. Overview

This is a web application that allows users to upload an image of their coffee cup after drinking, enter personal details and intent, and receive a fortune-telling response based on the uploaded image. The system should include a frontend for users and API endpoints for backend integration with an AI image analyzer and text generator.

---

## 2. Goals & Objectives

* Allow users to easily submit a tasseography request.
* Capture user context (age, name, intent).
* Collect image data (coffee cup).
* Trigger a backend process that returns a fortune.
* Include simple login/auth for repeat users (optional phase 2).
* Enable Stripe payment integration before submitting a request (MVP).

---

## 3. User Stories

### 3.1 As a new user

* I want to enter my name, age, intent, and a short context.
* I want to upload a photo of my coffee cup (post-drink).
* I want to enter my email to receive the result.
* I want to click a button to get a fortune and pay.

### 3.2 As a returning user

* I want to log in and see past readings (Phase 2).
* I want to re-submit with new images (Phase 2).

---

## 4. Functional Requirements

### 4.1 Frontend

#### Landing Page

* Title: "Coffee Fortune Telling"
* Top navigation:

  * `How It Works` → Scroll or open a modal explaining the process.
  * `Login` (text link) → Optional (future).

#### Input Form

* **Input Fields**:

  * `Name` (text input, required)
  * `Age` (number input, required, 12–100)
  * `Intent & About You` (textarea, required, min 20 characters)
  * `Image Upload` (JPEG/PNG, max 5MB, 1 image only, required)
  * `Email` (valid email format, required)

* **CTA Button**:

  * Label: "Fortune Telling"
  * Function:

    * Validates form
    * Initiates Stripe payment
    * Sends data to backend API

* **Icons & UI Design**:

  * Dark purple background
  * Gold/orange/cream accents
  * Icons: Coffee Cup ☕, User 👤, Age 🗓️, Message 💬, Upload ⬆️, Email ✉️, Crystal Ball 🔮

---

### 4.2 Backend API (for AI agent)

**POST /submit-fortune**

* **Request Body**:

```json
{
  "name": "string",
  "age": "number",
  "intent": "string",
  "image": "base64 or file upload",
  "email": "string"
}
```

* **Process**:

  1. Validate data
  2. Save to DB (optional for future)
  3. Trigger image analysis + text generation (use AI pipeline)
  4. Email result to user or show confirmation screen

* **Response**:

```json
{
  "status": "success",
  "message": "Your fortune will be sent to your email."
}
```

---

### 4.3 AI Interaction (optional backend logic)

* **AI Service 1**: Coffee Ground Pattern Analysis

  * Input: Coffee cup image
  * Output: List of detected symbols/shapes
* **AI Service 2**: Fortune Text Generator

  * Input: Detected symbols + user context
  * Output: A paragraph of fortune text (human tone)

---

## 5. Non-Functional Requirements

* **Mobile responsive** (priority)
* **Upload handling**: Ensure image sanitisation
* **Security**: Input validation and basic anti-bot
* **Performance**: Fortune delivery under 10 seconds post-submission
* **Accessibility**: WCAG compliant

---

## 6. Future Features (Not in MVP)

* Login and Profile Management
* View Past Fortunes
* AI-generated audio or video interpretations

---

## 7. Tech Stack Recommendation

* **Frontend**: Next.js or React, Tailwind CSS, ShadCN
* **Backend**:  Next.js API Routes
* **Image Upload**: Firebase Storage
* **AI Backend**: aws bedrock Sonnet 3.7
* **Email**: SendGrid or Resend
* **Database**:  Firebase
