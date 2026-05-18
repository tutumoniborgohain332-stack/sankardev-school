import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Home from "@/pages/home";
import About from "@/pages/about";
import Academics from "@/pages/academics";
import Staff from "@/pages/staff";
import News from "@/pages/news";
import Contact from "@/pages/contact";
import Gallery from "@/pages/gallery";
import Admission from "@/pages/admission";
import LoginStudent from "@/pages/login-student";
import LoginStaff from "@/pages/login-staff";
import PortalStudent from "@/pages/portal-student";
import PortalStaff from "@/pages/portal-staff";
import AdminPage from "@/pages/admin/index";
import Results from "@/pages/results";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/academics" component={Academics} />
      <Route path="/staff" component={Staff} />
      <Route path="/news" component={News} />
      <Route path="/contact" component={Contact} />
      <Route path="/gallery" component={Gallery} />
      <Route path="/admission" component={Admission} />
      <Route path="/login/student" component={LoginStudent} />
      <Route path="/login/staff" component={LoginStaff} />
      <Route path="/portal/student" component={PortalStudent} />
      <Route path="/portal/staff" component={PortalStaff} />
      <Route path="/results" component={Results} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/:rest*" component={AdminPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
