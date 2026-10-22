import { createBrowserRouter, Navigate } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import AppShell from "../components/layout/AppShell";
import LoginPage from "../features/auth/LoginPage";
import DashboardPage from "../features/dashboard/DashboardPage";
import CategoriesPage from "../features/categories/CategoriesPage";
import CompaniesPage from "../features/companies/CompaniesPage";
import ShoesPage from "../features/shoes/ShoesPage";
import ShoeDetailPage from "../features/shoes/ShoeDetailPage";
import POSPage from "../features/pos/POSpage";
import SaleDetailPage from "../features/sales/SaleDetailPage";
import SalesPage from "../features/sales/SalesPage";
import ReportsPage from "../features/reports/ReportsPage";
import SuppliersPage from "../features/suppliers/SuppliersPage";
import PurchaseDetailPage from "../features/purchases/PurchaseDetailPage";
import ReceiveStockPage from "../features/purchases/ReceiveStockPage";
import PurchasesPage from "../features/purchases/PurchasesPage";
import UsersPage from "../features/users/UsersPage";


export const router = createBrowserRouter([
  { path: "/login", element: <LoginPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: "/", element: <DashboardPage /> },
          { path: "/categories", element: <CategoriesPage /> },
          { path: "/companies", element: <CompaniesPage /> },
          { path: "/shoes", element: <ShoesPage /> },
          { path: "/shoes/:id", element: <ShoeDetailPage /> },
          { path: "/pos", element: <POSPage /> },
          { path: "/sales", element: <SalesPage /> },
          { path: "/sales/:id", element: <SaleDetailPage /> },
          { path: "/reports", element: <ReportsPage /> },
          { path: "/suppliers", element: <SuppliersPage /> },
          { path: "/purchases", element: <PurchasesPage /> },
          { path: "/purchases/receive", element: <ReceiveStockPage /> },
          { path: "/purchases/:id", element: <PurchaseDetailPage /> },
          { path: "/users", element: <UsersPage /> },
   
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
]);