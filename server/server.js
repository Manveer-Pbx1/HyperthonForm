const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();

// Google Sheets ID
const SHEET_ID = process.env.GOOGLE_SHEET_ID;

if (!SHEET_ID) {
    throw new Error('Please define GOOGLE_SHEET_ID in your .env file');
}

// Scopes for Google Sheets API
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];

// Decode the Base64 service account key
const serviceAccountKey = process.env.SERVICE_ACCOUNT_KEY
    ? JSON.parse(Buffer.from(process.env.SERVICE_ACCOUNT_KEY, 'base64').toString('utf-8'))
    : null;

if (!serviceAccountKey) {
    throw new Error('Please define SERVICE_ACCOUNT_KEY in your .env file');
}

// Authenticate Google API client
const auth = new google.auth.GoogleAuth({
    credentials: serviceAccountKey,
    scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

app.use(cors());
app.use(bodyParser.json());

/**
 * Appends data to the Google Sheet
 * @param {Array<Array<string>>} values - 2D array of values to append
 */
async function appendToGoogleSheet(values) {
    try {
        await sheets.spreadsheets.values.append({
            spreadsheetId: SHEET_ID,
            range: 'Sheet1!A1', // Adjust the range as needed
            valueInputOption: 'RAW',
            requestBody: {
                values,
            },
        });
        console.log('Data successfully appended to Google Sheet');
    } catch (error) {
        console.error('Error appending data to Google Sheet:', error);
        throw new Error('Failed to append data to Google Sheet');
    }
}

/**
 * API Endpoint to save data to Google Sheets
 */
app.post('/save-to-sheets', async (req, res) => {
    const { data } = req.body;

    if (!data) {
        return res.status(400).json({ error: 'Missing data in request body' });
    }

    try {
        // Creating an array for the main team data along with team members
        const rows = [
            [data.teamName, data.fullName, data.rollNo, data.email, data.branch], // Main member
            ...(data.teamMembers || []).map((member) => [
                data.teamName, // Add team name for each member
                member.fullName,
                member.rollNo,
                member.email,
                member.branch,
            ]),
        ];

        // Append this data to Google Sheets
        await appendToGoogleSheet(rows);

        res.status(200).json({ message: 'Data saved successfully to Google Sheets' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to save data to Google Sheets' });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});