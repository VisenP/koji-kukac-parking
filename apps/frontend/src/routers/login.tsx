import { RouteObject } from "react-router";

import { MapPage } from "../pages/MapPage";

export const loginRoutes: RouteObject[] = [
    {
        path: "/",
        element: <MapPage />,
        children: [],
    },
];
