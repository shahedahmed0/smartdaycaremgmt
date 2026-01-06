# 📚 Smart Daycare - Complete Feature Access Guide

This guide explains how to access all features in the Smart Daycare Management System based on the PDF requirements.

## 🚀 Getting Started

### 1. Start the Application

**Backend:**
```bash
cd merged-project/backend
npm install
npm start
```
Backend runs on: `http://localhost:5000`

**Frontend:**
```bash
cd merged-project/frontend
npm install
npm start
```
Frontend runs on: `http://localhost:3000`

---

## 👤 User Roles & Access

The system has **3 user roles**:
1. **Parent** - View children's activities, notifications, chat
2. **Staff** - Create activities, manage children, chat
3. **Admin** - Full system access, billing, analytics, user management

---

## 🔐 Authentication Features

### Access Login Page
- **URL:** `http://localhost:3000/login`
- **Features:**
  - Email/Password login
  - Automatic redirect to role-specific dashboard after login
  - Link to registration page

### Access Registration Page
- **URL:** `http://localhost:3000/register`
- **Features:**
  - Parent account registration
  - Name, Email, Phone, Password fields
  - Automatic redirect to dashboard after registration

---

## 👨‍👩‍👧 PARENT DASHBOARD Features

### Access Parent Dashboard
- **URL:** `http://localhost:3000/dashboard`
- **Login as:** Parent role user

### Features Available:

#### 1. **Child Management**
   - **Location:** Main dashboard page
   - **Actions:**
     - View all registered children
     - Click "➕ Register New Child" to add a child
     - Click on a child card to view their activities
   - **Child Registration Form:**
     - Name, Age, Date of Birth
     - Medical Information
     - Emergency Contacts
     - Photo upload

#### 2. **View Daily Activities**
   - **Location:** Dashboard (after selecting a child)
   - **Features:**
     - View all activities for selected child
     - Filter by activity type:
       - 🍽️ Meals
       - 😴 Naps
       - 🎨 Activities
       - 📝 Updates
     - View activity photos
     - See activity details (time, staff, description)

#### 2a. **Daily Reports** ⭐ NEW (Module 3 Feature 4)
   - **Location:** Dashboard → Click "📄 View Daily Report" button when viewing a child
   - **Direct URL:** `/reports/daily/:childId`
   - **Features:**
     - Comprehensive daily activity summary
     - Attendance information (check-in/check-out times)
     - Meal breakdown with food items and quantities
     - Nap summary with duration and mood
     - Activity timeline with photos
     - Photo gallery for the day
     - Date selection for historical reports
     - Staff member information for each activity

#### 3. **Today's Summary**
   - **Location:** Dashboard (summary cards section)
   - **Shows:**
     - Total activities today
     - Number of meals
     - Number of naps
     - Number of photos uploaded
   - **Updates:** Every 30 seconds automatically

#### 4. **Notifications**
   - **Access Methods:**
     - **Notification Bell Icon** (top right) - Shows unread count
     - **🔔 Notifications Button** (header) - Full notifications page
     - **Direct URL:** `http://localhost:3000/notifications`
   - **Features:**
     - View all notifications
     - Filter by type (activity, emergency, pickup, etc.)
     - Mark as read
     - Mark all as read
     - Delete notifications
     - View notification statistics

#### 5. **Chat with Staff**
   - **Access Methods:**
     - **Chat Button** (floating button, bottom right) - Quick access
     - **💬 Chat Button** (header) - Full chat page
     - **Direct URL:** `http://localhost:3000/chat`
   - **Features:**
     - View all active chats
     - Start new chat with staff members
     - Send/receive real-time messages
     - See typing indicators
     - View online/offline status
     - Delete chats

#### 6. **Logout**
   - **Location:** Header (top right)
   - **Action:** Logs out and redirects to login page

---

## 👨‍🏫 STAFF DASHBOARD Features

