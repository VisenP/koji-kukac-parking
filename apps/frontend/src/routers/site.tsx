import { RouteObject } from "react-router";

import { AdminPage } from "../pages/admin/AdminPage";
import { MapPage } from "../pages/MapPage";

export const siteRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MapPage />,
    },
    {
        path: "/admin",
        element: <AdminPage />,
    },
];
