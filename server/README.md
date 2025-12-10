# Ubunifu Education JSON Server

This directory contains a simple JSON Server that acts as a mock backend for the Ubunifu Education application. It serves data stored in `db.json`.

## Prerequisites

- Node.js (v14 or higher recommended)
- npm (Node Package Manager)

## Installation

Navigate to the `server` directory and install the dependencies:

```bash
cd server
npm install
```

## Running the Server

### Development Mode

To run the server with hot-reloading (using `nodemon`):

```bash
npm run dev
```

### Production Mode

To run the server normally:

```bash
npm start
```

## API Endpoints

The server runs on port **8000** by default.

Base URL: `http://localhost:8000`

The endpoints map directly to the keys in `db.json`:

- Institutions: `GET /institutions`
- Users: `GET /users`
- Semesters: `GET /semesters`
- Classes: `GET /classes`
- Units: `GET /units`
- Timetable entries: `GET /timetable`

JSON Server also exposes the usual REST verbs for each resource:

- `GET /<resource>` - list all
- `GET /<resource>/:id` - get one
- `POST /<resource>` - create
- `PUT /<resource>/:id` - replace
- `PATCH /<resource>/:id` - update fields
- `DELETE /<resource>/:id` - remove

Useful examples with the bundled data:

- `GET /classes?teacherId=t1` — classes taught by Anne Ndungu.
- `GET /users?role=student&classIds_like=class1` — students in class1 (JSON Server treats arrays as text for _like queries).
- `GET /timetable?classId=class1` — timetable for Diploma CS Year 1 - Group A.

## Technologies Used

- [json-server](https://github.com/typicode/json-server) - Get a full fake REST API with zero coding.
- [cors](https://github.com/expressjs/cors) - Node.js CORS middleware.