### Access Staff Dashboard
- **URL:** `http://localhost:3000/staff`
- **Login as:** Staff role user (caregiver, teacher, or cook)

### Features Available:

#### 1. **Child Selection**
   - **Location:** Top of dashboard
   - **Shows:** Only children assigned to you (by admin)
   - **Action:** Select a child to create activities for them

#### 2. **Attendance Management** ⭐ NEW
   - **Location:** Below child selection
   - **Features:**
     - **Check-In:** Mark child as present for the day
     - **Check-Out:** Mark child as leaving (with optional details)
     - **Status Display:** See if child is checked in/out
     - **Check-Out Details:**
       - Add extra service charges
       - Mark meals served (breakfast, lunch, snack, dinner)
     - **Real-time Status:** View current attendance status
   - **Purpose:** Tracks daily attendance for billing and analytics

#### 3. **Create Activity Log**
   - **Location:** Main form section
   - **Activity Types:**
     - 📝 General Update
     - 🍽️ Meal (with meal type, food items, quantity)
     - 😴 Nap (with duration, mood)
     - 🎨 Activity (with activity type)
   - **Features:**
     - Add title and description
     - Upload multiple photos
     - Add specific details based on activity type
     - Submit to create activity

#### 4. **Quick Activity Logging**
   - **Location:** Below activity form
   - **Quick Buttons:** (Role-specific)
     - **Caregiver:** Feeding, Diaper Change, Nap Supervision, Playtime, etc.
     - **Teacher:** Story Time, Art & Craft, Circle Time, Learning Activity, etc.
     - **Cook:** Breakfast Preparation, Lunch Cooking, Snack Preparation, etc.
   - **Action:** Click any button to instantly log that activity

#### 5. **Activity History**
   - **Location:** Bottom of dashboard
   - **Shows:** All activities you've created
   - **Features:**
     - View activity cards with photos
     - See activity details
     - Filter by activity type

#### 6. **Staff Profile Management** ⭐ NEW
   - **Access:** Staff Dashboard → Click "👤 My Profile" button in header
   - **Direct URL:** `/staff/profile`
   - **Features:**
     - **View Profile:**
       - Personal information (name, email, phone, address)
       - Role and staff type
       - Bio and professional information
       - Qualifications and certifications
       - Experience and joining date
       - Emergency contact information
       - Profile photo
       - List of assigned children
     - **Edit Profile:**
       - Update personal information
       - Add/edit bio (max 500 characters)
       - Add/remove qualifications
       - Add/remove certifications
       - Update experience and joining date
       - Update emergency contact
       - Upload/change profile photo
     - **Profile Photo:**
       - Upload profile picture
       - Change existing photo
       - Default avatar if no photo

#### 7. **Emergency Alert**
   - **Location:** Next to activity form
   - **Action:** Click "Emergency Alert" button
   - **Features:**
     - Send urgent notification to parent
     - Add emergency details
     - Immediate parent notification

#### 7. **Pickup Reminder**
   - **Location:** Next to activity form
   - **Action:** Click "Pickup Reminder" button
   - **Features:**
     - Send pickup reminder to parent
     - Set pickup time
     - Parent receives notification

#### 8. **Chat with Parents**
   - **Access:** Same as Parent (Chat button or `/chat` URL)
   - **Features:**
     - Chat with parents
     - Real-time messaging
     - View all parent chats

#### 8. **Notifications**
   - **Access:** Same as Parent (Notification bell or `/notifications` URL)
   - **Features:**
     - View notifications sent to parents
     - Manage notification history

---

## 👨‍💼 ADMIN DASHBOARD Features

### Access Admin Dashboard
- **URL:** `http://localhost:3000/admin`
- **Login as:** Admin role user

### Features Available:

