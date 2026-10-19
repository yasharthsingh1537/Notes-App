import Login from "../components/auth/Login";
import Signup from "../components/auth/Signup";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";

export default function Auth() {
  return (
    <main className="flex min-h-screen items-center justify-center px-4 pt-20 duration-300">
      <div className="flex w-full max-w-md flex-col items-center justify-center gap-8">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">Welcome to Notes App</h1>
          <p className="text-muted-foreground">
            Sign in or create an account to start managing your notes.
          </p>
        </div>

        <Tabs defaultValue="login" className="w-full min-h-136.5">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="animate-in fade-in-0 duration-300">
            <Login />
          </TabsContent>
          <TabsContent value="signup" className="animate-in fade-in-0 duration-300">
            <Signup />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
