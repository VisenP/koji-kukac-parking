import { RouteObject } from "react-router";

import { MyMap } from "../components/MapComponent";

export const loginRoutes: RouteObject[] = [
    {
        path: "/",
        element: (
            <div>
                <MyMap /> world!
            </div>
        ),
        children: [],
    },
];
