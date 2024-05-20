---
title: INC Form Builder
tags: [NextJS, tRPC, Prisma, TailwindCSS, TypeScript, Next-auth, AWS S3, Zustand]
images:
  - src: /images/formbuilder.png
    alt: INC Form Builder
timestamp: 2023-06-01
description: A dynamic form builder built with the T3 Stack, allowing users to create forms, send invitations, and view responses.
codeLink: https://github.com/TimelesClock/INC-Form-Builder
demoLink: https://form.timeles.dev
---

This dynamic form builder was built with the T3 Stack (Create T3 App) and the following libraries:

- Next.js
- TypeScript
- tRPC
- Prisma
- TailwindCSS
- Next-auth (Authentication)
- S3 Bucket (File uploads)
- Zustand (For global state management)

The form builder allows users to create custom forms and send invitations to other users through emails. Currently, the invitation feature requires the email to be associated with a registered user. The invited user can then fill up the form, and the form owner can view the responses.