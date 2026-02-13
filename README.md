
<div align="center">

  <h1 style="font-size: 3rem; font-weight: bold; background: -webkit-linear-gradient(45deg, #FFD700, #DAA520); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">Community Connect Hub</h1>

  <h3>✨ Connect. Grow. Thrive. ✨</h3>

  <p>
    A next-generation community platform built for seamless interaction, professional networking, and resource sharing.
    Experience a modern, immersive interface designed to bring people together.
  </p>

  <p align="center">
    <a href="#features">Features</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#getting-started">Getting Started</a> •
    <a href="#contributing">Contributing</a>
  </p>

  ![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)
  ![React](https://img.shields.io/badge/react-18.3.1-61DAFB.svg?style=flat-square&logo=react&logoColor=black)
  ![TypeScript](https://img.shields.io/badge/typescript-5.8.3-3178C6.svg?style=flat-square&logo=typescript&logoColor=white)
  ![Vite](https://img.shields.io/badge/vite-4.5.3-646CFF.svg?style=flat-square&logo=vite&logoColor=white)
  ![TailwindCSS](https://img.shields.io/badge/tailwindcss-3.4.17-38B2AC.svg?style=flat-square&logo=tailwind-css&logoColor=white)
  ![Supabase](https://img.shields.io/badge/supabase-backend-3ECF8E.svg?style=flat-square&logo=supabase&logoColor=white)

</div>

---

## 🌟 Overview

**Community Connect Hub** is a robust web application designed to foster community engagement. Whether you are looking for job opportunities, local events, or just a place to chat with like-minded individuals, this platform has it all. Built with a focus on **immersive design** and **user experience**, it features a sleek glassmorphism UI, smooth animations, and a secure, role-based environment.

---

## 🚀 Key Features

| Feature | Description |
| :--- | :--- |
| **🔐 Role-Based Access Control** | granular permissions for **Super Admin**, **Content Admin**, and **Moderation Admin**. Secure and scalable. |
| **🗣️ Real-time Chat** | Engage in public channels or private DMs. Includes **file sharing**, message deletion, and rich media support. |
| **📅 Event Management** | Discover and manage local events. Admins can approve and feature community gatherings. |
| **💼 Job Portal** | A dedicated space for career growth. **Salary and Location** details are protected and visible only to authenticated members. |
| **📰 News & Articles** | Stay updated with the latest community news. Rich text content delivery. |
| **🌍 Bilingual Support** | Fully localized for **English** and **Hindi** speakers, ensuring wider accessibility. |
| **🎨 Immersive UI** | Powered by `framer-motion` and `shadcn/ui` for a premium, responsive feel. |

---

## 🛠️ Tech Stack

<div align="center">

| Frontend | Backend | Tools & Utilities |
| :---: | :---: | :---: |
| ![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB) | ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white) | ![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white) |
| ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white) | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white) | ![Git](https://img.shields.io/badge/Git-F05032?style=for-the-badge&logo=git&logoColor=white) |
| ![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white) | | ![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white) |
| ![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white) | | ![npm](https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white) |

</div>

---

## ⚡ Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/community-connect-hub.git
    cd community-connect-hub
    ```

2.  **Install dependencies**
    ```bash
    npm install
    # or
    yarn install
    ```

3.  **Set up Environment Variables**
    Create a `.env` file in the root directory and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server**
    ```bash
    npm run dev
    ```

5.  **Open your browser**
    Navigate to `http://localhost:8080` to view the app.

---

## 📂 Project Structure

<details>
<summary>Click to view directory structure</summary>

```
src/
├── components/        # Reusable UI components
│   ├── admin/         # Admin dashboard components
│   ├── layout/        # Layout wrappers (Navbar, Footer)
│   ├── shared/        # Shared utilities (ProtectedRoute, etc.)
│   └── ui/            # Shadcn UI primitives
├── contexts/          # React Contexts (Auth, Theme)
├── hooks/             # Custom React Hooks
├── pages/             # Route pages (Index, Login, Chat, etc.)
├── integrations/      # Third-party integrations (Supabase)
└── App.tsx            # Main application entry
```

</details>

---

## 🤝 Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

---

<div align="center">

  <h3>Built with ❤️ by the Community Connect Team</h3>

  <p>
    Questions? Reach out to us or open an issue!
  </p>

</div>
