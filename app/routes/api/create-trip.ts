import { GoogleGenerativeAI } from "@google/generative-ai";
import { data, type ActionFunctionArgs } from "react-router";
import { database } from "~/appwrite/client";
import { parseMarkdownToJson } from "~/lib/utils";
import { appwriteConfig } from "~/appwrite/client";
import { ID } from "appwrite";

export const action = async ({ request }: ActionFunctionArgs) => {
  const {
    country,
    numberOfDays,
    travelStyle,
    interests,
    budget,
    groupType,
    userId
  } = await request.json();

  try {
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/generate-trip`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        country,
        numberOfDays,
        travelStyle,
        interests,
        budget,
        groupType,
        userId
      })
    });

    const { trip, imageUrls } = await response.json();

    const result = await database.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.tripCollectionId,
      ID.unique(),
      {
        tripDetail: JSON.stringify(trip),
        createdAt: new Date().toISOString(),
        imageUrls,
        userId
      }
    );

    return data({ id: result.$id });
  } catch (e) {
    console.error("Error generating travel plan: ", e);
    return null;
  }
};
