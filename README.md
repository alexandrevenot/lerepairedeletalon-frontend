# Le Repaire de l'Étalon — Frontend

![Angular](https://img.shields.io/badge/angular-15-red)
![License](https://img.shields.io/badge/license-MIT-lightgrey)

Frontend for **Le Repaire de l'Étalon**, an online platform operating in the equine industry by connecting stallion owners with mare owners for breeding services.

> Previously a business attempt, I am now using this project as a showcase of my computer science engineering skills. The REST API backend is available at [lerepairedeletalon-backend](https://github.com/alexandrevenot/lerepairedeletalon-backend).

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)


---

## Overview

Single-page application built with Angular 15, featuring:
- Stallion search with various filters (breed, price, height, geolocation)
- Stallion profiles with photo galleries
- Cover (breeding) lifecycle, from request to payment
- Online contracts signature integration
- Stripe Connect payment integration
- User dashboard (account, stallions, covers, favorites, reviews)
- SEO optimization via Angular router and meta tags

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 15 |
| Language | TypeScript 4.9 |
| CSS Framework | Bulma 1.0 |
| Icons | FontAwesome 6.4 (CDN) |
| Payments | Stripe.js |
| HTTP | Angular HttpClient |
| Routing | Angular Router |
| Server | nginx (alpine) |

---

## Project Structure

```
client/
├── src/
│   ├── app/
│   │   ├── core/                   # Singleton services
│   │   │   ├── auth/               # JWT handling and session management
│   │   │   ├── cookies/            # Cookie utilities
│   │   │   ├── http-interceptors/  # Auth header injection
│   │   │   ├── pricing/            # Price calculation helpers
│   │   │   ├── geolocation/        # Browser geolocation
│   │   │   ├── seo/                # Meta tags management
│   │   │   └── user-score/         # User rating service
│   │   ├── features/               # Feature modules
│   │   │   ├── authentication/     # Login and register
│   │   │   ├── dashboard/          # Authenticated user area
│   │   │   │   ├── my-account/     # Profile and legal identity
│   │   │   │   ├── my-stallions/   # Stallion management
│   │   │   │   ├── my-covers/      # Cover request tracking
│   │   │   │   ├── favorite-stallions/
│   │   │   │   └── reviews/
│   │   │   ├── search/             # Stallion search and profiles
│   │   │   │   ├── filters/
│   │   │   │   ├── stallion-panel/
│   │   │   │   └── stallion-profile/
│   │   │   └── mail-links/         # Email verification and password reset
│   │   ├── layout/                 # Shared UI
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   └── static-pages/       # CGU, CGV, mentions légales
│   │   └── styles/
│   │       └── bulma-custom/       # Bulma SCSS overrides
│   ├── environments/
│   │   ├── environment.ts          # Dev config
│   │   └── environment.prod.ts     # Prod config (API URL, Stripe public key)
│   └── assets/
│       └── logo/
├── nginx.conf                      # nginx SPA routing config
├── Dockerfile                      # Multi-stage: node builder + nginx runtime
├── angular.json
├── package.json
└── tsconfig.json
```

---