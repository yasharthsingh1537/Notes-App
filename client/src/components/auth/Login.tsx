import { useState } from "react";
import { Button } from "../ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Eye, EyeOff } from "lucide-react";
import { Label } from "../ui/label";
import axios from "axios";
import api from "../../services/api";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

type LoginFormData = {
  email: string;
  password: string;
};

type LoginErrors = Partial<Record<keyof LoginFormData, string>> & {
  form?: string;
};

type LoginResponse = {
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

export default function Login() {
  const navigate = useNavigate();
  const { setUser } = useAuth();

  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginErrors>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    if (name !== "email" && name !== "password") return;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  }

  function validateForm() {
    const nextErrors: LoginErrors = {};
    const email = formData.email.trim();

    if (!email) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      nextErrors.email = "Please enter a valid email format";
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

    const validateErrors = validateForm();
    setErrors(validateErrors);

    if (Object.keys(validateErrors).length > 0) return;

    setLoading(true);

    try {
      const response = await api.post<LoginResponse>("auth/login", {
        email: formData.email.trim(),
        password: formData.password,
      });

      localStorage.setItem("token", response.data.token);
      setUser(response.data.user);
      navigate("/notes", { replace: true });
    } catch (error: unknown) {
      if (axios.isAxiosError<{ message?: string }>(error)) {
        const status = error.response?.status;

        if (status === 401) {
          setErrors({
            form: "Invalid email or password.",
          });
        } else if (error.response?.data?.message) {
          setErrors({
            form: error.response.data.message,
          });
        } else {
          setErrors({
            form: "Unable to connect to the server.",
          });
        }
      } else {
        setErrors({
          form: "An unexpected error occured. Please try again",
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Welcome Back!!</CardTitle>
        <CardDescription>Enter your credentials to access your notes.</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleInputChange}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "login-email-error" : undefined}
              required
            />

            {errors.email && (
              <p id="login-email-error" className="text-sm text-destructive">
                {errors.email}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <div className="flex gap-2">
              <Input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="Enter Password"
                value={formData.password}
                onChange={handleInputChange}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "login-password-error" : undefined}
                required
              />

              <Button
                type="button"
                // size="icon"
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </Button>
            </div>

            {errors.password && (
              <p id="login-password-error" className="text-sm text-destructive">
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
          <Button className="w-full" type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Log in"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
