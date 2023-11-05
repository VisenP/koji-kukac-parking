import React, { FC, useState } from "react";
import { useNavigate } from "react-router";

import { http } from "../../api/http";
import { useTokenStore } from "../../state/token";

export const LoginPage: FC = () => {
    const navigate = useNavigate();

    const handleRedirectRegister = () => {
        navigate("/register"); // Navigate to the '/about' route
    };

    const { setToken } = useTokenStore();

    const handleLogin = async () => {
        const response: {
            token: string;
        } = await http
            .post("/auth/login", {
                email: email,
                password: password,
            })
            .then((r) => r.data.data);

        const { token } = response;

        setToken(token);
    };

    const handleRegister = async () => {
        if (password !== confirmPassword) return;

        const response: {
            token: string;
        } = await http
            .post("/auth/register", {
                email: email,
                username: userName,
                password: password,
            })
            .then((r) => r.data.data);

        setRegister(false);
    };

    const [register, setRegister] = useState(false);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userName, setUserName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    return (
        <div tw="flex justify-center items-center h-full mt-10">
            <div tw={"bg-white border-2 border-solid border-neutral-200 rounded-lg p-5 shadow-2xl"}>
                <h2 tw={"mb-4"}>{register ? "Register" : "Login"}</h2>
                <form>
                    <div tw={"mb-4 flex flex-col gap-2"}>
                        <span>Email:</span>
                        <input
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                            type="text"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                        />
                    </div>
                    {register && (
                        <div tw={"mb-4 flex flex-col gap-2"}>
                            <span>Username:</span>
                            <input
                                tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                                type="text"
                                value={userName}
                                onChange={(event) => setUserName(event.target.value)}
                            />
                        </div>
                    )}
                    <div tw={"mb-4 flex flex-col gap-2"}>
                        <span>Password:</span>
                        <input
                            tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                        />
                    </div>
                    {register && (
                        <div tw={"mb-4 flex flex-col gap-2"}>
                            <span>Confirm password:</span>
                            <input
                                tw={"border-2 border-solid border-neutral-200 rounded-lg p-2"}
                                type="password"
                                value={confirmPassword}
                                onChange={(event) => setConfirmPassword(event.target.value)}
                            />
                        </div>
                    )}
                    <button
                        type="button"
                        tw={
                            "inline px-5 py-4 bg-blue-500 text-white border-0 rounded-md cursor-pointer hover:bg-blue-600 hover:transition-all ease-linear"
                        }
                        onClick={register ? handleRegister : handleLogin}
                    >
                        {register ? "Register" : "Login"}
                    </button>
                </form>
                <p>
                    <span>
                        {" "}
                        {!register
                            ? "You dont have an account? Register"
                            : "You already have an account? Login"}{" "}
                    </span>
                    <span tw={"underline cursor-pointer"} onClick={() => setRegister(!register)}>
                        here
                    </span>
                    .
                </p>
            </div>
        </div>
    );
};
