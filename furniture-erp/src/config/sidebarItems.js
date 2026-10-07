import {
  LayoutDashboard,
  Users,
  MessageSquare,
  FileText,
  ShoppingCart,
  Layers,
  Package,
  BarChart3,
  ShoppingBag,
  Navigation,
  Truck,
  UserCheck,
  Clock,
  ShieldCheck,
  Settings as SettingsIcon
} from 'lucide-react';

export const sidebarSections = [
  {
    title: null, // Standalone item
    items: [
      {
        label: "Dashboard",
        path: "/",
        permission: null,
        icon: LayoutDashboard,
        badge: "Live"
      }
    ]
  },
  {
    title: "CRM",
    icon: Users,
    permission: "leads.view",
    items: [
      {
        label: "Leads",
        path: "/leads",
        permission: "leads.view",
        icon: MessageSquare
      },
      {
        label: "Customers",
        path: "/customers",
        permission: "customers.view",
        icon: Users
      }
    ]
  },
  {
    title: "SALES",
    icon: ShoppingCart,
    permission: "quotations.view",
    items: [
      {
        label: "Quotations",
        path: "/quotations",
        permission: "quotations.view",
        icon: FileText
      },
      {
        label: "Sales & Orders",
        path: "/orders",
        permission: "salesOrders.view",
        icon: ShoppingCart
      }
    ]
  },
  {
    title: "INVENTORY",
    icon: Package,
    permission: "inventory.view",
    items: [
      {
        label: "Products",
        path: "/products",
        permission: "inventory.view",
        icon: Layers
      },
      {
        label: "Inventory",
        path: "/stocks",
        permission: "inventory.view",
        icon: Package
      },
      {
        label: "Stock Overview",
        path: "/reports",
        permission: "inventory.view",
        icon: BarChart3
      }
    ]
  },
  {
    title: "PURCHASE",
    icon: ShoppingBag,
    permission: "purchase.view",
    items: [
      {
        label: "Purchase",
        path: "/products?tab=purchase",
        permission: "purchase.view",
        icon: ShoppingBag
      }
    ]
  },
  {
    title: "LOGISTICS",
    icon: Truck,
    permission: "delivery.view",
    items: [
      {
        label: "Dispatch",
        path: "/deliveries",
        permission: "dispatch.view",
        icon: Navigation
      },
      {
        label: "Delivery",
        path: "/delivery-dashboard",
        permission: "delivery.view",
        icon: Truck
      }
    ]
  },
  {
    title: "EMPLOYEES",
    icon: UserCheck,
    permission: "employees.view",
    items: [
      {
        label: "All Employees",
        path: "/employees",
        permission: "employees.view",
        icon: UserCheck
      },
      {
        label: "Roles & Permissions",
        path: "/employees?tab=permissions",
        permission: "employees.view",
        icon: ShieldCheck
      }
    ]
  },
  {
    title: "SETTINGS",
    icon: SettingsIcon,
    permission: "settings.view",
    items: [
      {
        label: "Admin Settings",
        path: "/settings",
        permission: "settings.view",
        icon: SettingsIcon
      }
    ]
  }
];

export const sidebarItems = sidebarSections.flatMap(sec => sec.items);

export default sidebarSections;
