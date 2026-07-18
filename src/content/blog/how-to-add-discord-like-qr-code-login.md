---
author: Abdullah Adeel
pubDatetime: 2023-01-02T15:22:00Z
modDatetime: 2024-01-13T19:59:38Z
title: How to add Discord like QR Code Login
slug: how-to-add-discord-like-qr-code-login
featured: true
draft: false
ogImage: /assets/blog/how-to-add-discord-like-qr-code-login.webp
tags:
  - django
  - python
  - redis
  - nextjs
description: In this article, I'll show you my approach that I reverse-engineered to achieve discord like passwordless login experience in my application.
conicalUrl: https://dev.to/abdadeel/how-to-add-discord-like-qr-code-login-cn2
---

![Discord like passwordless login experience - reverse engineered | abdadeel](@assets/blog/how-to-add-discord-like-qr-code-login.webp)

## Table of contents

## Introduction

<div style="display:flex;align-items:center;justify-content:center;width:100%;overflow-x:auto">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8Pi5wp732Xw" frameborder="0" allowfullscreen></iframe>
</div>

We've all experienced the new form of logging into your account where you log in by scanning a QR code from a mobile app. The first time I interacted with it was with Discord. By now millions of people have been on this 👇 page to experience this amazing platform.

![PC: https://discord.com/login (discord login screen)](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lvc3jehirkq0h0oz4jz7.png)

Besides beautifully crafted graphics, you can observe a QR code that you can scan using the discord mobile app to log in instantly.
In this article, I'll show you my approach that I reverse-engineered to achieve the same login experience in my application.

## ❓ What we're going to build?

In this article, I'll explain my approach to adding a QR code login. The app built as a reference has two main screens. Let's briefly discuss what it does.
Suppose a user is logged in on Device A and wants to log in on Device B. On Device A, the user will navigate to the page to enter (for simplicity; since both clients are browser based) a code shown on Device B's login screen. On success, the user will be automatically logged in on Device B.

## 👩‍💻 What's the stack?

In this article, I am going to use the following stack but you should be able to mimic this approach with any backend and frontend technology out there.

### Backend

- Django
- Redis
- PostgreSQL

### Frontend

- Nextjs (React/Typescript)

##🎳 Architecture
To get better understanding of application architecture, visit [this](https://www.figma.com/file/ryqQbDKT2vUDalZcyyHFZQ/django-qr-code-login?t=fpG6kg3HxSq6ZJJY-1).

## 😺 GitHub Repo

The demo project source code can be found on GitHub
{% github https://github.com/siail/yt-django-qr-code-login %}

## 🎥 Video

Watch me build a complete demo application 👇

<div style="display:flex;align-items:center;justify-content:center;width:100%;overflow-x:auto">
<iframe width="560" height="315" src="https://www.youtube.com/embed/8Pi5wp732Xw" frameborder="0" allowfullscreen></iframe>
</div>
