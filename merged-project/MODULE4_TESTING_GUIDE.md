# 📊 Module 4: Billing & Analytics - Testing Guide

This guide explains how to access and test all Module 4 features (Billing & Analytics).

## 🚀 Quick Access

**URL:** `http://localhost:3000/billing` or `http://localhost:3000/analytics`

**Required Role:** Admin only

**Login:** You must be logged in as an admin user to access these features.

---

## 📋 Step-by-Step Testing Guide

### Step 1: Access the Billing Dashboard

1. **Start the application:**
   ```bash
   # Backend (Terminal 1)
   cd merged-project/backend
   npm start
   
   # Frontend (Terminal 2)
   cd merged-project/frontend
   npm start
   ```

2. **Login as Admin:**
   - Go to `http://localhost:3000/login`
   - Login with an admin account
   - If you don't have an admin account, you'll need to create one in the database or through registration

3. **Navigate to Billing Dashboard:**
   - Option 1: Click on "Billing" or "Analytics" link in admin dashboard (if available)
   - Option 2: Direct URL: `http://localhost:3000/billing`
   - Option 3: Direct URL: `http://localhost:3000/analytics` (both URLs go to the same page)

---

## 💰 Feature 1: Invoice Generation

### How to Test:

1. **Generate Invoices:**
   - On the Billing Dashboard, click the **"📄 Generate Invoices for Current Month"** button
   - The system will:
     - Calculate attendance for all children for the current month
     - Create invoices based on:
       - Days present × Base daily fee
       - Extra service charges (if any)
     - Generate one invoice per child

2. **What to Expect:**
   - Success message: "Invoices generated successfully for [month]/[year]!"
   - Invoices table will populate with all generated invoices
   - Each invoice shows:
     - Child name
     - Month/Year
     - Days present
     - Base rate per day
     - Extra charges
     - Total amount
     - Status (unpaid)

### Prerequisites:
- Children must be registered in the system
- Children must have attendance records (check-in/check-out) for the month
- Children should have a `baseDailyFee` set (default: ৳500)

---

## 📊 Feature 2: Invoice Management

### How to Test:

1. **View Invoices:**
   - After generating invoices, they appear in the "Invoices" table
   - You can see all invoice details

2. **Filter Invoices:**
   - **By Status:** Use the "Status" dropdown
     - Select "All Status" to see all invoices
     - Select "Paid" to see only paid invoices
     - Select "Unpaid" to see only unpaid invoices
   
   - **By Year:** Use the "Year" dropdown
     - Select the year (current year and past 2 years available)
   
   - **By Month:** Use the "Month" dropdown
     - Select any month (January through December)

3. **Mark Invoice as Paid:**
   - Find an unpaid invoice in the table
   - Click the **"Mark Paid"** button next to the invoice
   - The invoice status will change to "PAID"
   - Success message will appear: "Invoice marked as paid successfully!"

4. **View Invoice Details:**
   - Each invoice row shows:
     - Child name
     - Month/Year (e.g., "12/2024")
     - Number of days present
     - Base rate per day
     - Extra charges (from attendance records)
     - Total amount
     - Status badge (green for paid, yellow for unpaid)

---

## 📈 Feature 3: Revenue Analytics

### How to Test:

1. **View Revenue Summary Card:**
   - The first summary card shows:
     - **Total Revenue (This Month):** Total amount from all invoices
     - **Invoice Count:** Total number of invoices
     - **Paid Count:** Number of paid invoices
     - **Unpaid Count:** Number of unpaid invoices
     - **Average per Invoice:** Total revenue ÷ invoice count
     - **Average per Child:** Total revenue ÷ total children

2. **What to Check:**
   - Revenue should match the sum of all invoice totals
   - Paid + Unpaid should equal total invoice count
   - Averages should be calculated correctly

---

## 👥 Feature 4: Attendance & Occupancy Analytics

### How to Test:

1. **View Attendance Summary Card:**
   - The second summary card shows:
     - **Total Children:** Total number of children in the system
     - **Average Attendance/Week:** Average number of children per week
     - **Busiest Hour:** Hour of day with most check-ins

2. **View Daily Occupancy Table:**
   - Scroll down to see "📅 Daily Occupancy (Current Month)" table
   - Shows for each day:
     - **Date:** Date (YYYY-MM-DD format)
     - **Present:** Number of children present that day
     - **Occupancy Rate:** Percentage (present children ÷ total children)

3. **What to Check:**
   - Occupancy rate should be between 0% and 100%
   - Present count should match attendance records
   - Dates should be from the current month only

---

## 🍽️ Feature 5: Staff & Meals Analytics

### How to Test:

1. **View Staff Summary Card:**
   - The third summary card shows:
     - **Total Staff:** Number of staff members
     - **Average Children per Staff:** Average assignment load
     - **Meals Served:** Breakdown by meal type (breakfast, lunch, snack, dinner)

