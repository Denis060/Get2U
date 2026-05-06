import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import GuestRoute from "./components/GuestRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AppLayout from "./components/AppLayout";
import AgentLayout from "./components/AgentLayout";
import AdminLayout from "./components/AdminLayout";
import Login from "./pages/Login";
import VerifyOtp from "./pages/VerifyOtp";
import Dashboard from "./pages/Dashboard";
import NewRequest from "./pages/NewRequest";
import Orders from "./pages/Orders";
import OrderDetail from "./pages/OrderDetail";
import Profile from "./pages/Profile";
import Pricing from "./pages/Pricing";
import AgentDashboard from "./pages/agent/AgentDashboard";
import MyJobs from "./pages/agent/MyJobs";
import Earnings from "./pages/agent/Earnings";
import AgentJobDetail from "./pages/agent/AgentJobDetail";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminAgents from "./pages/admin/AdminAgents";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminPricing from "./pages/admin/AdminPricing";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <Login />
              </GuestRoute>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <GuestRoute>
                <VerifyOtp />
              </GuestRoute>
            }
          />
          {/* Admin routes */}
          <Route
            element={
              <AdminRoute>
                <AdminLayout />
              </AdminRoute>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/agents" element={<AdminAgents />} />
            <Route path="/admin/messages" element={<AdminMessages />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/announcements" element={<AdminAnnouncements />} />
          </Route>

          {/* Agent routes */}
          <Route
            element={
              <ProtectedRoute>
                <AgentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/agent" element={<AgentDashboard />} />
            <Route path="/agent/my-jobs" element={<MyJobs />} />
            <Route path="/agent/earnings" element={<Earnings />} />
            <Route path="/agent/jobs/:id" element={<AgentJobDetail />} />
          </Route>

          {/* Customer routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/new-request" element={<NewRequest />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetail />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/pricing" element={<Pricing />} />
          </Route>
          {/* Guest landing page */}
          <Route path="/" element={<Index />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
