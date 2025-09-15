# Firebase Token Server

A secure server for generating Firebase custom authentication tokens. Generates custom tokens that you can use to login to Firebase, which is great for personal authentication systems.

## Setup

### Prerequisites

- Node.js installed on your machine
- Firebase project with Admin SDK credentials
- npm or yarn package manager

### Installation

1. Clone or download this repository
2. Install dependencies:

```bash
npm install
```

### Firebase Configuration

You need a Firebase service account key to run this server. You can get this from the Firebase Console:

1. Go to your [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to Project Settings > Service Accounts
4. Click "Generate new private key"
5. Save the JSON file securely

## Running Locally

### Environment Variables

Create a `.env` file in the root directory with the following variables (note: this file is included in `.gitignore` and should never be committed to your repository):

```
# Option 1: Direct JSON string
FIREBASE_SERVICE_ACCOUNT_JSON='{"type":"service_account","project_id":"your-project-id","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'  

# Option 2: Path to your service account JSON file
FIREBASE_SERVICE_ACCOUNT_JSON_PATH=path/to/your/serviceAccountKey.json

# Required: Secret API key for server-to-server authentication
SERVER_API_KEY=your-secret-api-key

# Optional: Port for the server (defaults to 3000 if not specified)
PORT=3000
```

Replace the JSON content or file path with your actual Firebase service account information and set a strong SERVER_API_KEY. You can use either the direct JSON string OR the file path option.

### Start the Server

```bash
npm start
```

The server will run at http://localhost:3000

## Making the Server Publicly Accessible

To make your local server accessible over the internet, you can use a tunneling service like ngrok or Cloudflare Tunnel.

### Using ngrok

1. [Download and install ngrok](https://ngrok.com/download)
2. Run ngrok to expose your local server:

```bash
ngrok http 3000
```

3. ngrok will provide a public URL (like `https://abc123.ngrok.io`) that forwards to your local server

### Using Cloudflare Tunnel

1. [Install Cloudflare Tunnel](https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/)
2. Run the tunnel to expose your local server:

```bash
cloudflared tunnel --url http://localhost:3000
```

3. Cloudflare will provide a public URL that forwards to your local server

## GitHub and Deployment

### Uploading to GitHub

This project includes a `.gitignore` file that prevents sensitive information like your `.env` file from being committed to your repository. To upload this project to GitHub:

1. Create a new repository on GitHub
2. Initialize git in this directory (if not already done):
   ```bash
   git init
   ```
3. Add all files and commit:
   ```bash
   git add .
   git commit -m "Initial commit"
   ```
4. Add your GitHub repository as remote and push:
   ```bash
   git remote add origin https://github.com/yourusername/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

The `.env` file will be automatically excluded from your repository due to the `.gitignore` configuration.

### Deployment Options

For production use, consider deploying to:

- Heroku
- Google Cloud Run
- AWS Lambda
- Azure Functions
- Vercel

## Security Considerations

- Keep your SERVER_API_KEY secret and use a strong value
- Restrict CORS settings in production
- Consider adjusting rate limits for production use
- Use HTTPS in production
- Never expose your Firebase service account key publicly

## API Usage

### Create Custom Token

```
POST /createCustomToken
Header: x-server-key: your-secret-api-key
Body: { "uid": "user123", "claims": { "premium": true } }
```

Response:
```json
{ "token": "eyJhbGciOi..." }
```

This token can be used with Firebase's `signInWithCustomToken()` method on the client side.
