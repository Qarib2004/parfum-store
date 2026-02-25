'use client'
import { useAuth } from "@/hooks/useAuth";
import { RegisterInput, registerSchema } from "@/schemas/auth.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import style from "./register.module.scss";
import { getErrorMessage } from "@/lib/utils";
import Link from "next/link";

export function RegisterForm() {
  const { register: registerUser, isRegistering, registerError } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = (data: RegisterInput) => {
    registerUser(data);
  };

  return (
    <div className={style.bg}>
      <div className={style.card}>
      <div className={style.brand}>
          <p className={style.logo}>ESSENCE</p>
          <p className={style.tagline}>Parfumerie de Luxe</p>
        </div>

        <div className={style.heading}>
          <h2>Create account</h2>
          <p>Fill out the registration form</p>
        </div>

      {registerError && (
        <div>
          <p className={style.fieldError}>{getErrorMessage(registerError)}</p>
        </div>
      )}

      <form className={style.form} onSubmit={handleSubmit(onSubmit)}>
        <div className={style.field}>
          <label htmlFor="username">Username</label>
          <input type="text" {...register("username")} placeholder="Nick" />
          {errors.username && <p>{errors.username.message}</p>}
        </div>

        <div className={style.field}> 
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            {...register("email")}
            placeholder="example@email.com"
          />
          {errors.email && <p className={style.fieldError}>{errors.email.message}</p>}
        </div>

        <div className={style.field}>
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            {...register("password")}
            placeholder="••••••••"
          />
          {errors.password && <p className={style.fieldError}>{errors.password.message}</p>}
          <p className={style.fieldHint}>Minimum 8 characters, including a capital letter and a number </p>
        </div>

        <button className={style.btn} type="submit" disabled={isRegistering}>
          {isRegistering ? "Registration..." : "Register"}
        </button>
      </form>

      <div className={style.footer}>
        <p>
          Already have an account? <Link href="/login">Login</Link>
        </p>
      </div>
    </div>
    </div>
  );
}
