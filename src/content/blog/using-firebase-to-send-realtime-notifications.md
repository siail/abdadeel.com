---
author: Abdullah Adeel
pubDatetime: 2022-08-12T15:22:00Z
modDatetime: 2024-01-13T19:58:38Z
title: Using Firebase to send real-time notifications in Django apps
slug: using-firebase-to-send-realtime-notifications-in-django-apps
featured: true
draft: false
ogImage: /assets/blog/using-firebase-to-send-realtime-notifications.webp
tags:
  - django
  - python
  - nextjs
  - firebase
description: In this article, I'll show you how you can add any sort of real-time functionality to your Django application while keeping the complexity and time to implementation minimal.
conicalUrl: https://dev.to/abdadeel/using-firebase-to-send-real-time-notifications-in-django-apps-121h
---

![How to add real-time notifications in Django applications | abdadeel](@assets/blog/using-firebase-to-send-realtime-notifications.webp)

## Table of contents

## Introduction

Recently, I have been exploring quite a few ways to add real-time functionality in Django applications. During my hunt, I came across many third-party services like PubNub, Pusher, and now Firebase which I think is the most exciting of all.

Following are the rubrics that I standardized during my decision and comparison to even custom solutions like django channels. Let's see how firebase fits these points.

- **Scalability**: Firebase real-time database and firestore, both can scale automatically.
- **Security**:  Firebase has security rules that can be set precisely to resource authorization and setting those up takes just a few minutes. So, thumbs up for that.
- **Time to implementation**:  Firebase admin SDKs are well documented and are available for almost all server-side languages. So you can add real-time features in minutes.
- **Maintainability**: With firebase, there is absolutely no maintenance except for some security rules that you might want to tweak as you add new features.
- **Cost**:  This can be a crucial factor and may vary from team to team or even from one project to another. Firebase has a generous free tier and pay-as-you-go plans available.

## 🚀 Let's Build A Demo Django App

In this article, I will guide you through all the steps you need to follow to successfully leverage firebase firestore to securely send real-time notifications to users in your django applications.
During my testing, I have built a demo application that you can refer to any time you find yourself lost.
Here is the Github 😸 link 👇

https://github.com/siail/django-firebase-notifications

Here is the live app 👇

https://django-firebase.vercel.app

## Server Logic

The first problem that you might face when trying to implement firebase with your django application is authentication. Your users are currently being authenticated by your django application, how you would pass that auth state to firebase so it knows about the user?
To solve this, the solution is custom tokens. When the client successfully login with you django app, firebase admin SDK can be used to create a token for the client. The client will use this token to connect to firebase.
Here is how the flow goes.

![Flow chart for auth](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/lkcqvm0pisf44v2nkx4k.png)

