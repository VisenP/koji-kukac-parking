import { RouteObject } from "react-router";

import { LoginPage } from "../pages/auth/LoginPage";

export const loginRoutes: RouteObject[] = [
    {
        path: "/",
        element: <LoginPage />,
        children: [],
    },
];
