// accessPolicy.js (or wherever your function lives)

// Canonical list of actions (source of truth)
const ALL_ACTIONS = [
  'allAccess',

  'dashboard:view',
  'dashboard:edit',

  'masters:view',
  'masters:edit',

  'userMaster:view',
  'userMaster:edit',

  'roleMaster:view',
  'roleMaster:edit',

  'assetMaster:view',
  'assetMaster:edit',

  'locationMaster:view',
  'locationMaster:edit',

  'stateMaster:view',
  'stateMaster:edit',

  'cityMaster:view',
  'cityMaster:edit',

  'areaMaster:view',
  'areaMaster:edit',

  'departmentMaster:view',
  'departmentMaster:edit',

  'buildingMaster:view',
  'buildingMaster:edit',

  'floorMaster:view',
  'floorMaster:edit',

  'generateQrCode',

  'auditReport:view',
  'auditReport:edit',
];

// Per‑role allow‑lists (everything else is Deny)
const ROLE_ALLOW = {
  superadmin: [...ALL_ACTIONS],

  admin: [
    'dashboard:view', 
    'dashboard:edit',

    'masters:view',
    'masters:edit',

    'userMaster:view',
    'userMaster:edit',

    'roleMaster:view',
    
    'assetMaster:view',
    'assetMaster:edit',

    'locationMaster:view',
    'locationMaster:edit',

    'stateMaster:view',
    'stateMaster:edit',

    'generateQrCode',
    
    'auditReport:view',
    'auditReport:edit',
  ],

  auditor: [
    'dashboard:view',

    'masters:view',

    'assetMaster:view',

    'generateQrCode',
    
    'auditReport:view',
  ],

  supervisor: [
    'dashboard:view',   
      
    'masters:view',

    'assetMaster:view',
    'assetMaster:edit',    

    'generateQrCode',
    'auditReport:view',

  ],

  user: [
    'dashboard:view',                   // view‑only dashboard (as requested)
    'generateQrCode',
  ],
};

function getAccessByRole(role) {
  const allow = new Set(ROLE_ALLOW[role] || []);
  return ALL_ACTIONS.map((action) => ({
    action,
    effect: allow.has(action) ? 'Allow' : 'Deny',
  }));
}

export default getAccessByRole;