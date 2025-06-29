import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { Client, Databases, ID, Query } from 'node-appwrite';

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const getAppwrite = () => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  return {
    database: new Databases(client),
  };
};

// 1. Get All Users
app.get('/api/users', async (req, res) => {
  const { limit = 10, offset = 0 } = req.query;
  const { database } = getAppwrite();
  try {
    const users = await database.listDocuments(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      [Query.limit(Number(limit)), Query.offset(Number(offset))]
    );
    res.json({ users: users.documents, total: users.total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to get users' });
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
      [Query.equal('accountId', accountId)]
    );
    res.json(result.documents[0] || null);
  } catch (err) {
    res.status(500).json({ error: 'Failed to get user' });
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
      [Query.equal('accountId', accountId)]
    );

    if (result.documents.length === 0) return res.status(404).json({ error: 'User not found' });

    const userDoc = result.documents[0];

    const updatedUser = await database.updateDocument(
      process.env.APPWRITE_DATABASE_ID,
      process.env.APPWRITE_USERS_COLLECTION_ID,
      userDoc.$id,
      { status: 'admin' }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user to admin' });
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
      [Query.equal('accountId', accountId), Query.select(['status'])]
    );

    if (result.documents.length === 0) return res.status(404).json({ error: 'User not found' });

    res.json({ status: result.documents[0].status });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch status' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log(`Backend running on port ${process.env.PORT || 3000}`);
});
