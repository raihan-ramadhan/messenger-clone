"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { BsGithub, BsGoogle } from "react-icons/bs";
import { useCallback, useEffect, useState } from "react";
import { useForm, FieldValues, SubmitHandler } from "react-hook-form";

import Input from "@/app/components/inputs/Input";
import Button from "@/app/components/Button";
import AuthSocialButton from "./AuthSocialButton";

type Variant = "LOGIN" | "REGISTER";

const AuthForm: React.FC = () => {
  const searchParams = useSearchParams();
  const session = useSession();
  const router = useRouter();

  const isRegister = searchParams?.get("register");
  const [variant, setVariant] = useState<Variant>(
    isRegister ? "REGISTER" : "LOGIN"
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (session?.status == "authenticated") {
      router.push("/users");
    }
  }, [session?.status, router]);

  const toggleVariant = useCallback(() => {
    if (variant === "LOGIN") {
      setVariant("REGISTER");
      router.push("/?register=true");
    } else {
      setVariant("LOGIN");
      router.push("/");
    }
  }, [variant, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FieldValues>({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    setIsLoading(true);

    if (variant == "REGISTER") {
      axios
        .post("/api/register", data)
        .then(async () => {
          await signIn("credentials", data);
        })
        .catch(() => toast.error("Something Wrong"))
        .finally(() => setIsLoading(false));
    }

    if (variant == "LOGIN") {
      signIn("credentials", {
        ...data,
        redirect: false,
      })
        .then((callback) => {
          if (callback?.error) {
            toast.error("Invalid Credential");
          }

          if (callback?.ok && !callback.error) {
            toast.success("Logged in!");
            router.push("/users");
          }
        })
        .finally(() => setIsLoading(false));
    }
  };

  const socialAction = (action: string) => {
    setIsLoading(true);

    signIn(action, { redirect: false })
      .then((callback) => {
        if (callback?.error) {
          toast.error("Invalid credentials");
        }

        if (callback?.ok && callback.error) {
          toast.success("Logged in!");
        }
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="mt-5 sm:mt-8 flex-1 max-w-md">
      <div className="bg-white py-8 shadow rounded-lg px-10">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {variant === "REGISTER" && (
            <Input
              label="Name"
              register={register}
              id="name"
              errors={errors}
              disabled={isLoading}
            />
          )}
          <Input
            label="Email"
            register={register}
            id="email"
            errors={errors}
            type="email"
            disabled={isLoading}
          />
          <Input
            label="Password"
            register={register}
            id="password"
            errors={errors}
            type="password"
            disabled={isLoading}
          />
          <Button disabled={isLoading} fullWidth type="submit">
            {variant == "LOGIN" ? "Sig in" : "Register"}
          </Button>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-2 text-gray-500">
                or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col xs:flex-row gap-2">
            <AuthSocialButton
              icon={BsGithub}
              onClick={() => socialAction("github")}
            />
            <AuthSocialButton
              icon={BsGoogle}
              onClick={() => socialAction("google")}
            />
          </div>
        </div>
        <div className="flex gap-2 justify-center text-sm mt-6 px-2 text-gray-500">
          <span>
            {variant === "LOGIN"
              ? "New to Messenger?"
              : "Already have an account"}
          </span>
          <span onClick={toggleVariant} className="underline cursor-pointer">
            {variant == "LOGIN" ? "Create an account" : "Login"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