[See the full diagram here](https://www.figma.com/file/Z0RZCU5AMnexggcc5Svzh0/django-firebase-notification-infra?node-id=1%3A2)

Let's start with the user login. They put in their credentials to log into the frontend application. The client sends the credentials i-e username/email and password to the backend to exchange for a token(JWT or simple token).
The actual auth implementation might vary from application to application but in my demo, I am using DRF token base authentication. On successful login, the server generates two tokens as seen in the flow chart above.

- "**token**" - This token will be used by the client to authenticate with django server for future requests.
- "**firebase_token**" - This token will be used by the client to immediately authenticate with firebase automatically.

### Sending the Notification

Let's go through the setup.

Here I assume that you have a firebase account which you do if you have a google account. To send notifications from django application, we are going to use **firestore**. If you have not already set up a firebase project or firestore, I would recommend going through[this quickstart guide](https://firebase.google.com/docs/firestore/quickstart).

To communicate with firebase through admin SDK, you need service account credentials. To generate service account creds, go to the **Service account** in your firebase project console. Make sure you have selected the right project. Follow the following 👇

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/zqqzcc0rdujqik1fane2.png)

On success, you will have a `.json` file downloaded. Let's rename that file to `credentials.json` . Make sure to keep this file safe since the credentials in this file allow access to all firebase resources.

### Set up admin SDK instance

Run the following pip command to install firebase SDK in your django project.

```sh
pip install firebase-admin
```

Then initialize the admin app instance providing the path to the credential.json file. If this file is in your project directory. Make sure to add `credentials.json` to your `.gitignore` file.
In my case, I created a helper class `FirebaseService` in `core/firebase/firebase_service.py` to handle all of the firebase-related logic.

```py
import logging
from typing import Any, Dict
from uuid import uuid4
from django.conf import settings
from django.core.cache import cache

import firebase_admin
from firebase_admin import credentials, auth, firestore

from users.models import User

cred = credentials.Certificate(settings.GOOGLE_APPLICATION_CREDENTIALS) # path to credentials.json file

firebase_app = firebase_admin.initialize_app(cred)
auth_client = auth.Client(app=firebase_app)
firestore_client = firestore.client(app=firebase_app)

logger = logging.getLogger(__name__)


def cached(func):
    def wrapper(*args, **kwargs):
        user = kwargs.get('user')
        key = 'token_' + str(user.id)
        token = cache.get(key)
        if token is None:
            token = func(*args, **kwargs)
            cache.set(key, token, timeout=60 * 60) # 1 hour
        return token

    return wrapper

class FirebaseService:
  @staticmethod
  @cached
  def get_custom_token_for_user(user: User):
    auth_claims = {
      'uid': user.id,
    }
    return auth_client.create_custom_token(uid=user.id, developer_claims=auth_claims)

  @staticmethod
  def send_notification_to_user(user: User, message: Dict[str, Any]):
    msg_id = str(uuid4())
    notification_ref = firestore_client.collection(u'app-notifications') \
      .document(u'{}'.format(user.id)).collection("user-notifications").document(u'{}'.format(msg_id))

    notification_ref.set({
      u'message': message,
      'id': msg_id
    })
    logger.info(u'Notification sent to user {}'.format(user.id))

```

Here I am loading the `GOOGLE_APPLICATION_CRENDITALS` which is the path to the `credentials.json` file from the django settings. And in my `settings.py` file, I am loading the same variable from the environment using django-environ. You can have a look at that [here](https://github.com/siail/django-firebase-notifications/blob/54c0fef1de70d6c8ab1fe73d0504a1a9f8ae3ba1/server/djnotification/settings.py#L165).

- `get_custom_token_for_user method` is responsible for creating tokens for a given django user. This token is then sent to the client to be used to authenticate with firebase. `create_custom_token` from firebase admin takes `developer_claims` argument. Whatever you passed here will be stored in the payload of the token. Not just that, this object/dict will be available in the firebase request.auth object. This means you can access this object on the client and even in the firebase security rules.

- `send_notification_to_user` method is used to send notifications by creating a new document in the firestore in a specific collection identified as `app-notifications/{user_id}/user-notifications` . The store structure is specifically chosen as it allows for the creation of security rules on this collection and only allows the user `user_id` to access the `user-notifications` collection.
  Here is the simplified flow.

![Image description](https://dev-to-uploads.s3.amazonaws.com/uploads/articles/v5ff388kfaiqh8w25qth.png)

Here is the firestore rule definition if you're interested.

```js
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match/app-notifications/{user_id}/{document=**} {
      allow delete, read: if
          request.auth.uid == user_id
    }
  }
}
```

## Client Side Logic

On the client, install firebase.

```
yarn add firebase
# or
npm install firebase
# or
pnpm add firebase
```

Then in [`./firebase/index.ts`](https://github.com/siail/django-firebase-notifications/blob/master/client/firebase/index.ts) , I am using the credentials to initialize the firebase app and use it across the application.

```tsx
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FB_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FB_MSG_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FB_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const firestore = getFirestore(app);
export const auth = getAuth(app);
```

Then in my authentication logic, on successful login/signup I am automatically signing the user in with firebase using the token received from the django server.
[See here for details](https://github.com/siail/django-firebase-notifications/blob/54c0fef1de70d6c8ab1fe73d0504a1a9f8ae3ba1/client/context/TokenAuthContext.tsx#L221-L223)

```tsx
import { auth as firebaseAuth } from "./firebase";

const initializeFirebaseAuth = async (user: MeResponse) => {
  return signInWithCustomToken(firebaseAuth, user.fb_token);
};
```

To display notifications on the UI, I create a custom hook that subscribes to the appropriate channel to receive notifications for the currently logged-in user.

```tsx
import React, { createContext, useEffect, useState, useContext } from "react";
import { doc, onSnapshot, deleteDoc, collection } from "firebase/firestore";
import { firestore } from "../firebase";
import { useAuth } from "../hooks/useAuth";

interface NotificationPayload {
  message: string;
  id: string;
}

interface NotificationState {
  messages: NotificationPayload[];
  unreadCount: number;
  resetUnreadCount: () => void;
  markAllAsRead: () => void;
  markOneMessageAsRead: (id: string) => void;
}

export const NotificationsContext = createContext<NotificationState>({
  messages: [],
  unreadCount: 0,
  resetUnreadCount: () => {},
  markAllAsRead: () => {},
  markOneMessageAsRead: () => {},
});

export const NotificationProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [messages, setMessages] = useState<NotificationPayload[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    let unsubscribe: () => void;
    if (isAuthenticated && user?.user) {
      unsubscribe = onSnapshot(
        collection(
          firestore,
          "app-notifications",
          user.user.id,
          "user-notifications"
        ),
        snapshot => {
          const messages = snapshot.docs.map(doc => ({
            message: doc.data().message,
            id: doc.id,
          }));
          setMessages(messages);
          setUnreadCount(prev => (messages.length ? prev + 1 : 0));
        }
      );
    }
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [isAuthenticated, user]);

  const resetUnreadCount = () => setUnreadCount(0);

  const markAllAsRead = async () => {
    if (isAuthenticated && user?.user) {
      await Promise.all(
        messages.map(async msg => {
          await deleteDoc(
            doc(
              firestore,
              "app-notifications",
              user.user.id,
              "user-notifications",
              msg.id
            )
          );
        })
      );
      setMessages([]);
    }
  };

  const markOneMessageAsRead = async (id: string) => {
    if (isAuthenticated && user?.user) {
      await deleteDoc(
        doc(
          firestore,
          "app-notifications",
          user.user.id,
          "user-notifications",
          id
        )
      );
    }
    setMessages(messages.filter(msg => msg.id !== id));
  };

  return (
    <NotificationsContext.Provider
      value={{
        messages,
        unreadCount,
        resetUnreadCount,
        markAllAsRead,
        markOneMessageAsRead,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useFirebaseNotifiactions = useContext(NotificationsContext);
```

## Conclusion

Exploring this new way of implementing real-time features was exciting and its no doubt one of the best options when it comes to critical factors like scalability, maintainability, and time to implementation.
If you want to test it, here is the live demo👇

https://django-firebase.vercel.app

If you like what you just read, why not throw a follow on [Twitter abdadeel\_](https://twitter.com/abdadeel_)

Thanks 👋
