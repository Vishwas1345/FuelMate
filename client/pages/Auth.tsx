import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { LogoIcon } from "@/components/Logo";
import { ArrowRight } from "lucide-react";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";

export default function Auth() {
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string>("");
  const [signupError, setSignupError] = useState<string>("");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { login, signup } = useAuth();

  // Clear errors when switching tabs
  const handleTabChange = (value: string) => {
    setLoginError("");
    setSignupError("");
  };

  // Redirect /login to /auth
  useEffect(() => {
    if (location.pathname === '/login') {
      navigate('/auth', { replace: true });
    }
  }, [location.pathname, navigate]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await login(email, password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      setLoginError(error.message || "Failed to login");
      toast({
        title: "Login failed",
        description: error.message || "Failed to login",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setSignupError("");

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("signup-email") as string;
    const password = formData.get("signup-password") as string;
    const confirmPassword = formData.get("confirm-password") as string;

    if (password !== confirmPassword) {
      setSignupError("Passwords do not match");
      toast({
        title: "Signup failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setSignupError("Password must be at least 6 characters long");
      toast({
        title: "Signup failed",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await signup(name, email, password);
      // Navigation is handled in AuthContext
    } catch (error: any) {
      const errorMessage = error.message || "An error occurred while creating your account";
      setSignupError(errorMessage);
      toast({
        title: "Signup failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full space-y-8 relative z-10">
        <div className="text-center">
          <Link to="/" className="flex items-center justify-center gap-2 hover:opacity-80 transition-opacity inline-flex">
            <LogoIcon className="w-8 h-8 text-orange-500" />
            <h2 className="text-3xl font-extrabold text-white">FuelMate</h2>
          </Link>
          <p className="mt-2 text-sm text-slate-400">
            Manage your fuel orders efficiently
          </p>
        </div>
        <Tabs defaultValue="login" className="w-full" onValueChange={handleTabChange}>
          <TabsList className="grid w-full grid-cols-2 bg-slate-900">
            <TabsTrigger value="login" className="text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white">Login</TabsTrigger>
            <TabsTrigger value="signup" className="text-slate-300 data-[state=active]:bg-slate-800 data-[state=active]:text-white">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Login to your account</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-300">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-slate-300">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Enter your password"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm mt-2">{loginError}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-400">Or continue with</span>
                    </div>
                  </div>
                  <div className="mt-4 space-y-3">
                    <GoogleSignInButton />

                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="link" className="text-sm text-slate-400 hover:text-orange-500">
                  Forgot password?
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card className="bg-slate-900/80 backdrop-blur-xl border-slate-800 shadow-xl">
              <CardHeader>
                <CardTitle className="text-white">Create an account</CardTitle>
                <CardDescription className="text-slate-400">
                  Enter your details to create a new account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="text-slate-300">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email" className="text-slate-300">Email</Label>
                    <Input
                      id="signup-email"
                      name="signup-email"
                      type="email"
                      placeholder="Enter your email"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-slate-300">Password</Label>
                    <Input
                      id="signup-password"
                      name="signup-password"
                      type="password"
                      placeholder="Create a password (min. 6 characters)"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-slate-300">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      name="confirm-password"
                      type="password"
                      placeholder="Confirm your password"
                      required
                      className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-orange-500 text-sm placeholder:text-xs md:text-sm md:placeholder:text-sm"
                    />
                  </div>
                  {signupError && (
                    <div className="text-red-500 text-sm mt-2">{signupError}</div>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white"
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </form>
                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-slate-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-slate-900 text-slate-400">Or sign up with</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <GoogleSignInButton text="Sign up with Google" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 