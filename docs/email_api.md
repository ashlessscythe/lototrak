# Resend SMTP Integration Guide

## Introduction

Learn how to integrate Resend via SMTP and NextAuth.

## Prerequisites

To get started, ensure you have:

- Created an API key
- Verified your domain

## SMTP Credentials

When configuring your SMTP integration, use the following credentials:

| Type     | Port(s)       | Security                                                                  |
| -------- | ------------- | ------------------------------------------------------------------------- |
| SMTPS    | 465, 2465     | Implicit SSL/TLS (Immediately connects via SSL/TLS)                       |
| STARTTLS | 25, 587, 2587 | Explicit SSL/TLS (First connects via plaintext, then upgrades to SSL/TLS) |

- **Host:** `smtp.resend.com`
- **Username:** `resend`
- **Password:** `YOUR_API_KEY`

## Custom Headers

If your SMTP client supports custom headers, consider adding these:

- **X-Entity-Ref-ID:** Prevent threading on Gmail.
- **List-Unsubscribe:** Provide an unsubscribe shortcut for users.

## NextAuth SMTP Integration

### 1. Install Dependencies

Install the necessary packages:

```sh
npm install next-auth nodemailer
```

### 2. Configure SMTP Credentials

Add your Resend SMTP credentials in your application's `.env` file:

```
EMAIL_SERVER_USER=resend
EMAIL_SERVER_PASSWORD=YOUR_API_KEY
EMAIL_SERVER_HOST=smtp.resend.com
EMAIL_SERVER_PORT=465
EMAIL_FROM=onboarding@resend.dev
```

### 3. Configure Email Provider

Modify your `[...nextauth].js` file (typically in `pages/api/auth`) to use the Email provider:

```ts
import NextAuth from "next-auth";
import EmailProvider from "next-auth/providers/email";
import nodemailer from "nodemailer";

export default NextAuth({
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: process.env.EMAIL_SERVER_PORT,
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
    // ... other providers as needed
  ],
  // ... any other NextAuth.js configs
});
```

## FAQ

- **Will emails sent with SMTP appear in my emails table?**  
  Yes, emails sent via SMTP will be visible in your email logs.
- **Is the rate limit the same as the API?**  
  Yes, SMTP emails are subject to the same rate limits as API emails.

---

For additional resources:

- [Resend Website](https://resend.com)
- [GitHub](https://github.com/resend)
- [Discord](https://discord.gg/resend)
- [API Reference](https://resend.com/docs)