2. **View Staff Workload Table:**
   - Scroll down to see "👥 Staff Workload" table
   - Shows for each staff member:
     - **Name:** Staff member's name
     - **Role:** Staff role (caregiver, teacher, cook)
     - **Children Assigned:** Number of children assigned
     - **Weekly Hours:** Weekly working hours (default: 40)

3. **What to Check:**
   - Staff count should match actual staff in system
   - Children assigned should match actual assignments
   - Meal counts should match attendance meal records

---

## 🔄 Feature 6: Data Refresh

### How to Test:

1. **Refresh Data:**
   - Click the **"🔄 Refresh"** button
   - All data will reload:
     - Invoices
     - Analytics summary
     - All tables

2. **Auto-Refresh:**
   - Data automatically refreshes when:
     - You generate new invoices
     - You mark an invoice as paid
     - You change filter settings

---

## 🧪 Complete Testing Scenario

### Full Test Flow:

1. **Setup:**
   - Ensure you have:
     - At least 2-3 children registered
     - At least 1-2 staff members
     - Some attendance records (check-ins) for the current month

2. **Generate Invoices:**
   - Click "Generate Invoices for Current Month"
   - Verify invoices are created

3. **Test Filtering:**
   - Filter by status (paid/unpaid)
   - Filter by month
   - Filter by year
   - Verify results update correctly

4. **Test Payment:**
   - Mark one invoice as paid
   - Verify status changes
   - Verify analytics update (paid count increases)

5. **Check Analytics:**
   - Verify revenue card shows correct totals
   - Verify attendance card shows correct counts
   - Verify staff card shows correct staff info
   - Check daily occupancy table
   - Check staff workload table

6. **Test Edge Cases:**
   - Generate invoices for a month with no attendance (should create 0 invoices)
   - Filter for a month with no invoices (should show empty state)
   - Mark all invoices as paid (verify all show as paid)

---

## 🐛 Troubleshooting

### Issue: "Access denied" or redirected to login
**Solution:** Make sure you're logged in as an admin user, not parent or staff.

### Issue: No invoices showing
**Solution:** 
- Generate invoices first using the "Generate Invoices" button
- Make sure children have attendance records for the selected month
- Check that children have a `baseDailyFee` set

### Issue: Analytics showing 0 or incorrect values
**Solution:**
- Make sure you have:
  - Children registered
  - Staff members registered
  - Attendance records created
- Click "Refresh" button to reload data

### Issue: "Failed to load invoices" error
**Solution:**
- Check if backend is running on port 5000
- Check browser console for detailed error
- Verify authentication token is valid

### Issue: Filters not working
**Solution:**
- Make sure you've selected valid filter values
- Click "Refresh" to reload with new filters
- Check browser console for errors

---

## 📝 Expected Data Structure

### Invoice Fields:
- `child`: Child object (with name, age, etc.)
- `year`: Year (e.g., 2024)
- `month`: Month (1-12)
- `daysPresent`: Number of days child was present
- `baseRatePerDay`: Daily fee (default: ৳500)
- `extraCharges`: Additional charges from attendance
- `totalAmount`: daysPresent × baseRatePerDay + extraCharges
- `status`: "paid" or "unpaid"
- `paidAt`: Date when marked as paid (if paid)

### Analytics Data:
- `totalChildren`: Count of all children
- `totalStaff`: Count of all staff
- `revenue`: Object with revenue statistics
- `occupancy`: Array of daily occupancy data
- `staffWorkload`: Array of staff assignment data
- `mealConsumptionStats`: Array of meal counts
- `busiestHour`: Hour (0-23) with most check-ins
- `averageAttendancePerWeek`: Average attendance per week

---

## ✅ Checklist

Use this checklist to verify all Module 4 features:

- [ ] Can access billing dashboard as admin
- [ ] Can generate invoices for current month
- [ ] Invoices show correct child, month, days, amounts
- [ ] Can filter invoices by status
- [ ] Can filter invoices by year
- [ ] Can filter invoices by month
- [ ] Can mark invoice as paid
- [ ] Paid invoices show correct status
- [ ] Revenue card shows correct totals
- [ ] Attendance card shows correct counts
- [ ] Staff card shows correct staff info
- [ ] Daily occupancy table displays correctly
- [ ] Staff workload table displays correctly
- [ ] Refresh button works
- [ ] Success/error messages appear correctly
- [ ] All calculations are accurate

---

## 🎯 Quick Test Commands

### Test Invoice Generation (via API):
```bash
curl -X POST http://localhost:5000/api/billing/generate/2024/12 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Get Invoices (via API):
```bash
curl http://localhost:5000/api/billing/invoices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Test Analytics (via API):
```bash
curl http://localhost:5000/api/analytics/summary \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

---

## 📞 Need Help?

If you encounter any issues:
1. Check the browser console for errors
2. Check the backend terminal for server errors
3. Verify you're logged in as admin
4. Ensure backend is running on port 5000
5. Ensure frontend is running on port 3000

---

**Last Updated:** Module 4 features are fully polished and ready for testing! 🎉
