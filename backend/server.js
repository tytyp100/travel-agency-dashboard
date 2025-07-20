import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client, Databases, ID, Query, Account } from 'node-appwrite';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();
const app = express();

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use(cors({
  origin: [
    process.env.FRONTEND_URL || "http://localhost:5173", // Development
    "http://localhost:3000", // Production build local
    "http://localhost:5174", // Alternative dev port
    // Add your EC2 public IP when you deploy
    "http://3.129.92.159:3000", // EC2 Production - REPLACE WITH YOUR IP
  ],
  credentials: true
}));
app.use(express.json());

const getAppwrite = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    database: new Databases(client),
    account: new Account(client)
  };
};

// 1. Get All Users
app.get('/api/users', async (req, res) => {
  const { limit = 10 } = req.query;
  const { database } = getAppwrite();
  
  try {
    // Handle queries properly
    const queries = isNaN(Number(limit)) ? [] : [Query.limit(Number(limit))];
    
    const users = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      queries.length > 0 ? queries : undefined // Critical fix - pass undefined for no queries
    );
    
    res.json({ 
      users: users.documents, 
      total: users.total 
    });
  } catch (error) {
    console.error('Users error:', error);
    res.status(500).json({ 
      error: 'Failed to get users',
      details: error.message 
    });
  }
});

// 2. Get Existing User
app.get('/api/user/:accountId', async (req, res) => {
  const { accountId } = req.params;
  const { database } = getAppwrite();

  try {
    const result = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [
        Query.equal('accountId', accountId)
      ]
    );

    if (!result.documents.length) {
      return res.status(404).json(null);
    }

    const userDoc = result.documents[0];
    res.json({
      name: userDoc.name,
      email: userDoc.email,
      imageUrl: userDoc.imageUrl,
      joinedAt: userDoc.joinedAt,
      accountId: userDoc.accountId,
      status: userDoc.status || "user"
    });
  } catch (err) {
    console.error('User error:', err);
    res.status(500).json({ 
      error: 'Failed to get user',
      details: err.message 
    });
  }
});

// 3. Store User Data
app.post('/api/user', async (req, res) => {
  const { accountId, email, name, imageUrl } = req.body;
  const { database } = getAppwrite();

  try {
    const createdUser = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      ID.unique(),
      {
        accountId,
        email,
        name,
        imageUrl,
        joinedAt: new Date().toISOString(),
        status: "user"
      }
    );
    res.json(createdUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to store user' });
  }
});

// 4. Become Admin
app.patch('/api/user/:accountId/admin', async (req, res) => {
  const { accountId } = req.params;
  const { database } = getAppwrite();

  try {
    const result = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [
        Query.equal('accountId', accountId)
      ]
    );

    if (!result.documents.length) {
      return res.status(404).json({ error: 'User not found' });
    }

    const userDoc = result.documents[0];
    const updatedUser = await database.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userDoc.$id,
      { status: 'admin' }
    );

    res.json(updatedUser);
  } catch (err) {
    console.error('Admin error:', err);
    res.status(500).json({ 
      error: 'Failed to update user to admin',
      details: err.message 
    });
  }
});

// 5. Display Status
app.get('/api/user/:accountId/status', async (req, res) => {
  const { accountId } = req.params;
  const { database } = getAppwrite();

  try {
    const result = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [
        Query.equal('accountId', accountId),
        Query.select(['status'])
      ]
    );

    if (result.documents.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ status: result.documents[0].status });
  } catch (err) {
    res.status(500).json({ 
      error: 'Failed to fetch status',
      details: err.message 
    });
  }
});

