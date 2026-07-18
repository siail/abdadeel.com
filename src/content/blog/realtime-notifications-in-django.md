---
author: Abdullah Adeel
pubDatetime: 2022-03-19T15:22:00Z
modDatetime: 2024-01-13T19:57:38Z
title: How to add real-time notifications with Django
slug: how-to-add-real-time-notifications-with-django
featured: true
draft: false
ogImage: /assets/blog/realtime-notifications-in-django.webp
tags:
  - django
  - python
  - nextjs
  - backend
description: How to add real-time notifications with Django and NextJS
conicalUrl: https://dev.to/abdadeel/how-to-add-real-time-notifications-with-django-and-nextjs-4p5e
---

![How to add real-time notifications with Django | abdadeel](@assets/blog/realtime-notifications-in-django.webp)

## Table of contents

## Introduction

**Django** to this day is a battle-tested web framework built with one of the most loved programming languages -  **Python**. Its feature-rich has built-in support for crucial and critical things like user authentication, security, a powerful ORM (Object Relational Mapper), a built-in admin panel, forms, and much more already built into the framework.

But if we go back to the initial days of Django, there was barely a concept of microservices and event-based architecture. Monolith stacks were popular with minor cheeky touches to keep the stack meet the complex requirements of the time.

But today, web apps are much more modularized. We have excellent frontend frameworks like **React, Vue, Svelte,** etc providing far better UI/UX than templates. The world has shrunk and everyone now wants real-time experience when it comes to web apps. No more refreshes. No nothing. **I want real-time changes!**

But Django was never built to handle the real-time side of things e.g websockets, polling, etc. No doubt we have solutions like **Django channels** along with technologies like **celery** to solve the problem. But that too comes with more problems like:

- **Complexity -** Django's slogan The web framework for perfectionists with deadlines becomes stale.
- **Scalability -** Scaling a real-time system is a challenge in itself. Combining it with having to build with tech that was not initially meant for it becomes super complex.

## 🎉 Let's Solve The Problem

In this article, I'll show you how you can add any sort of real-time functionality to your Django application while keeping the complexity and time to implementation minimal.
Here I'll use PubNub to add notification features to a basic social media application I built as a demo. If you want to have a look at the codebase, [here you go!](https://github.com/siail/django-pubnub-notifications) 👇

Live App 👇

https://django-pubnub.vercel.app

**PubNub** has been in the business for a really long time and their infrastructure is mature enough to handle a user base of any size you have and they have a very generous Free Tier 😉 as well. On top of that, you can either use their REST API for everything or use their SDKs. SDKs are available in pretty much all the server-side languages.

# Application Description

This is a basic social media application. User can signup using their email and passwords. Create/Edit their posts. Users can comment on posts. Whenever a new comment is created, a notification is sent to the post owner.

## 👩‍💻 Tech Stack

- Django (Web Server)
- Django REST framework (APIs)
- PostgreSQL
- PubNub (for real-time notifications)
- Nextjs (frontend)

![stack diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/jfh12xmucuwqn3t75j8q.png)

[Click to see the full diagram](https://www.figma.com/file/LWvD1zyBWEsMhJi9ZbjdAa/django-pubnub-infrastructure-diagram?node-id=0%3A1)

## Server Logic

On the server, I have created basic Post and Comment models in the `users/models.py` file. CRUD Rest APIs are handled using `django restframework` . Pretty basic route handlers using generic views and model serializer.

In `server/core/pubnub/pubnub_service.py`, I have created a basic utility class that exposes two basic functions from PubNub's python SDK. First, when the user logs in, a secret token has to be created for each user so that they can safely connect to PubNub. These authorization tokens make sure that only clients authorize to access a channel should allow reading messages from that channel.

```py

import logging

from django.conf import settings
from pubnub.models.consumer.v3.channel import Channel
from pubnub.pnconfiguration import PNConfiguration
from pubnub.pubnub import PubNub
from pubnub.exceptions import PubNubException

from users.models import User

logger = logging.getLogger(__name__)

pnconfig = PNConfiguration()

pnconfig.publish_key = settings.PUBNUB_PUBLISH_KEY
pnconfig.subscribe_key = settings.PUBNUB_SUBSCRIBE_KEY
pnconfig.secret_key = settings.PUBNUB_SECRET
pnconfig.uuid = settings.SERVER_PUBNUB_UUID

pubnub = PubNub(pnconfig)

class PubNubService:
    DEFAULT_NOTIFICATION_TTL = 60 # 60 minutes

    @staticmethod
    def get_notification_token_for_user(user: User, ttl: int = DEFAULT_NOTIFICATION_TTL):
        envalope = pubnub.grant_token() \
            .channels([Channel.id(user.get_notification_channel_name()).read().delete()]) \
            .ttl(ttl) \
            .authorized_uuid(user.get_notification_channel_name()) \
            .sync()
        token = envalope.result.token
        token_payload = pubnub.parse_token(token)

        return {
            "exp_timestamp": token_payload["timestamp"],
            "token": token,
            "ttl": token_payload["ttl"],
        }

    @staticmethod
    def send_notification_to_user(user: User, message):
        try:
            pubnub.publish() \
            .channel(user.get_notification_channel_name()) \
            .message(message) \
            .use_post(use_post=True) \
            .sync()
        except PubNubException as e:
            logger.error(e)

```

Here I am creating a PubNub `channel for each user`. The name of that channel is the `UUID` of the user identified by `custom get_notification_channel_name` . When the user logs into my Django application, only that user will be granted a token to access the notifications channel associated with their unique id. This way, each user gets notifications intended for them.

![pubnub channels descriptions diagram](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/7bzzmkhpws7gpnkxn2n8.png)

Channels are fundamentals of how PubNub works. Your application can create as many PubNub channels as it needs. In fact, whenever you specify a channel in your request, if it does not already exist, it will be created before placing the message in the channel.

**Django signals** are being used to detect comments save events and on successful comment save, a notification is sent to the user through the signal receiver function. It's that simple! Here is the simple receiver function.

```py

import logging
from uuid import uuid4

from .models import Comment
from django.db.models.signals import post_save
from django.dispatch.dispatcher import receiver
from core.pubnub.pubnub_service import PubNubService

logger = logging.getLogger(__name__)

@receiver(post_save, sender=Comment)
def create_comment_notification(sender, instance: Comment, created, **kwargs):
    post = instance.post
    author = post.author
    commenter = instance.user
    if created and author != commenter:
        message = {
            "message": f'{commenter.username} commented on your post.',
            "peek": f'{instance.text[0:10]}...',
            "id": str(uuid4())[0:8],
            "pid": str(post.id),
        },
        PubNubService.send_notification_to_user(user=author, message=message)
        logger.warn("Notification sent to user: %s", author.username)
```

# Conclusion

This approach is not just limited to sending notifications, you can extend it to complex features like real-time chats, likes, etc. You get the point. This offloads handling real-time connections to PubNub. In my opinion, the cost is pretty comparable as well. If you handle all of this yourself, your team has to code all the real-time connections stack which takes both time and resources. On top of that, now your team has to take care of testing, maintaining, and scaling another infrastructure which is going to take even more resources as well. But this post should give you a good idea of which route you want to go.

If you like what you just read, don't forget to follow me on **[Twitter 🐤](https://twitter.com/abdadeel_)**, **[LinkedIn](https://linkedin.com/)** and [Youtube](https://www.youtube.com/channel/UCPlrsCIGFBFduFgf_jm6zuQ). I share articles along with working examples and embeds so you can have a better reading/learning experience.
Here is the app link if you want to play with it.

👉 https://django-pubnub.vercel.app
