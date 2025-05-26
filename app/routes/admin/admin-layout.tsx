import React from "react";
import { Outlet } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../components";
import { account } from "~/appwrite/client";
import { redirect } from "react-router";
import { getExistingUser, storeUserData } from "~/appwrite/auth";

export async function clientLoader() {
  try {
    console.log("PART 0");
    const user = await account.get();
    console.log("PART 0.5");
    if (!user.$id) {
      return redirect("/sign-in");
    }
    console.log("PART 1");
    const existingUser = await getExistingUser(user.$id);
    console.log("PART 2");
    if (existingUser?.status === "user") {
      return redirect("/");
    }
    return existingUser?.$id ? existingUser : await storeUserData;
  } catch (e) {
    console.log("Error in clientLoader ", e);
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
