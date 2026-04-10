# Student Performance Tracker – Client Application

A browser-based client application for the Student Performance Tracker REST API.
Built with HTML, CSS, and vanilla JavaScript — no framework or build step required.

## What is this application?

The Student Performance Tracker is a web-based dashboard that allows users to manage student academic records. It connects to a locally running REST API to perform full CRUD (Create, Read, Update, Delete) operations on student data stored in a SQLite database.

The application was built as part of a prototype to demonstrate the use of Node.js and Express to create a database-driven REST API, with a client application that consumes the API endpoints.

## Features and Description

Dashboard : Displays summary statistics — total students, average grade, top score, and number of courses. Shows a top 5 performers table
All Students : Full table of all student records with live name search and course filter dropdown
Add Student : Form to create a new student record with client-side validation
Edit Student : Pre-filled modal to update an existing student's details
Delete Student : Confirmation modal before permanently deleting a record
API Status : Live indicator in the sidebar showing whether the API is online or offline

## Prerequisites

Before running the client you must have the following installed:

Node.js : v20.10.0 LTS or later
npm : v9 or later

The API must be running before launching the client. The client connects to the API at `http://localhost:3000`.

## Starting the API (do this first)

Open a terminal and navigate to the API folder:

cd ../API
npm install
npm start

The message should be:

Server running on http://localhost:3000
Connected to SQLite database.
Database seeded with 25 students.

Leave this terminal running.

## Starting the Client

Open a second terminal and navigate to the CLIENT folder:

cd CLIENT
npm install
npm start

Then open browser and go to:

http://localhost:8080

## Using the Application

### Dashboard
- The default view when the app loads
- Shows 4 stat cards: Total Students, Average Grade, Top Score, Courses
- Shows a Top Performers table with the 5 highest graded students

### All Students
- Click All Students in the sidebar
- Browse the full list of student records
- Use the Search by name box to filter students in real time
- Use the All Courses dropdown to filter by course
- Click Edit on any row to open the edit modal
- Click Delete on any row to open the delete confirmation modal

### Add Student
- Click Add Student in the sidebar
- Fill in the required fields i.e marked with *
- Click Add Student button to submit
- A success or error message will appear below the form

### Edit Student
- Click Edit on any student row in the All Students view
- The modal pre-fills with the student's current data
- Update any fields and click Save Changes
- Click Cancel or the X to close without saving

### Delete Student
- Click Delete on any student row
- A confirmation modal appears with the student's name
- Click Delete to confirm or Cancel to go back

## API Endpoints Used

GET : `/api/students` => Fetch all students
GET : `/api/students/:id` => Fetch a single student
POST : `/api/students` => Create a new student
PUT : `/api/students/:id` => Update an existing student
DELETE : `/api/students/:id` => Delete a student

The API runs on `http://localhost:3000`. CORS is enabled so the client can communicate with it from port 8080.

## Running the Tests

The test suite uses TestCafe and covers 18 automated tests.

Both the API and client must be running before executing the tests.

Open a third terminal in the CLIENT folder and run:

npm test

### Test Coverage

The 18 tests cover:

1. Page loads with correct title
2. Dashboard statistics cards are rendered
3. Dashboard loads real student count from the API
4. Top performers table is populated
5. Navigation to All Students view
6. Navigation to Add Student view
7. Students table loads data from API (GET)
8. Table column headers are correct
9. Name search filters the displayed rows
10. Course filter dropdown narrows results
11. Add form shows validation error on empty submit
12. Add form creates a new student (POST)
13. Edit button opens the edit modal
14. Edit modal closes on cancel
15. Delete button opens the confirmation modal
16. Delete modal closes on cancel
17. API status indicator is visible
18. API status shows Online when API is running


## Technology Choices

- Plain HTML/CSS/JS — No framework needed for a prototype of this scale. Keeps the client lightweight and easy to run anywhere without a build step
- CSS Custom Properties — Used for consistent theming across the entire application
- Fetch API — Built-in browser API for making HTTP requests to the REST API
- TestCafe — Chosen for functional testing as it requires no browser driver setup and works cross-platform
- serve — Simple static file server to serve the client locally

## Troubleshooting

**Client shows blank page or no data:**
- Make sure the API is running at `http://localhost:3000`
- Check the API status indicator bottom left — it should show green "API Online"
- Open browser developer tools (F12) and check the Console for errors

**Tests failing:**
- Make sure both the API (port 3000) and client (port 8080) are running
- Make sure Chrome is installed
- Try running `npm install` again in the CLIENT folder

**Port 8080 already in use:**
- Change the port in package.json: `"start": "npx serve . -p 3001"`
- Then access the client at `http://localhost:3001`