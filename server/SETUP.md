# Co-Nexus Backend Setup

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Setup Instructions

### 1. Install Dependencies

```bash
cd server
npm install
```

### 2. Environment Configuration

Create a `.env` file in the `server` folder:

```bash
cp .env.example .env
```

The `.env` file is already configured with MongoDB Atlas connection.

### 3. Start the Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Test the Connection

Visit: `http://localhost:5000/test`

You should see:

```json
{
  "message": "Backend is running!",
  "mongodb": "Connected"
}
```

## Database Information

- **Database:** MongoDB Atlas (Cloud)
- **Connection:** Shared database for all team members
- **Database Name:** clg_management

## Important Notes

⚠️ **Security:**

- Never commit `.env` file to GitHub
- The connection string contains credentials
- Share credentials securely with team members only

✅ **Advantages:**

- All team members share the same data
- No need for local MongoDB installation
- Data persists even when your computer is off
- Easy collaboration

## Troubleshooting

### Cannot connect to MongoDB

1. Check your internet connection
2. Verify MongoDB Atlas Network Access allows `0.0.0.0/0`
3. Check if credentials in `.env` are correct

### Port already in use

Change `PORT=5000` to another port like `PORT=5001` in `.env`

## Team Members Setup

Each team member should:

1. Clone the repository
2. Copy `.env.example` to `.env`
3. Run `npm install`
4. Run `npm run dev`
5. Test connection at `http://localhost:5000/test`
