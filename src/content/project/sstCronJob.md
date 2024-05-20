---
title: SST Scheduled Jobs
tags: [SST, AWS EventBridge, AWS Lambda, TypeScript]
images:
  - src: /images/sstscheduledjobs.png
    alt: SST Scheduled Jobs
timestamp: 2023-12-01
description: A proof of concept for scheduled email sending using SST as Infrastructure as Code (IaC) and AWS EventBridge for scheduling.
demoLink: https://cron.timeles.dev
---

For our IMCS toolkit project, my friend and I developed a proof of concept for scheduled email sending using SST as Infrastructure as Code (IaC) and AWS EventBridge for scheduling. The solution leverages AWS Lambda functions to handle the email sending logic, while SST simplifies the infrastructure setup and management. This approach allows for easy configuration and reliable execution of scheduled tasks within the project.