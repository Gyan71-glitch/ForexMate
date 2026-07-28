export enum AppPermission {
  // Dashboard / Analytics
  VIEW_DASHBOARD = 'dashboard.view',
  VIEW_REPORTS = 'reports.view',

  // Orders
  VIEW_ORDERS = 'orders.view',
  CREATE_ORDERS = 'orders.create',
  MANAGE_ORDERS = 'orders.manage',

  // Tasks
  VIEW_TASKS = 'tasks.view',
  ASSIGN_TASKS = 'tasks.assign',
  EXECUTE_TASKS = 'tasks.execute',

  // KYC / Compliance
  VIEW_KYC = 'kyc.view',
  APPROVE_KYC = 'kyc.approve',
  OVERRIDE_KYC = 'kyc.override',

  // Inventory
  VIEW_INVENTORY = 'inventory.view',
  RESERVE_INVENTORY = 'inventory.reserve',
  MANAGE_INVENTORY = 'inventory.manage', // Super/Branch Manager

  // Fulfillment / Delivery
  VIEW_FULFILLMENT = 'fulfillment.view',
  PREP_FULFILLMENT = 'fulfillment.prep',
  EXECUTE_HANDOVER = 'fulfillment.handover',

  // Customers / Profiles
  VIEW_CUSTOMERS = 'customers.view',
  MANAGE_CUSTOMERS = 'customers.manage',

  // Branch management
  VIEW_BRANCHES = 'branches.view',
  MANAGE_BRANCHES = 'branches.manage', // Super Admin
  MANAGE_STAFF = 'staff.manage', // Branch Manager / Super Admin

  // Rates / Pricing
  VIEW_RATES = 'rates.view',
  MANAGE_RATES = 'rates.manage',

  // System settings
  MANAGE_SETTINGS = 'settings.manage',
}
