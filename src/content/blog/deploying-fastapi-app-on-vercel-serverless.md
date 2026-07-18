---
author: Abdullah Adeel
pubDatetime: 2023-04-01T15:22:00Z
modDatetime: 2024-01-13T20:03:38Z
title: Deploying FastAPI app on Vercel Serverless
slug: deploying-fastapi-app-on-vercel-serverless
featured: true
draft: false
ogImage: /assets/blog/deploying-fastapi-app-on-vercel-serverless.webp
tags:
  - fastapi
  - vercel
description: In this article, I'll show you how to deploy a FastAPI app on Vercel Serverless.
conicalUrl: https://dev.to/abdadeel/deploying-fastapi-app-on-vercel-serverless-18b1
---

![Deploying FastAPI app on Vercel Serverless | abdadeel](@assets/blog/deploying-fastapi-app-on-vercel-serverless.webp)

## Table of contents

## Introduction

There are good chances that I don’t explain what is vercel if you’re a javascript developer but for python folks out there, vercel is a cloud computing platform focused on serverless hosting solutions for web applications. It’s especially popular among developers using frontend frameworks like Next.js, Nuxt.js, and SvelteKit.

This article aims to act as a quick guide if you want to deploy a FastAPI application serverless leveraging python runtime. Moreover, vercel is free so 🤞.

Primarily, you need these three files set up in your application.

- **_requirements.txt:_** This file will have all your dependencies. Run:  
  `pip freeze > requirements.txt` in your dev environment to get this file.
- **_vercel.json:_** This file contains information for vercel to set up your runtime when deploying.
- **_main.py:_** This python file can be named differently but it should contain the FastAPI app.

```py
# main.py
from fastapi import FastAPI

app = FastAPI() # This is what will be refrenced in config
```

Assuming the given file structure:

```
root_dir
|
|__ main.py
|__ requirements.txt
|__ vercel.json
```

add this in `vercel.json`

```json
{
  "builds": [
    {
      "src": "main.py",
      "use": "@vercel/python"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "main.py"
    }
  ]
}
```

If your application structure is different, change `build.src` and `routes.dest`to point to the python file containing the root application `app.`  
After your app is ready, push the source code to GitHub for seamless automatic future deployments with vercel.

Visit [vercel](https://vercel.com) and create an account if you don’t already have one.  
Create a new application and connect it to the appropriate GitHub repo.  
Additionally in the environment variable section, you might need to configure the port. Copy and paste `PORT=8000` in the key field. If you have other environment variables that your application expects like database config, feel free to add those here too.

Hit deploy and in moments, your API is up and running.

# **Demo Application**

[https://vercel-fastapi-deployment.vercel.app](https://vercel-fastapi-deployment.vercel.app/)

# Source Code

[https://github.com/siail/vercel-fastapi-deployment](https://github.com/siail/vercel-fastapi-deployment)

Until next time 👋.
