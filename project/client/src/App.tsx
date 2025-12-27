import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Unauthorized from "./pages/Unauthorized";
import AdminDashboard from "./pages/AdminDashboard";
import AdminVolunteers from "./pages/AdminVolunteers";
import AdminVolunteerView from "./pages/AdminVolunteerView";
import AdminVolunteerEdit from "./pages/AdminVolunteerEdit";
import VolunteerForm from "./pages/VolunteerForm";
import VolunteerSuccess from "./pages/VolunteerSuccess";
import VolunteersList from "./pages/VolunteersList";
import VolunteerProfile from "@/pages/VolunteerProfile";
import VolunteerEdit from "@/pages/VolunteerEdit";
import MyProfile from "@/pages/MyProfile";

function Router() {
  return (
    <Switch>
      {/* Public Routes */}
      <Route path={"/"} component={Home} />
      <Route path={"/login"} component={Login} />
      <Route path={"/unauthorized"} component={Unauthorized} />
      <Route path={"/success"} component={VolunteerSuccess} />

      {/* Professional Routes - Require Authentication */}
      <Route path={"/register"}>
        <ProtectedRoute requireAuth={true}>
          <VolunteerForm />
        </ProtectedRoute>
      </Route>

      <Route path={"/my-profile"}>
        <ProtectedRoute requireAuth={true}>
          <MyProfile />
        </ProtectedRoute>
      </Route>

      {/* Admin Routes - Require Admin Role */}
      <Route path={"/admin/dashboard"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminDashboard />
        </ProtectedRoute>
      </Route>

      <Route path={"/admin/volunteers"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminVolunteers />
        </ProtectedRoute>
      </Route>

      <Route path={"/admin/volunteers/:id"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminVolunteerView />
        </ProtectedRoute>
      </Route>

      <Route path={"/admin/volunteers/:id/edit"}>
        <ProtectedRoute requireAdmin={true}>
          <AdminVolunteerEdit />
        </ProtectedRoute>
      </Route>

      {/* Legacy Routes - Keep for backward compatibility */}
      <Route path={"/volunteers"}>
        <ProtectedRoute requireAdmin={true}>
          <VolunteersList />
        </ProtectedRoute>
      </Route>

      <Route path={"/volunteers/:id"}>
        <ProtectedRoute requireAdmin={true}>
          <VolunteerProfile />
        </ProtectedRoute>
      </Route>

      <Route path={"/volunteers/:id/edit"}>
        <ProtectedRoute requireAdmin={true}>
          <VolunteerEdit />
        </ProtectedRoute>
      </Route>

      {/* 404 Routes */}
      <Route path={"/404"} component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
