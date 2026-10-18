# SmartNews Frontend

Frontend application for **SmartNews CMS**, built with ReactJS and Vite.

## Tech Stack

- ReactJS
- Vite
- JavaScript
- React Router
- Axios

## Features

- Public news browsing
- View article details
- User registration and login
- JWT authentication
- Protected routes
- Role-based UI for Admin and Staff
- Admin dashboard
- Article management
- Category management
- Tag management

## Backend

This frontend connects to the SmartNews Spring Boot REST API.

Backend repository:

`smartnews-backend`

Default backend URL:

```text
http://localhost:8080
```

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm run dev
```

The frontend will normally run at:

```text
http://localhost:5173
```

## Project Structure

```text
src/
├── api/
├── components/
├── context/
├── pages/
├── utils/
├── App.jsx
├── main.jsx
└── styles.css
```

## Development Notes

- The backend should be running before testing API features.
- JWT is used for authenticated requests.
- Public article endpoints are accessible without login.
- Admin and Staff features require the appropriate backend role.

## Planned Development

- Authentication flow
- Public article pages
- Staff article CRUD
- Category management
- Tag management
- Admin dashboard
- Search and pagination
- Image upload
- Better error handling and form validation
