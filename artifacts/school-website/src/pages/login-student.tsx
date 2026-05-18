import { MainLayout } from "@/components/layout/main-layout";
import { useLogin } from "@workspace/api-client-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { School, User, Lock } from "lucide-react";
import { Link, useLocation } from "wouter";

const loginSchema = z.object({
  username: z.string().min(3, "Username is required"),
  password: z.string().min(6, "Password is required"),
});

export default function LoginStudent() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const login = useLogin();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    login.mutate({
      data: {
        username: values.username,
        password: values.password,
        role: "student",
      }
    }, {
      onSuccess: () => {
        toast({
          title: "Login Successful",
          description: "Welcome to the student portal.",
        });
        setLocation("/portal/student");
      },
      onError: () => {
        toast({
          title: "Login Failed",
          description: "Invalid credentials. Please try again.",
          variant: "destructive",
        });
      }
    });
  }

  return (
    <MainLayout>
      <div className="min-h-[80vh] flex items-center justify-center bg-muted/30 py-12 px-4 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[50%] bg-primary/5 rounded-full blur-3xl rounded-full" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[50%] bg-accent/5 rounded-full blur-3xl rounded-full" />
        
        <Card className="w-full max-w-md shadow-2xl border-t-4 border-t-primary relative z-10">
          <CardHeader className="text-center pb-8 pt-10">
            <div className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <School className="w-10 h-10 text-primary" />
            </div>
            <CardTitle className="text-3xl font-serif text-primary">Student Portal</CardTitle>
            <CardDescription className="text-base mt-2">
              Sign in with your student credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Student ID / Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input placeholder="Enter your ID" className="pl-10 h-12" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input type="password" placeholder="Enter password" className="pl-10 h-12" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-md" disabled={login.isPending}>
                  {login.isPending ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center border-t py-6 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Are you a staff member? <Link href="/login/staff" className="text-primary font-bold hover:underline">Staff Login</Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </MainLayout>
  );
}
