import { createBrowserRouter } from "react-router-dom";

// Public pages
import LandingPage from "./pages/LandingPage";
import AboutPage from "./pages/AboutPage";
import FAQPage from "./pages/FAQPage";
import ContactPage from "./pages/ContactPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";

// Portal pages
import DashboardPage from "./pages/portal/DashboardPage";
import PortfolioPage from "./pages/portal/PortfolioPage";
import PlansPage from "./pages/portal/PlansPage";
import DepositPage from "./pages/portal/DepositPage";
import WithdrawalPage from "./pages/portal/WithdrawalPage";
import TransactionsPage from "./pages/portal/TransactionsPage";
import DocumentsPage from "./pages/portal/DocumentsPage";
import SettingsPage from "./pages/portal/SettingsPage";
import NotificationsPage from "./pages/portal/NotificationsPage";

// Layout + guard
import PortalLayout from "./components/portal/PortalLayout";
import ProtectedRoute from "./components/portal/ProtectedRoute";
import AdminRoute from "./components/admin/AdminRoute";
import AdminLayout from "./components/admin/AdminLayout";
import {
  OverviewPage,
  UsersPage,
  DepositsPage,
  WithdrawalsPage,
  FundingPage,
  AdminAccountsPage,
  InvestmentsPage,
  AdminNotificationsPage,
} from "./pages/admin/AdminPages";

function Portal({ children }) {
  return (
    <ProtectedRoute>
      <PortalLayout>{children}</PortalLayout>
    </ProtectedRoute>
  );
}

function Admin({ children }) {
  return (
    <AdminRoute>
      <AdminLayout>{children}</AdminLayout>
    </AdminRoute>
  );
}

const router = createBrowserRouter([
  // Public
  { path: "/", element: <LandingPage /> },
  { path: "/about", element: <AboutPage /> },
  { path: "/faq", element: <FAQPage /> },
  { path: "/contact", element: <ContactPage /> },
  { path: "/login", element: <LoginPage /> },
  { path: "/register", element: <RegisterPage /> },
  { path: "/forgot-password", element: <ForgotPasswordPage /> },
  { path: "/reset-password", element: <ResetPasswordPage /> },

  // Internal operations console. Access is enforced by profiles.role.
  {
    path: "/admin",
    element: (
      <Admin>
        <OverviewPage />
      </Admin>
    ),
  },
  {
    path: "/admin/users",
    element: (
      <Admin>
        <UsersPage />
      </Admin>
    ),
  },
  {
    path: "/admin/deposits",
    element: (
      <Admin>
        <DepositsPage />
      </Admin>
    ),
  },
  {
    path: "/admin/withdrawals",
    element: (
      <Admin>
        <WithdrawalsPage />
      </Admin>
    ),
  },
  {
    path: "/admin/funding",
    element: (
      <Admin>
        <FundingPage />
      </Admin>
    ),
  },
  {
    path: "/admin/accounts",
    element: (
      <Admin>
        <AdminAccountsPage />
      </Admin>
    ),
  },
  {
    path: "/admin/investments",
    element: (
      <Admin>
        <InvestmentsPage />
      </Admin>
    ),
  },
  {
    path: "/admin/notifications",
    element: (
      <Admin>
        <AdminNotificationsPage />
      </Admin>
    ),
  },

  // Protected portal
  {
    path: "/portal/dashboard",
    element: (
      <Portal>
        <DashboardPage />
      </Portal>
    ),
  },
  {
    path: "/portal/portfolio",
    element: (
      <Portal>
        <PortfolioPage />
      </Portal>
    ),
  },
  {
    path: "/portal/plans",
    element: (
      <Portal>
        <PlansPage />
      </Portal>
    ),
  },
  {
    path: "/portal/deposit",
    element: (
      <Portal>
        <DepositPage />
      </Portal>
    ),
  },
  {
    path: "/portal/withdrawal",
    element: (
      <Portal>
        <WithdrawalPage />
      </Portal>
    ),
  },
  {
    path: "/portal/transactions",
    element: (
      <Portal>
        <TransactionsPage />
      </Portal>
    ),
  },
  {
    path: "/portal/documents",
    element: (
      <Portal>
        <DocumentsPage />
      </Portal>
    ),
  },
  {
    path: "/portal/settings",
    element: (
      <Portal>
        <SettingsPage />
      </Portal>
    ),
  },
  {
    path: "/portal/notifications",
    element: (
      <Portal>
        <NotificationsPage />
      </Portal>
    ),
  },
]);

export default router;
