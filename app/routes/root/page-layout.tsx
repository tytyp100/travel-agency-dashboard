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
    const userData = await getUser();

    // Handle redirect case
    if (userData && typeof userData === "object" && userData.redirect) {
      return redirect(userData.redirect);
    }

    // Handle successful user data
    if (userData && userData.accountId) {
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

    // No user data found - try to create new user
    console.log("No user data found, attempting to store new user");
    const newUser = await storeUserData();
    
    if (newUser && newUser.accountId) {
      return {
        user: {
          name: newUser.name,
          email: newUser.email,
          imageUrl: newUser.imageUrl,
          joinedAt: newUser.joinedAt,
          accountId: newUser.accountId,
        },
        status: newUser.status || "user",
      };
    }

    // Fallback to sign-in if user creation failed
    return redirect("/sign-in");
  } catch (error) {
    console.error("Loader error:", error);
    return redirect("/sign-in");
  }
};

const PageLayout = ({ loaderData }: { loaderData: LoaderData }) => {
  const user = loaderData?.user;
  const status = loaderData?.status;
  const navigate = useNavigate();
  const handleLogout = async () => {
    await logoutUser();
    navigate("/sign-in");
  };
  const handleAdmin = async () => {
    becomeAdmin();
  };
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
            {`You are currently logged in as a ${status}! You may access the dashboard if you are an admin.`}
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
