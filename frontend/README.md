# Food Donation Platform (MERN Stack)

A platform connecting surplus food donors (restaurants, hotels, canteens, weddings) with NGOs
and volunteers to reduce food waste and fight hunger — built over 15 days.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios, Socket.IO Client, Leaflet
- **Backend:** Node.js, Express, MongoDB (Mongoose), JWT Auth, Socket.IO
- **AI Features:** Rule-based spoilage prediction, demand prediction, OSRM route optimization

## Features
- Role-based auth (Donor, NGO, Volunteer, Admin)
- Donor posts surplus food with image, geo-tagged pickup location
- Smart nearby-NGO matching (MongoDB geospatial queries)
- Food claiming system with race-condition protection
- Volunteer assignment + delivery status tracking (Assigned → Picked Up → Delivered → Completed)
- Real-time notifications & live GPS tracking via Socket.IO + Leaflet
- Admin dashboard: user verification, delivery monitoring, analytics, food quality review
- AI: spoilage prediction, area-wise demand prediction, route optimization

## Project Structure
See `/backend` and `/frontend` folders. Full architecture documented in Day 1 setup notes.

## Setup

### Backend
\`\`\`
cd backend
npm install
cp .env.example .env   # fill in your values
node seedAdmin.js       # creates first admin account
npm run dev
\`\`\`

### Frontend
\`\`\`
cd frontend
npm install
# create .env with VITE_API_URL and VITE_SOCKET_URL
npm run dev
\`\`\`

## Build Timeline (15 Days)
| Day | Milestone |
|---|---|
| 1 | Project setup + JWT auth |
| 2 | Food listing module |
| 3 | Location matching + claim system |
| 4 | Volunteer assignment + Socket.IO |
| 5 | Admin module + analytics |
| 6 | Frontend setup + auth pages |
| 7 | Donor dashboard |
| 8 | NGO dashboard |
| 9 | Volunteer dashboard |
| 10 | Admin dashboard UI |
| 11 | Live tracking map |
| 12 | AI spoilage prediction |
| 13 | AI demand prediction |
| 14 | AI route optimization |
| 15 | Quality verification + deployment |

## License
For educational/portfolio use.