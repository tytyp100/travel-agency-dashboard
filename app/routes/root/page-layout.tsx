import React from "react";
import { Link, redirect, useNavigate } from "react-router";
import {
  getUser,
  logoutUser,
  becomeAdmin,
  displayStatus,
  storeUserData,
} from "~/appwrite/auth";

type User = {
  name: string;
  email: string;
  imageUrl: string | null;
  joinedAt: string;
  accountId: string;
};

type LoaderData = {
  user: User | null;
  status: string | null;
};

export const clientLoader = async () => {
  try {
    console.log("PageLayout loader: Starting...");
    const userData = await getUser();
    console.log("PageLayout loader: userData received:", userData);

    // Handle redirect case
    if (userData && typeof userData === "object" && userData.redirect) {
      console.log("PageLayout loader: Redirecting to:", userData.redirect);
      return redirect(userData.redirect);
    }

    // Handle successful user data
    if (userData && userData.accountId) {
      console.log("PageLayout loader: User data found, returning user");
      return {
        user: {
          name: userData.name,
          email: userData.email,
          imageUrl: userData.imageUrl,
          joinedAt: userData.joinedAt,
          accountId: userData.accountId,
        },
        status: userData.status || "user",
      };
    }

    // If no user data, try to store user data for first-time users
    console.log(
      "PageLayout loader: No user data, attempting to store user data"
    );
    const storedUser = await storeUserData();
    console.log("PageLayout loader: storedUser result:", storedUser);

    if (storedUser && storedUser.accountId) {
      console.log(
        "PageLayout loader: User data stored successfully, returning user"
      );
      return {
        user: {
          name: storedUser.name,
          email: storedUser.email,
          imageUrl: storedUser.imageUrl,
          joinedAt: storedUser.joinedAt,
          accountId: storedUser.accountId,
        },
        status: storedUser.status || "user",
      };
    }

    // Fallback to sign-in if no valid data
    console.log(
      "PageLayout loader: No valid user data, redirecting to sign-in"
    );
    return redirect("/sign-in");
  } catch (error) {
    console.error("PageLayout loader error:", error);
    return redirect("/sign-in");
  }
};

const PageLayout = ({ loaderData }: { loaderData: LoaderData }) => {
  console.log("Full loaderData:", JSON.stringify(loaderData, null, 2));
  const user = loaderData?.user;
  const status = loaderData?.status;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };

  const handleAdmin = async () => {
    await becomeAdmin();
    window.location.reload();
  };

  // Show loading state if user data is missing
  if (!user) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </main>
    );
  }
  return (
    <main className="min-h-screen flex flex-col">
      {/* Setting full background image */}
      <section
        className="flex-1 bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center text-white text-center px-4 py-16 relative"
        style={{ backgroundImage: "url('/assets/images/hero-img.png')" }}
      >
        {/* Navigation bar positioned absolutely at the top */}
        <div className="absolute top-0 left-0 w-full p-4">
          <Link to="/" className="flex items-center gap-3 w-fit">
            <img
              src="/assets/icons/logo.svg"
              alt="logo"
              className="size-[30px]"
            />
            <h1 className="p-28-bold text-white">Tourvisto</h1>
          </Link>
        </div>

        <article className="max-w-xl bg-black/50 p-6 rounded-2xl shadow-lg">
          <h2 className="text-3xl font-bold mb-4">Welcome to Tourvisto</h2>
          <p className="mb-6 text-lg">
            {`Welcome ${user?.name}! Tourvisto is a platform that allows you to create your own
            personalized travel plans using AI!`}
          </p>
          <p className="mb-6 text-lg">
            {`You are currently logged in as a ${status}! You may only access the dashboard and user info if you are an admin.`}
          </p>

          {/* Centered Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/trips")}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-blue-700 transition"
            >
              Get Started
            </button>

            <button
              onClick={handleLogout}
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold shadow hover:bg-red-700 transition"
            >
              Log Out
            </button>
          </div>
        </article>
      </section>
    </main>
  );
};

export default PageLayout;
