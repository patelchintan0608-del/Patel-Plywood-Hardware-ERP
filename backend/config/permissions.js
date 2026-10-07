const ROLE_PERMISSIONS = {
  admin: ["*"],

  quotation_employee: [
    "customers.view",
    "customers.create",
    "customers.edit",
    "leads.view",
    "leads.create",
    "quotations.view",
    "quotations.create",
    "quotations.edit",
  ],

  delivery_employee: [
    "salesOrders.view",
    "delivery.view",
    "delivery.create",
    "delivery.update",
    "dispatch.view",
    "dispatch.update",
  ],

  sales_employee: [
    "customers.view",
    "customers.create",
    "customers.edit",
    "leads.view",
    "leads.create",
    "quotations.view",
    "quotations.create",
    "quotations.edit",
    "salesOrders.view",
    "salesOrders.create",
  ],

  inventory_employee: [
    "inventory.view",
    "inventory.create",
    "inventory.update",
    "purchase.view",
    "purchase.create",
    "purchase.update",
  ],

  account_employee: [
    "payments.view",
    "payments.create",
    "payments.update",
    "invoices.view",
    "invoices.create",
  ],

  manager: [
    "customers.view",
    "leads.view",
    "quotations.view",
    "quotations.approve",
    "salesOrders.view",
    "delivery.view",
    "dispatch.view",
    "inventory.view",
    "payments.view",
    "reports.view",
  ],
};

export const getPermissionsForRole = (role) => {
  if (!role) return [];
  const normalizedRole = role.toLowerCase().replace(/\s+/g, '_');
  return ROLE_PERMISSIONS[normalizedRole] || ROLE_PERMISSIONS[role] || [];
};

export default ROLE_PERMISSIONS;
