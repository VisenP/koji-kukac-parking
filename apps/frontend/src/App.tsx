import "twin.macro";
import "./globals.scss";

import { User } from "@parking/models";
import { useEffect } from "react";
import Modal from "react-modal";
import { useQueryClient } from "react-query";
import { useRoutes } from "react-router";

import { http, wrapAxios } from "./api/http";
import { loginRoutes } from "./routers/login";
import { siteRoutes } from "./routers/site";
import { useAuthStore } from "./state/auth";
import { useTokenStore } from "./state/token";

Modal.setAppElement("#root");

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const App = () => {
    const { isLoggedIn, setUser, setIsLoggedIn, doForceLogout } = useAuthStore();
    const { token, setToken } = useTokenStore();

    const queryClient = useQueryClient();

    useEffect(() => {
        if (token.length === 0) {
            setIsLoggedIn(false);
            queryClient.clear();

            return;
        }

        wrapAxios<User>(http.get("/auth"))
            .then((data) => {
                setUser(data);
                setIsLoggedIn(true);
            })
            .catch(() => doForceLogout());
    }, [token]);

    if (!token || token.length === 0 || !isLoggedIn) return useRoutes(loginRoutes);

    return useRoutes(siteRoutes);
};