// 6. Generate Trip Itinerary
app.post('/api/generate-trip', async (req, res) => {
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId
  } = req.body;

  if (!process.env.GEMINI_API_KEY) {
    return res.status(500).json({ error: 'Gemini API key not configured' });
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const unsplashApiKey = process.env.UNSPLASH_ACCESS_KEY;

  try {
    // Compose prompt
    const prompt = `Generate a ${numberOfDays}-day travel itinerary for ${country} based on the following user information:
    Budget: '${budget}'
    Interests: '${interests}'
    TravelStyle: '${travelStyle}'
    GroupType: '${groupType}'
    Return the itinerary and lowest estimated price in a clean, non-markdown JSON format with the following structure:
    {
    "name": "A descriptive title for the trip",
    "description": "A brief description of the trip and its highlights not exceeding 100 words",
    "estimatedPrice": "Lowest average price for the trip in USD, e.g.$1200",
    "duration": ${numberOfDays},
    "budget": "${budget}",
    "travelStyle": "${travelStyle}",
    "country": "${country}",
    "interests": "${interests}",
    "groupType": "${groupType}",
    "bestTimeToVisit": [
      "🌸 Season (from month to month): reason to visit",
      "☀️ Season (from month to month): reason to visit",
      "🍁 Season (from month to month): reason to visit",
      "❄️ Season (from month to month): reason to visit"
    ],
    "weatherInfo": [
      "☀️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
      "🌦️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
      "🌧️ Season: temperature range in Celsius (temperature range in Fahrenheit)",
      "❄️ Season: temperature range in Celsius (temperature range in Fahrenheit)"
    ],
    "location": {
      "city": "name of the city or region",
      "coordinates": [latitude, longitude],
      "openStreetMap": "link to open street map"
    },
    "itinerary": [
    {
      "day": 1,
      "location": "City/Region Name",
      "activities": [
        {"time": "Morning", "description": "🏰 Visit the local historic castle and enjoy a scenic walk"},
        {"time": "Afternoon", "description": "🖼️ Explore a famous art museum with a guided tour"},
        {"time": "Evening", "description": "🍷 Dine at a rooftop restaurant with local wine"}
      ]
    }
    ]
    }`;

    const textResult = await genAI
      .getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
      .generateContent([prompt]);

    let tripData;
    try {
      const responseText = textResult.response.text();
      // Clean the response text to remove any markdown formatting
      const cleanedText = responseText.replace(/```json\n?/, '').replace(/```\n?$/, '').trim();
      tripData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Error parsing Gemini response:', parseError);
      return res.status(500).json({ error: 'Failed to parse AI response' });
    }

    // Fetch images from Unsplash
    let imageUrls = [];
    if (unsplashApiKey) {
      try {
        const unsplashRes = await fetch(
          `https://api.unsplash.com/search/photos?query=${country} ${interests} ${travelStyle}&client_id=${unsplashApiKey}&per_page=3`
        );
        const unsplashData = await unsplashRes.json();
        imageUrls = unsplashData.results?.slice(0, 3)
          .map(result => result.urls?.regular)
          .filter(url => url) || [];
      } catch (unsplashError) {
        console.error('Error fetching images from Unsplash:', unsplashError);
        // Continue without images if Unsplash fails
      }
    }

    // If no images from Unsplash, use placeholder images
    if (imageUrls.length === 0) {
      imageUrls = [
        'https://via.placeholder.com/600x400/4F46E5/FFFFFF?text=Travel+Destination',
        'https://via.placeholder.com/600x400/059669/FFFFFF?text=Adventure+Awaits',
        'https://via.placeholder.com/600x400/DC2626/FFFFFF?text=Explore+More'
      ];
    }

    // Store the trip in the database
    const { database } = getAppwrite();
    const tripDocument = await database.createDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_TRIPS_COLLECTION_ID,
      ID.unique(),
      {
        tripDetail: JSON.stringify(tripData),
        createdAt: new Date().toISOString(),
        imageUrls: imageUrls,
        userId: userId
      }
    );

    res.json({
      id: tripDocument.$id,
      trip: tripData,
      imageUrls
    });
  } catch (err) {
    console.error("Trip generation error:", err);
    res.status(500).json({ 
      error: "Trip generation failed", 
      details: err.message 
    });
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
}).on('error', (err) => {
  console.error('Server failed to start:', err);
});
