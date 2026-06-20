<div align="center">

# 🚀 SortedWebs

> **The Personal Web Library & Curator.**  
> Save. Organize. Discover. Share.

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Firebase](https://img.shields.io/badge/firebase-%23039BE5.svg?style=for-the-badge&logo=firebase)](https://firebase.google.com/)
[![Firestore](https://img.shields.io/badge/Firestore-FFA000?style=for-the-badge&logo=firebase&logoColor=white)](https://firebase.google.com/products/firestore)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](https://choosealicense.com/licenses/mit/)
[![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/saurabhkun)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/saurabh-gandhi-1421b2318/)

<p align="center">
  <img src="./assets/banner.png" width="100%" alt="SortedWebs Banner">
</p>

</div>

---

## 📖 Overview

**The Problem:** We save hundreds of useful websites, articles, and tools every month - but when we actually need them, they are lost in chaotic browser bookmarks or scattered across dozens of different apps.

**The Solution:** SortedWebs helps you build a clean, intelligent personal web library. With smart categorization, curated stacks, and public collections, discovering and organizing knowledge has never felt this premium.

---

## 📚 Personal Library

Save websites instantly and organize them forever. Never lose a valuable link again.

<p align="center">
  <img src="./assets/Library.png" width="90%" alt="Library">
</p>

---

## ➕ Add Resources

Capture resources instantly. Add links with metadata, categories, and tags.

<p align="center">
  <img src="./assets/AddLink.png" width="90%" alt="Add Link">
</p>

---

## 🔍 Explore

Discover curated resources. Explore useful collections and stacks shared by the community.

<p align="center">
  <img src="./assets/Explore.png" width="90%" alt="Explore">
</p>

---

## 🗂️ Collections & Stacks

Build knowledge stacks. Group resources into focused collections tailored for developers, designers, and learners.

<p align="center">
  <img src="./assets/Stacks.png" width="90%" alt="Stacks">
</p>

---

## ⚙️ Core Capabilities

- **🧠 Smart Category Suggestions:** Automatically suggests relevant categories directly from URLs and website metadata, saving you time.
- **🔐 Authentication:** Rock-solid, secure Email + Password authentication powered entirely by Firebase.
- **☁️ Cloud Sync:** All of your data is securely stored and managed in Firestore, providing reliable long-term persistence.
- **⚡ Real-Time Updates:** Instant synchronization across all your sessions. What you save on one tab appears everywhere immediately.

---

## 🏗 Architecture

```text
User
 │
 ▼
React + TypeScript
 │
 ▼
Firebase Authentication
 │
 ▼
Firestore Database
 │
 ├── users/{uid}/links
 ├── users/{uid}/stacks
 └── publicStacks
```

---

## 🛠 Tech Stack

**Frontend:**
- ⚛️ [React](https://react.dev)
- 📘 [TypeScript](https://www.typescriptlang.org)
- ⚡ [Vite](https://vitejs.dev)
- 💅 [Tailwind CSS](https://tailwindcss.com)

**Backend:**
- 🔐 [Firebase Authentication](https://firebase.google.com/products/auth)
- 🗄️ [Firestore Database](https://firebase.google.com/products/firestore)

**Deployment:**
- 🚀 [Vercel](https://vercel.com)

---

## 📂 Project Structure

```text
sortedwebs/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   ├── hooks/              # Custom React hooks (auth, db interactions)
│   ├── lib/                # Config files (Firebase, curated datasets)
│   ├── pages/              # Application views (Dashboard, Explore, etc.)
│   ├── App.tsx             # Main router configuration
│   └── index.css           # Global Tailwind and base styles
├── firestore.rules         # Security rules for Firestore access
└── package.json            # Project dependencies and scripts
```

---

## 🚀 Getting Started

### Installation

Clone the repository and install the required dependencies:

```bash
git clone <repo>
cd sortedwebs
npm install
npm run dev
```

### Environment Variables

Create a `.env` file in the root of your project and populate it with your Firebase configuration:

```env
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

---

## 🔥 Curated Starter Stacks

Explore features pre-built curated bundles to get you started on day one:

- **Frontend Starter Pack:** Essential tools and resources for modern web development.
- **UI/UX Designer Kit:** Design inspiration, prototyping tools, and portfolio resources.
- **AI Productivity Stack:** The best AI tools for research, writing, coding, and discovery.
- **Competitive Programming Stack:** Practice platforms and references for interview prep.
- **Indie Hacker Stack:** Everything you need to build, ship, and monetize side projects.
- **Research Desk:** Useful research, paper discovery, and academic directories.

---

## 🗺 Roadmap

- [ ] **Browser Extension:** Save links directly from your browser.
- [ ] **Public Profiles:** Share your custom library with the world.
- [ ] **Team Collections:** Collaborative bookmarking for startups and teams.
- [ ] **AI Summaries:** Automated one-sentence summaries for saved articles.
- [ ] **Recommendation Engine:** Discover new content based on your library.
- [ ] **Mobile App:** Access SortedWebs seamlessly on iOS and Android.

---

## 🤝 Contributing

We love contributions! Whether it's adding new features, fixing bugs, or improving documentation, your help is welcome.

1. Fork the project.
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the Branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 👨‍💻 Author

Built with ❤️ by **Saurabh Gandhi**

- GitHub: https://github.com/saurabhkun
- LinkedIn: https://www.linkedin.com/in/saurabh-gandhi-1421b2318/
- Email: saurabhgandhi016@gmail.com

---

## 📬 Contact

GitHub: https://github.com/saurabhkun

LinkedIn: https://www.linkedin.com/in/saurabh-gandhi-1421b2318/

Email: saurabhgandhi016@gmail.com

---

## ⭐ Support

If you like the project, leave a star on GitHub. ⭐️
