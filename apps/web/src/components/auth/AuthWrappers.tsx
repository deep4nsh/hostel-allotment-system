"use client";

import dynamic from "next/dynamic";

export const LoginFormNoSSR = dynamic(
    () => import("./LoginForm").then((mod) => mod.LoginForm),
    { ssr: false }
);

export const RegisterFormNoSSR = dynamic(
    () => import("./RegisterForm").then((mod) => mod.RegisterForm),
    { ssr: false }
);
