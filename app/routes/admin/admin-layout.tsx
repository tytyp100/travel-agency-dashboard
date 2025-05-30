import React from "react";
import { Outlet } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../components";
import { account } from "~/appwrite/client";
import { redirect } from "react-router";
import { getExistingUser, storeUserData } from "~/appwrite/auth";
import type { Models } from "appwrite";

export async function clientLoader() {
  try {
    const user = await account.get();
    if (!user.$id) {
      return redirect("/sign-in");
    }

    let existingUser = await getExistingUser(user.$id);

    // If user doesn't exist, create them first
    if (!existingUser?.$id) {
      const newUser = await storeUserData();
      if (!newUser) {
        return redirect("/sign-in");
      }
      existingUser = newUser;
    }

    // Now check status - this ensures we check even after creating a new user
    if (!existingUser || existingUser.status === "user") {
      return redirect("/");
    }

    return existingUser;
  } catch (e) {
    console.error("Error in clientLoader:", e);
    return redirect("/sign-in");
  }
}

const AdminLayout = () => {
  return (
    <div className="admin-layout">
      <MobileSidebar />
      <aside
        className="w-full max-w-[270px] hidden
  lg:block"
      >
        <SidebarComponent width={270} enableGestures={false}>
          <NavItems />
        </SidebarComponent>
      </aside>

      <aside className="children">
        <Outlet />
      </aside>
    </div>
  );
};

export default AdminLayout;