#### 1. **Staff Management**
   - **Location:** Left section of dashboard
   - **Features:**
     - **Add Staff:**
       - Name, Email, Phone
       - Staff Role (Caregiver, Teacher, Cook)
       - Experience (years)
       - Joining Date
       - System generates temporary password
     - **View Staff List:**
       - Search by name, email, phone
       - Filter by role
       - View staff details
       - Delete staff members
     - **Statistics:**
       - Total Staff count
       - Caregivers count
       - Teachers count
       - Cooks count

#### 2. **Children Management**
   - **Location:** Middle section of dashboard
   - **Features:**
     - View all registered children
     - Search children
     - View child details
     - See assigned caregiver for each child

#### 3. **Caregiver Assignment**
   - **Location:** Children Management section
   - **Features:**
     - Assign caregiver to child
     - Change caregiver assignment
     - Remove caregiver assignment
     - Dropdown shows all available caregivers

#### 4. **Staff Activity Records**
   - **Location:** Right section of dashboard
   - **Features:**
     - View all staff activity logs
     - Filter by staff member
     - Filter by activity type
     - View activity timestamps
     - See which staff member logged what activity

#### 5. **Billing & Invoicing**
   - **Access Methods:**
     - **Direct URL:** `http://localhost:3000/billing`
     - **Direct URL:** `http://localhost:3000/analytics`
   - **Features:**
     - **Generate Invoices:**
       - Click "Generate invoices for current month"
       - System calculates based on attendance
       - Creates invoices for all children
     - **View Invoices:**
       - See all invoices in table
       - View invoice details (child, month, days, amount)
       - Mark invoices as paid
       - Filter by status (paid/unpaid)

#### 6. **Analytics Dashboard**
   - **Location:** Billing page (`/billing` or `/analytics`)
   - **Features:**
     - **Revenue Analytics:**
       - Total revenue this month
       - Invoice count (paid/unpaid)
       - Average per invoice
       - Average per child
     - **Attendance & Occupancy:**
       - Total children
       - Average attendance per week
       - Busiest hour of day
     - **Staff & Meals:**
       - Total staff count
       - Average children per staff
       - Meal consumption statistics
     - **Daily Occupancy Table:**
       - Date-wise occupancy
       - Present children count
       - Occupancy rate percentage
     - **Staff Workload Table:**
       - Staff name and role
       - Number of children assigned
       - Weekly hours worked

#### 7. **Chat**
   - **Access:** Same as other roles (`/chat` URL)
   - **Features:**
     - Chat with parents
     - Chat with staff
     - Full communication access

#### 8. **Notifications**
   - **Access:** Same as other roles (`/notifications` URL)
   - **Features:**
     - View all system notifications
     - Manage notification history

---

## 📋 Feature Summary by Module

### Module 1 & 2: Core Management
✅ **Authentication & Authorization**
- Login: `/login`
- Register: `/register`
- Role-based access control

✅ **Child Management**
- Parent Dashboard: `/dashboard` → Register/View children
- Admin Dashboard: `/admin` → View all children, assign caregivers

✅ **User Management**
- Admin Dashboard: `/admin` → Add/View/Delete staff

✅ **Staff Activities**
- Staff Dashboard: `/staff` → Create activities, quick log
- Admin Dashboard: `/admin` → View staff activity records

✅ **Attendance Management** ⭐ NEW
- Staff Dashboard: `/staff` → Check-in/Check-out children
- Tracks daily attendance for billing
- Records check-in/check-out times
- Optional: Extra service charges and meals served

### Module 3: Activity Management & Communication
✅ **Activity Management**
- Staff Dashboard: `/staff` → Create activities with photos
- Parent Dashboard: `/dashboard` → View child activities

✅ **Parent Notifications**
- Notification Bell: Top right (all dashboards)
- Notifications Page: `/notifications`
- Emergency Alerts: Staff dashboard
- Pickup Reminders: Staff dashboard

✅ **Parent-Staff Chat**
- Chat Button: Floating button (all dashboards)
- Chat Page: `/chat`
- Real-time messaging with Socket.io

