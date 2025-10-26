# 🛍️ YourChoiceMarket.com

> _AI-generated creativity meets real-world products._  
> Built for the **Google Cloud Run Hackathon**.

---

## 🌟 Overview

**YourChoiceMarket.com** is an AI-powered eCommerce platform that lets users turn their imagination into reality.  
Users can **enter a creative prompt**, and our system generates a **custom image** — powered by **Google AI Studio** and deployed on **Cloud Run** — which can then be printed on **mugs, t-shirts, posters, and more**.

Whether you want a “cat surfing on Mars” or “a minimalist quote about coffee,” YourChoiceMarket brings your ideas to life — and lets you buy them instantly.

---

## 🚀 Hackathon Category

**Category:** 🤖 **AI Studio**

- Uses **Google AI Studio** to generate product images via text prompts.
- Deployed entirely on **Google Cloud Run** as a scalable, serverless web app.
- Integrates with **Google Cloud Storage** for image persistence and **Firestore** for product and order data.

---

## 🧠 How It Works

### 1️⃣ Enter Your Prompt

Users type a text prompt describing their idea.

### 2️⃣ AI Image Generation

The prompt is sent to **Google AI Studio**, where a **Gemini / Imagen** model generates a high-quality product image.

### 3️⃣ Product Preview

The image is placed on a product template (e.g., mug, t-shirt, tote bag) in real time using a serverless backend hosted on **Cloud Run**.

### 4️⃣ Purchase & Fulfillment

Users can add the product to their cart and check out. Payment and fulfillment services integrate with **Stripe** and **Printful API** for real-world delivery.

---

## 🧩 Architecture Diagram
![Architecture Diagram]([./assets/architecture.png](https://raw.githubusercontent.com/hpharis258/llm.shop/refs/heads/main/Screenshot%202025-10-26%20at%2020.29.03.png?token=GHSAT0AAAAAADKCPYDXVN3MRMKAIQQVBTVA2H6QWAQ))
