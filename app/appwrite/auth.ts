import { Databases, ID, OAuthProvider, Query } from "appwrite";
import { account, database, appwriteConfig } from "~/appwrite/client";
import { redirect } from "react-router";

export const getExistingUser = async (id: string) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/${id}`);
    return await res.json();
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};


export const storeUserData = async () => {
  try {
    const user = await account.get();
    if (!user) throw new Error("User not found");

    const { providerAccessToken } = await account.getSession("current");
    const profilePicture = providerAccessToken
      ? await getGooglePicture(providerAccessToken)
      : null;

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accountId: user.$id,
        email: user.email,
        name: user.name,
        imageUrl: profilePicture
      }),
    });

    const createdUser = await res.json();
    return createdUser;
  } catch (error) {
    console.error("Error storing user data:", error);
    return null;
  }
};


const getGooglePicture = async (accessToken: string) => {
  try {
    const response = await fetch(
      "https://people.googleapis.com/v1/people/me?personFields=photos",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!response.ok) throw new Error("Failed to fetch Google profile picture");

    const { photos } = await response.json();
    return photos?.[0]?.url || null;
  } catch (error) {
    console.error("Error fetching Google picture:", error);
    return null;
  }
};

export const loginWithGoogle = async () => {
  try {
    account.createOAuth2Session(
      OAuthProvider.Google,
      `${window.location.origin}/`,
      `${window.location.origin}/404`
    );
  } catch (error) {
    console.error("Error during OAuth2 session creation:", error);
  }
};

export const logoutUser = async () => {
  try {
    await account.deleteSession("current");
  } catch (error) {
    console.error("Error during logout:", error);
  }
};

export const getUser = async () => {
  try {
    // First verify we have a valid session
    const session = await account.getSession('current');
    if (!session) {
      console.log("No session found");
      return null; // Return null instead of redirect
    }

    // Then get the user account
    const user = await account.get();
    console.log("Appwrite user:", user);
    
    if (!user) {
      console.log("No user account found");
      return null;
    }

    const apiUrl = `${import.meta.env.VITE_API_BASE_URL}/api/user/${user.$id}`;
    console.log("Making request to:", apiUrl);
    
    const res = await fetch(apiUrl, {
      headers: {
        'Authorization': `Bearer ${session.secret}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!res.ok) {
      console.error("API Error:", res.status, res.statusText);
      return null;
    }
    
    return await res.json();
    
  } catch (error) {
    console.error("Full Error:", error);
    return null;
  }
};

export const getAllUsers = async (limit: number, offset: number) => {
  try {
    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/users?limit=${limit}&offset=${offset}`);
    const { users, total } = await res.json();

    if (total === 0) return {
        users: [],
        total
    };

    return {users, total};
    
  } catch (error) {
    console.log('Error fetching useres');
    return {
      users: [],
      total: 0,
    };
  }
};

export const becomeAdmin = async () => {
  try {
    const user = await account.get();
    if (!user) return redirect("/sign-in");

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/${user.$id}/admin`, {
      method: "PATCH"
    });

    return await res.json();
  } catch (error) {
    console.error("Error becoming admin:", error);
    return null;
  }
};

export const displayStatus = async () => {
  try {
    const user = await account.get();
    if (!user) return redirect("/sign-in");

    const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/${user.$id}/status`);
    const data = await res.json();

    return data.status || redirect("/sign-in");
  } catch (error) {
    console.error("Error fetching user status:", error);
    return null;
  }
};