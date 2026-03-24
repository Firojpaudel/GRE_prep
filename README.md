# GRE Prep Resources Compilation

A minimalist, comprehensive GRE prep platform offering curated free resources, study strategies, gamified multiple-choice vocabulary assessments, and dynamic progress tracking. Built with the "European editorial minimalism" aesthetic in mind.

## 🚀 Features

- **Resource Dashboard:** Hand-picked free resources across Quant, Verbal, and AWA.
- **Vocab Arena:** Gamified vocabulary assessments powered by dynamic multiple-choice generation. Tracks scores and longest streaks.
- **Study Planners:** 30, 60, and 90-day study timelines utilizing scientifically proven repetition models.
- **Methodologies:** Concrete action plans for conquering the GRE systematically.
- **Stateless Authentication:** JWT-based user authentication system utilizing Email, Username, and Password (no third-party SSO required).
- **Global Dark Mode:** Seamless switching between deep minimal dark mode and crisp light mode.

## 🛠 Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS v4, React Router v7, Lucide Icons.
- **Backend:** Node.js, Express.js.
- **Database:** [Neon Serverless PostgreSQL](https://neon.tech/).
- **Authentication:** `bcryptjs` for secure password hashing, `jsonwebtoken` for robust stateless sessions.

## ⚙️ Setup Instructions

### 1. Database Setup (Neon PostgreSQL)
1. Create a free account and project on [Neon.tech](https://neon.tech).
2. Obtain your Postgres connection string from the dashboard.
3. Open the Neon SQL Editor for your project and instantiate the user table:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    high_score INT DEFAULT 0,
    longest_streak INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. Environment Variables (.env)
Create a `.env` file in the **root** of the directory (where this `README.md` is located) and insert your database string and a secret key for JWTs:

```env
# Create a free project on https://neon.tech and paste the Postgres connection string here
NEON_DATABASE_URL="postgresql://neondb_owner:YOUR_PASSWORD_HERE@ep-blue-flower-ankcdxyw-pooler.c-6.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# Generate a random string for your JSON Web Tokens
JWT_SECRET="super_secret_dev_key_change_in_production"
```

*(Note: The backend looks for variables in process.env, so depending on your runner you may need to ensure your `.env` is loaded, or place a `.env` block explicitly inside `/backend`.)*

### 3. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Express server (Defaults to `http://localhost:3001`):
   ```bash
   node server.js
   ```

### 4. Frontend Setup
1. Open a new terminal and navigate to the root directory.
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```

## 🧹 Project Structure

- `/src`: Everything related to the React/Vite frontend (components, pages, styles).
- `/backend`: The Express server and Database connection handlers.
- `/scripts`: Utility background scripts (e.g., pulling Datamuse API synonyms).

## Deploying
The frontend is optimized for deployment on Vercel or Netlify via `npm run build`. The Node backend can be natively deployed on Render, Heroku, or directly onto an EC2/Droplet instance.
