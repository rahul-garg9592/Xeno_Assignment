Mini CRM Platform  

A complete CRM platform built with **React.js frontend**, **Express.js backend**, **MongoDB database**, and **AI integration using Google's Gemini API**.  
This project enables customer management, AI-powered audience segmentation, campaign creation, and real-time analytics with secure authentication via Google OAuth.

---

## 🚀 Features
- **Customer Management**: Import, view, and manage customer data  
- **Audience Segmentation**: Create rule-based and AI-assisted customer segments  
- **Campaign Creation**: Build targeted marketing campaigns with AI message suggestions  
- **Campaign Delivery**: Simulate message delivery with real-time status tracking  
- **AI Integration**: Powered by Gemini 2.5 Flash for segment generation and message suggestions  
- **Google OAuth**: Secure authentication using Google accounts  
- **Real-time Analytics**: Campaign performance tracking and AI-generated summaries  

🛠 Tech Stack

### Frontend
- React.js (Vite)  
- Tailwind CSS  
- React Router  
- Axios for API calls  

### Backend
- Node.js with Express  
- MongoDB with Mongoose ODM  
- Passport.js for Google OAuth  
- Google Generative AI (Gemini)  
- JWT for session management 

## AI Tools & Other Tech Used

Gemini 2.5 Flash → AI-powered audience segmentation, message generation, and campaign summaries

MongoDB → Stores customers, segments, and campaigns

Passport.js + Google OAuth → Secure login with Google accounts

JWT → Session management and authentication

SMTP (Gmail) → Email delivery simulation

React + TailwindCSS → Modern UI framework with clean design

For local setup, create a `.env` file inside the **backend** folder and add the following variables:
# =========================
# MongoDB Connection
# =========================
MONGODB_URI=
# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
# Authentication
JWT_SECRET=
SESSION_SECRET=
# Gemini AI
GEMINI_API_KEY=
# Email (SMTP Settings)
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
EMAIL_FROM=
# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000

## Known Limitations / Assumptions

- **OAuth Only**: Currently supports only Google OAuth (no username/password login)  
- **AI Scope**: Gemini generates queries/messages but does not learn continuously from past campaigns  
- **Scaling**: Optimized for medium datasets; may need scaling strategies for very large audiences  
- **Email Delivery**: Relies on Gmail SMTP. Daily sending limits apply (typically ~500 emails/day for free accounts). For bulk campaigns, a dedicated email provider (SendGrid, SES, etc.) is needed  
- **Error Handling**: Basic error logging only. No retry mechanism or alerting system for failed emails  
- **Analytics**: Success rate only measures *sent vs failed*. Does not track opens, clicks, or conversions  
- **Segmentation**: Complex customer behavior analytics (like RFM scoring, churn prediction) not yet implemented  
- **Testing**: Limited automated test coverage for critical features like AI outputs and email delivery  
- **Offline Support**: Frontend requires a constant backend connection (no offline mode or caching)  
- **AI Cost Management**: Heavy usage of Gemini API may lead to increased costs. No quota/rate-limit safeguards included  



## 🏗 Architecture Diagram
mini-crm/
├── backend/                  # Express.js API server
│   ├── src/
│   │   ├── config/          # Database, OAuth, Gemini setup
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # API endpoints
│   │   ├── controllers/     # Business logic
│   │   ├── services/        # AI utilities, delivery simulation
│   │   ├── middlewares/     # Authentication, validation
│   │   └── app.js           # Express application
│   └── package.json
│
├── frontend/                # React.js application
│   ├── src/
│   │   ├── components/      # UI components
│   │   ├── pages/           # Application pages
│   │   ├── hooks/           # Custom React hooks
│   │   ├── lib/             # Utilities and API client
│   │   └── utils/           # Helper functions
│   └── package.json
│
└── README.md
