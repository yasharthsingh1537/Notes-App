import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import axios from "axios";
import api from "../../services/api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

type SignupFormData = {
  name: string;
  email: string;
  password: string;
};

type SignupErrors = Partial<Record<keyof SignupFormData, string>> & {
  form?: string;
};

type SignupResponse = {
  message: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
};

export default function Signup() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<SignupFormData>({
    name: "",
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<SignupErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name !== "name" && name !== "email" && name !== "password") {
      return;
    }

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [name]: undefined,
      form: undefined,
    }));
  }

  function validateForm(): SignupErrors {
    const nextErrors: SignupErrors = {};
    const name = formData.name.trim();
    const email = formData.email.trim();

    if (!name) {
      nextErrors.name = "Name is required.";
    }

    if (!email) {
      nextErrors.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email address.";
    }

    if (!formData.password) {
      nextErrors.password = "Password is required.";
    } else if (
      !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
        formData.password,
      )
    ) {
      nextErrors.password =
        "Password must be at least 8 characters and contain an uppercase letter, a lowercase letter, a number, and a special character (@$!%*?&).";
    }

    return nextErrors;
  }

  async function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateForm();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await api.post<SignupResponse>("/auth/signup", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/notes", { replace: true });
    } catch (error: unknown) {
      let message = "Unable to create account. Please try again.";

      if (axios.isAxiosError<{ message?: string }>(error)) {
        message =
          error.response?.data?.message ??
          (error.request ? "Cound not reach the server." : error.message);
      }

      setErrors({ form: message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Sign up to start organizing your notes.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="signup-name">Name</Label>
            <Input
              id="signup-name"
              name="name"
              type="text"
              autoComplete="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? "signup-name-error" : undefined}
              required
            />
            {errors.name && (
              <p id="signup-name-error" className="text-sm text-destructive">
                {errors.name}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-email">Email</Label>
            <Input
              id="signup-email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "signup-email-error" : undefined}
              required
            />
            {errors.email && (
              <p id="signup-email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-password">Password</Label>

            <div className="flex gap-2">
              <Input
                id="signup-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "signup-password-error" : undefined}
                required
              />

              <Button
                type="button"
                size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            {errors.password && (
              <p id="signup-password-error" className="text-sm text-destructive">
                {errors.password}
              </p>
            )}
          </div>

          {errors.form && (
            <p role="alert" className="text-sm text-destructive">
              {errors.form}
            </p>
          )}
        </CardContent>

        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