✅ **Daily Reports** ⭐ NEW (Module 3 Feature 4)
- **Access:** Parent Dashboard → Click "📄 View Daily Report" button when viewing a child's activities
- **Direct URL:** `/reports/daily/:childId` (replace `:childId` with actual child ID)
- **Features:**
  - **Comprehensive Daily Summary:**
    - Total activities count
    - Meals breakdown (breakfast, lunch, snack, dinner)
    - Naps summary (count, duration, average)
    - Activities and updates count
    - Photo gallery
  - **Attendance Information:**
    - Check-in/check-out status
    - Check-in/check-out times
    - Extra services provided
    - Meals served
  - **Detailed Activity Breakdown:**
    - All meals with food items, quantities, photos
    - All naps with duration, mood, photos
    - All activities with activity types, photos
    - All updates with photos
    - Staff member who logged each activity
  - **Date Selection:**
    - Select any date to view historical reports
    - Default shows today's report
  - **Photo Gallery:**
    - View all photos from the day in one place
    - Organized by activity

### Module 4: Billing & Analytics
✅ **Billing & Invoicing**
- Billing Dashboard: `/billing` or `/analytics`
- Generate monthly invoices
- Track payment status
- Mark invoices as paid

✅ **Analytics Dashboard**
- Same page: `/billing` or `/analytics`
- Revenue analytics
- Attendance & occupancy stats
- Staff workload analysis
- Meal consumption statistics

---

## 🎯 Quick Access URLs

| Feature | URL | Role Required |
|---------|-----|---------------|
| Login | `/login` | Public |
| Register | `/register` | Public |
| Parent Dashboard | `/dashboard` | Parent |
| Staff Dashboard | `/staff` | Staff |
| Admin Dashboard | `/admin` | Admin |
| Notifications | `/notifications` | All |
| Chat | `/chat` | All |
| Billing/Analytics | `/billing` or `/analytics` | Admin |

---

## 🔑 Default Test Accounts

To test the system, you'll need to:

1. **Register a Parent Account:**
   - Go to `/register`
   - Fill in the form
   - You'll be redirected to `/dashboard`

2. **Create Staff Account (Admin only):**
   - Login as admin
   - Go to `/admin`
   - Use "Add Staff" form
   - System will show temporary password

3. **Assign Caregiver (Admin only):**
   - Login as admin
   - Go to `/admin`
   - In Children section, assign caregiver to child

---

## 💡 Tips for Testing

1. **Start with Admin:**
   - Create staff accounts first
   - Register children (or have parents register)
   - Assign caregivers to children

2. **Then Test Staff:**
   - Login as staff member
   - Select assigned child
   - Create activities
   - Send notifications
   - Test chat

3. **Finally Test Parent:**
   - Login as parent
   - Register child (if not done by admin)
   - View activities
   - Check notifications
   - Test chat with staff

4. **Test Billing (Admin):**
   - Ensure children have attendance records
   - Go to `/billing`
   - Generate invoices
   - View analytics

---

## 🐛 Troubleshooting

**Can't access a feature?**
- Check if you're logged in with the correct role
- Verify the backend is running on port 5000
- Check browser console for errors
- Ensure MongoDB connection is working

**Activities not showing?**
- Make sure staff is assigned to child (admin)
- Verify child is selected in staff dashboard
- Check backend is running and connected to database

**Chat not working?**
- Ensure Socket.io is running on backend
- Check both frontend and backend are running
- Verify user IDs are correct

**Notifications not appearing?**
- Check parent ID matches in notification
- Verify backend notification API is working
- Check notification bell component is loaded

---

## 📞 Support

For issues or questions:
1. Check the browser console for errors
2. Check backend terminal for API errors
3. Verify all dependencies are installed
4. Ensure MongoDB is connected

---

**Last Updated:** Based on merged project structure
**Version:** 1.0.0
