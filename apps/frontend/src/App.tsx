import "twin.macro";
import "./globals.scss";

import { User } from "@kontestis/models";
import React, { useEffect } from "react";
import Modal from "react-modal";
import { useQueryClient } from "react-query";

import { http, wrapAxios } from "./api/http";
import { useAuthStore } from "./state/auth";
import { useTokenStore } from "./state/token";

Modal.setAppElement("#root");

BigInt.prototype.toJSON = function () {
    return this.toString();
};

export const App = () => {
    const { isLoggedIn, setUser, setIsLoggedIn, doForceLogout } = useAuthStore();
    const { token } = useTokenStore();

    const queryClient = useQueryClient();

    useEffect(() => {
        if (token.length === 0) {
            setIsLoggedIn(false);
            queryClient.clear();

            return;
        }

        wrapAxios<User>(http.get("/auth/info"))
            .then((data) => {
                setUser(data);
                setIsLoggedIn(true);
            })
            .catch(() => doForceLogout());
    }, [token]);

    if (token.length > 0 && !isLoggedIn) return <></>;

    return null;
};
