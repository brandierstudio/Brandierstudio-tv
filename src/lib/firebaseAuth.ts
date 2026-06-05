/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { Lead } from '../types';
import realConfig from '../firebase-stub-config.json';

// Safe lazy initialization of Firebase configuration
let app;
let auth;
const provider = new GoogleAuthProvider();

// Add the spreadsheet scope (and sheets scope) requested by the user
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

try {
  // Load configuration safely. If placeholder values exist, it will boot normally.
  const config = {
    apiKey: "dummy",
    authDomain: "dummy",
    projectId: "dummy",
  };
  
  const finalConfig = (realConfig as any).apiKey ? realConfig : config;

  if (getApps().length === 0) {
    app = initializeApp(finalConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
} catch (error) {
  console.warn("Firebase lazy-initialization notice:", error);
}

let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Initialize state listeners
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  if (!auth) {
    throw new Error('Authentication system not initialized. Ensure Firebase is fully configured first.');
  }
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const token = credential?.accessToken;
    if (!token) {
      throw new Error('Did not receive Google Sheets access token from login. Sheets scope may be unapproved.');
    }
    cachedAccessToken = token;
    return { user: result.user, accessToken: token };
  } catch (error) {
    console.error('OAuth configuration/sign-in failed:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const googleSignOut = async () => {
  if (!auth) return;
  await firebaseSignOut(auth);
  cachedAccessToken = null;
};

export const getCachedAccessToken = () => cachedAccessToken;

/**
 * Sync captured leads to a targeted Google Sheet using raw REST endpoint.
 * This function appends lead records to the Sheet seamlessly.
 */
export async function syncLeadsToGoogleSheet(
  spreadsheetId: string,
  leads: Lead[],
  token: string
): Promise<{ success: boolean; appendedCount: number; message: string }> {
  if (!spreadsheetId) {
    return { success: false, appendedCount: 0, message: 'Spreadsheet ID is missing' };
  }
  if (!leads || leads.length === 0) {
    return { success: true, appendedCount: 0, message: 'No leads to synchronize currently' };
  }

  try {
    // 1. Let's first ping the sheet to ensure connection and format headers if necessary
    // We append leads directly to "Sheet1"
    const response = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Sheet1!A:B:append?valueInputOption=USER_ENTERED`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: leads.map(lead => [lead.email, lead.timestamp])
        })
      }
    );

    if (!response.ok) {
      const errorJson = await response.json().catch(() => ({}));
      console.error("Sheets API rejection details:", errorJson);
      throw new Error(errorJson?.error?.message || `Sheets API status code ${response.status}`);
    }

    const data = await response.json();
    return { 
      success: true, 
      appendedCount: leads.length,
      message: 'Leads safely recorded in Google Sheet!' 
    };
  } catch (err: any) {
    console.error('Failed to sync to spreadsheet:', err);
    return { 
      success: false, 
      appendedCount: 0, 
      message: err.message || 'Error occurred while connecting with Google Workspace API.' 
    };
  }
}
