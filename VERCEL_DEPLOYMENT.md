# Deploying Your Vite and Serverless Functions to Vercel

This guide outlines the steps to migrate your Firebase Functions to Vercel Serverless Functions and deploy your entire application (Vite frontend + functions) on Vercel.

## 1. Project Structure for Vercel

Vercel uses a specific directory structure to automatically detect and deploy serverless functions. We will create an `api` directory in the root of your project.

- **`api/`**: This directory will contain your serverless functions. Each file inside this directory will become a separate API endpoint. For example, a file named `getMenu.js` will be accessible at `/api/getMenu`.

We will move the logic from your existing `functions/src/index.ts` file into this new `api` directory.

## 2. Migrating the Functions

We will need to convert your existing TypeScript functions into individual JavaScript or TypeScript files that Vercel can use.

**Example:**

Your current `getMenu` function in `functions/src/index.ts` will be moved to a new file `api/getMenu.ts` and adapted to the Vercel function signature:

```typescript
// api/getMenu.ts
import { VercelRequest, VercelResponse } from '@vercel/node';
import * as admin from 'firebase-admin';

// Firebase Admin SDK initialization (see step 3)

export default async (req: VercelRequest, res: VercelResponse) => {
  // Your getMenu logic here
  // ...
};
```

We will do this for all the functions you want to migrate.

## 3. Firebase Admin SDK and Environment Variables

Your functions will still need to communicate with your Firestore database. To do this, we will use the Firebase Admin SDK, just like before.

However, instead of initializing it directly, we will store your Firebase Admin credentials securely as **Environment Variables** in your Vercel project settings.

You will need to create a Firebase service account key (a JSON file) and add its contents as environment variables on the Vercel dashboard.

## 4. Updating Frontend API Calls

In your React components, you are currently calling the Firebase Function URLs. We will need to update these calls to point to the new Vercel API endpoints.

**Example:**

If you were previously fetching the menu from a Firebase Function URL, you will now fetch it from `/api/getMenu`.

```javascript
// Before
fetch('https://us-central1-your-project.cloudfunctions.net/getMenu')

// After
fetch('/api/getMenu')
```

Since the frontend and the API will be hosted on the same domain (by Vercel), you can use relative paths, which simplifies the code and avoids CORS issues.

## 5. Deployment to Vercel

The deployment process is straightforward:

1.  **Push your code** to a GitHub, GitLab, or Bitbucket repository.
2.  **Import the repository** into Vercel.
3.  **Configure the project:** Vercel will automatically detect that you have a Vite application and configure the build settings. You will need to add your Firebase environment variables in the project settings.
4.  **Deploy:** Vercel will build your frontend and deploy your serverless functions from the `api` directory.

---

These are the next steps we will take. I will guide you through each one, starting with restructuring your project and migrating the first function.