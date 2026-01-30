"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, LoginInput } from "@/schemas/auth.schema";
import { useAuth } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";
import style from "./login.module.scss";

export function LoginForm() {
  const { login, isLoggingIn, loginError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <div className={style.loginWrapper}>
      <div className={style.container}>
        <div className={style.header}>
          <div className={style.header_first}>
            <h1 className={style.header_logo}>ESSENCE</h1>
            <p className={style.header_logo_paragraph}>Parfumerie de Luxe</p>
          </div>
          <div className={style.header_second}>
            <h3 className={style.header_second_first}>Welcome</h3>
            <p className={style.header_second_second}>
              Please log in to your account to continue.
            </p>
          </div>
        </div>

        {loginError && (
          <div className={style.errorMessage}>
            <p>{getErrorMessage(loginError)}</p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className={style.form}>
          <div className={style.form_input}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              {...register("email")}
              placeholder="example@example.com"
            />
            {errors.email && (
              <p className={style.error}>{errors.email.message}</p>
            )}
          </div>

          <div className={style.form_input}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              {...register("password")}
              placeholder="••••••••"
            />
            {errors.password && (
              <p className={style.error}>{errors.password.message}</p>
            )}
          </div>

          <button type="submit" disabled={isLoggingIn}>
            {isLoggingIn ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className={style.bottom_form}>
          <p className={style.bottom_wrap}>
            Don't have an account? <Link href="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}