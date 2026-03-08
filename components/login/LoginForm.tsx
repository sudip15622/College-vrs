"use client";
import { LoginSchema, LoginType } from "@/lib/schemas/login";
import { useForm, Controller, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { LoginAction } from "@/lib/actions/auth";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo") || "/";
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginType>({
    resolver: zodResolver(LoginSchema),
    mode: "onChange",
    reValidateMode: "onSubmit",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit: SubmitHandler<LoginType> = async(data) => {
      if(isSubmitting) return;
  
      try {
        const response = await LoginAction(data);
  
        if(response.success) {
          toast.success(response.message || "Logged in successfully!");
          reset();
          router.push(returnTo);
          router.refresh();
        } else {
          toast.error(response.error || "Failed to login");
        }
      } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred. Please try again");
      }
    };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 w-full"
    >
      <div className="flex flex-col gap-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">
          Email
        </label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="email"
              type="email"
              placeholder="Enter your email"
              aria-invalid={!!errors.email}
              className={errors.email ? "border-destructive" : ""}
            />
          )}
        />
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="password" className="text-sm font-medium text-foreground">
          Password
        </label>
        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              id="password"
              type="password"
              placeholder="Enter your password"
              aria-invalid={!!errors.password}
              className={errors.password ? "border-destructive" : ""}
            />
          )}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      <Button type="submit" variant="default" size="lg" disabled={isSubmitting} className="w-full">
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
