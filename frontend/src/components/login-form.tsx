"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginAction } from "@/app/(auth)/actions";

interface FormInputs {
  email: string;
  password: string;
}

const schema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
});

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInputs>({
    resolver: yupResolver(schema),
  });
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (data: FormInputs) => {
    try {
      const formData = new FormData();
      formData.append("email", data.email);
      formData.append("password", data.password);

      const result = await loginAction(formData);

      if (result?.success === false) {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      const e = error as Error;
      setError(e.message);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
            admin@example.com:admin
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                {errors.email && (
                  <span className="text-red-600/80 text-xs capitalize">
                    {errors.email.message}
                  </span>
                )}
                <Input
                  placeholder="Email"
                  {...register("email", {
                    required: true,
                  })}
                />
              </div>
              <div className="grid gap-3">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  {/* <a */}
                  {/*   href="#" */}
                  {/*   className="ml-auto inline-block text-sm underline-offset-4 hover:underline" */}
                  {/* > */}
                  {/*   Forgot your password? */}
                  {/* </a> */}
                </div>
                {errors.password && (
                  <span className="text-red-600/80 text-xs capitalize">
                    {errors.password.message}
                  </span>
                )}
                <Input
                  type="password"
                  placeholder="Password"
                  {...register("password", { required: true })}
                />
              </div>
              <div className="flex flex-col gap-3">
                {error ? (
                  <span className="text-red-600/80 text-xs capitalize">
                    {error}
                  </span>
                ) : null}
                <Button type="submit" className="w-full hover:cursor-pointer">
                  Login
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
