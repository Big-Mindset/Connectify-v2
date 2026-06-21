## How to Run the Project

This project is still under active development, so some components may be incomplete or subject to change.

### Prerequisites
Make sure you have the following installed:

- Node.js
- npm
- PostgreSQL
- A valid GitHub OAuth app
- A valid Google OAuth app
- SMTP credentials for email delivery
- Cloudinary credentials
- LiveKit credentials (optional)

---

### 1. Configure Environment Variables

Before running the project, create and fill in the required `.env` files for both the frontend and backend if needed.

#### Required environment variables

```env
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GITHUB_CLIENT_ID
GITHUB_CLIENT_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SMTP_HOST
SMTP_PORT
SMTP_USER
SMTP_PASS
BREVO_API_KEY
KEK_KEY
CLOUDINARY_SECRET
CLOUDINARY_API_KEY
CLOUDINARY_CLOUD
LIVEKIT_URL
LIVEKIT_API_KEY
LIVEKIT_API_SECRET
