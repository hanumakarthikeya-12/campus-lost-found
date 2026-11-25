# Campus Lost and Found Portal

A responsive full-stack web application for students to report lost/found belongings, search campus listings, submit claims, and manage recovery requests.

## Technology
- Frontend: HTML5, CSS3, JavaScript ES6+, Fetch API
- Backend: Node.js, Express.js, REST APIs
- Database: MongoDB with Mongoose
- Authentication: bcrypt password hashing + JWT
- API testing: Postman

## Requirements
Install Node.js (LTS) and MongoDB Community Server, or create a MongoDB Atlas database.

## Setup in VS Code
1. Extract this ZIP file.
2. Open the extracted `Campus-Lost-and-Found-Portal` folder in VS Code.
3. Open Terminal in VS Code.
4. Install packages:
   ```bash
   npm install
   ```
5. Create your environment file:
   - Windows PowerShell: `Copy-Item .env.example .env`
   - macOS/Linux: `cp .env.example .env`
6. Open `.env`. Set `MONGODB_URI` to your MongoDB connection string. Change `JWT_SECRET` and the admin password before deployment.
7. Start MongoDB if using a local database.
8. Add sample records:
   ```bash
   npm run seed
   ```
9. Start the application:
   ```bash
   npm run dev
   ```
10. Open `http://localhost:5000`.

## Demo accounts
- Student: `student@campus.edu` / `Student@123` (created by `npm run seed`)
- Admin: `admin@campus.edu` / `Admin@12345` (created automatically on first server start if these values are in `.env`)

Change demo passwords before using a public deployment. Do not commit `.env` to GitHub.

## Main pages
- Home and search: `/`
- Register: `/register.html`
- Login: `/login.html`
- Report item: `/report.html`
- User dashboard: `/dashboard.html`
- Admin dashboard: `/admin.html`

## API endpoints

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| GET | `/api/health` | API health check | Public |
| POST | `/api/auth/register` | Register | Public |
| POST | `/api/auth/login` | Login | Public |
| GET | `/api/auth/me` | Current user | User |
| GET | `/api/items` | Search/filter/sort items | Public |
| GET | `/api/items/:id` | Get one item | Public |
| POST | `/api/items` | Create item report | User |
| PUT | `/api/items/:id` | Update own item | Owner/Admin |
| DELETE | `/api/items/:id` | Delete own item | Owner/Admin |
| POST | `/api/claims/:itemId` | Submit claim | User |
| GET | `/api/claims/mine/list` | My claims | User |
| PATCH | `/api/claims/:id/review` | Approve/reject claim | Reporter/Admin |
| GET | `/api/claims/admin/all` | View all claims | Admin |
| GET | `/api/admin/stats` | Dashboard statistics | Admin |
| GET | `/api/admin/items` | View all items | Admin |
| PATCH | `/api/admin/items/:id/status` | Change item status | Admin |
| DELETE | `/api/admin/items/:id` | Delete item and claims | Admin |

### Search and filters
Example: `/api/items?search=wallet&category=Accessories&location=Library&type=lost&sort=newest`

## Custom feature
**Date sorting** is implemented through the `sort` query parameter:
- `sort=newest` (default)
- `sort=oldest`

The home page includes a date-sort dropdown.

## Sample data
Run `npm run seed` to insert 10 sample item reports. Running it again replaces the sample user's previous reports.

## Postman testing
Import `postman/Campus-Lost-and-Found.postman_collection.json` into Postman. Set `baseUrl` if needed. Run the requests in order. Some claim tests depend on having a second student account and a suitable item that is not owned by the claimant. Capture screenshots of successful and rejected responses for your report.

## Security notes
- Passwords are hashed with bcrypt.
- Protected routes require a JWT bearer token.
- Item owners can edit/delete their own reports; admins can manage all reports.
- Claim approval is limited to the report owner or admin.
- Image upload is limited to common image MIME types and 3 MB.
- Use HTTPS and strong secrets in production. Add rate limiting and stricter upload content inspection before a public production launch.

## Before submission
- Add your own screenshots and university-specific report format.
- Test all endpoints in Postman and save evidence.
- Push the source code to your own GitHub repository.
- Deploy to an instructor-approved platform and configure environment variables there.
- Be prepared to explain the code and disclose AI assistance according to university rules.

This is a starter implementation. Run and test it in your own environment, understand each module, and customize the interface/content for your individual submission.