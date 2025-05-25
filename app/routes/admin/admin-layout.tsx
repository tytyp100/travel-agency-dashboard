<<<<<<< HEAD
import React from "react";
import { Outlet } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../components";

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
=======
import React from "react";
import { Outlet } from "react-router";
import { SidebarComponent } from "@syncfusion/ej2-react-navigations";
import { MobileSidebar, NavItems } from "../../components";

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
>>>>>>> a8f8ff58acb94451f700fadcb2dbd9b6edc2a1cc
