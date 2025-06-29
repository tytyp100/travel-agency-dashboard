import { Client, Databases, Account, Storage } from "appwrite";
import { getWindow } from "~/lib/utils";

const { origin } = getWindow().location;

export const appwriteConfig = {
    endpointUrl: import.meta.env.VITE_APPWRITE_API_ENDPOINT,
    projectId: import.meta.env.VITE_APPRWITE_PROJECT_ID,
    databaseId: import.meta.env.VITE_APPWRITE_DATABASE_ID,
    userCollectionId: import.meta.env.VITE_APPWRITE_USERS_COLLECTION_ID,
    tripCollectionId: import.meta.env.VITE_APPWRITE_TRIPS_COLLECTION_ID,
};

const client = new Client()
.setEndpoint(appwriteConfig.endpointUrl)
.setProject(appwriteConfig.projectId)

const account = new Account(client);
const database = new Databases(client);
const storage = new Storage(client);

export {client, account, database, storage};
// Remove database/storage exports - these will be backend-only