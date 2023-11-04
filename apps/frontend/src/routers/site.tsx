import { RouteObject } from "react-router";

import { MapPage } from "../pages/MapPage";

export const siteRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MapPage />,
        children: [],
    },
];
