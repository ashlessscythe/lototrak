Resend home pagedark logo

    Sign In
    Get Started

Documentation
API Reference
Knowledge Base
Documentation

    Introduction

Quickstart

    Node.js

    Introduction
    Next.js
    Remix
    Nuxt
    Express
    RedwoodJS
    Hono
    Bun
    Astro

Serverless
PHP
Ruby
Python
Go
Rust
Elixir
Java
.NET
SMTP
Learn

    Emails

Domains
API Keys
Webhooks
Audiences
Broadcasts
Resources

    Examples
    SDKs
    Security
    Integrations

Node.js
Next.js

Learn how to send your first email using Next.js and the Resend Node.js SDK.
​
Prerequisites

To get the most out of this guide, you’ll need to:

    Create an API key
    Verify your domain

​

1. Install

Get the Resend Node.js SDK.

npm install resend

​ 2. Create an email template

Start by creating your email template on components/email-template.tsx.
components/email-template.tsx

import \* as React from 'react';

interface EmailTemplateProps {
firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
firstName,
}) => (

  <div>
    <h1>Welcome, {firstName}!</h1>
  </div>
);

​ 3. Send email using React

Create an API file under pages/api/send.ts if you’re using the Pages Router or create a route file under app/api/send/route.ts if you’re using the App Router.

Import the React email template and send an email using the react parameter.

import { EmailTemplate } from '../../../components/EmailTemplate';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
try {
const { data, error } = await resend.emails.send({
from: 'Acme <onboarding@resend.dev>',
to: ['delivered@resend.dev'],
subject: 'Hello world',
react: EmailTemplate({ firstName: 'John' }),
});

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);

} catch (error) {
return Response.json({ error }, { status: 500 });
}
}

​ 4. Try it yourself
Next.js Example (Pages Router)

See the full source code.
Next.js Example (App Router)

See the full source code.

Was this page helpful?
Introduction
Remix
twitter
github
discord
website
On this page

    Prerequisites
    1. Install
    2. Create an email template
    3. Send email using React
    4. Try it yourself

Next.js - Resend
