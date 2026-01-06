# Smart Daycare Management System

A unified Smart Daycare Management and Parent Monitoring System that combines features from three separate projects into a single, comprehensive application.

## Features

### Core Management (Module 1 & 2)
- **Authentication & Authorization**: User registration, login, and role-based access control
- **Child Management**: Register, view, update, and manage child profiles
- **User Management**: Manage parents, staff, and admin users
- **Staff Activities**: Track staff activities and assignments

### Activity Management & Communication (Module 3)
- **Activity Management**: Create and track daily activities (meals, naps, activities, updates) with photo uploads
- **Parent Notifications**: Real-time notifications for parents about their children's activities
- **Parent-Staff Chat**: Real-time messaging between parents and staff using Socket.io

### Billing & Analytics (Module 4)
- **Billing & Invoicing**: Generate monthly invoices based on attendance
- **Payment Tracking**: Track payment status and manage invoices
- **Analytics Dashboard**: View occupancy rates, staff workload, revenue, and resource usage

## Project Structure

```
merged-project/
├── backend/
│   ├── config/
│   │   ├── db.js          # MongoDB connection
│   │   └── upload.js      # File upload configuration
│   ├── controllers/       # Business logic controllers
│   ├── middleware/
│   │   └── auth.js        # Authentication middleware
│   ├── models/           # MongoDB models
│   ├── routes/           # API routes
│   ├── uploads/          # Uploaded files directory
│   ├── server.js         # Main server file
│   └── package.json
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/   # React components
    │   ├── pages/        # Page components
    │   ├── context/     # React context (Auth)
    │   ├── utils/        # Utility functions
    │   ├── App.js        # Main App component
    │   └── index.js      # Entry point
    └── package.json
```

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd merged-project/backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string and JWT secret:
```
MONGO_URI=mongodb://localhost:27017/smartdaycare
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=30d
PORT=5000
FRONTEND_URL=http://localhost:3000
```

5. Start the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd merged-project/frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Children
- `GET /api/children` - Get all children for logged-in parent
- `POST /api/children` - Register a new child
- `GET /api/children/:id` - Get child by ID
- `PUT /api/children/:id` - Update child
- `DELETE /api/children/:id` - Delete child

### Activities
- `POST /api/activities` - Create activity (with photo upload)
- `GET /api/activities/staff/:staffId` - Get activities by staff
- `GET /api/activities/parent/:childId` - Get activities by child
- `GET /api/activities/summary/:childId` - Get daily summary

### Notifications
- `GET /api/notifications/parent/:parentId` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications` - Create notification

### Chat
- `POST /api/chats` - Create chat
- `GET /api/chats/user/:userId` - Get user chats
- `GET /api/chats/:chatId/messages` - Get messages
- `POST /api/chats/messages` - Send message

### Billing
- `POST /api/billing/generate/:year/:month` - Generate invoices
- `GET /api/billing/invoices` - List invoices
- `PATCH /api/billing/invoices/:id/pay` - Mark invoice as paid

### Analytics
- `GET /api/analytics/summary` - Get analytics summary

## Technologies Used

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- Socket.io (for real-time chat)
- JWT for authentication
- Multer for file uploads

### Frontend
- React
- React Router
- Axios
- Socket.io Client
- Tailwind CSS
- Context API for state management

## User Roles

1. **Parent**: Can view their children's activities, receive notifications, chat with staff
2. **Staff**: Can create activities, send notifications, chat with parents
3. **Admin**: Full access including billing, analytics, and user management

## Notes

- The project uses JWT tokens for authentication
- File uploads are stored in the `backend/uploads` directory
- Real-time chat uses Socket.io for instant messaging
- All routes are protected except login and register
- The system supports role-based access control

## License

ISC
