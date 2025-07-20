function getAccessByRole(role) {
  const defaultRights = [
    { action: "allAccess", effect: "Deny" },
    { action: "dashboard", effect: "Deny" },
    { action: "masters", effect: "Deny" },
    { action: "userMaster", effect: "Deny" },
    { action: "roleMaster", effect: "Deny" },
    { action: "assetMaster", effect: "Deny" },
    { action: "locationMaster", effect: "Deny" },
    { action: "stateMaster", effect: "Deny" },
    { action: "generateQrCode", effect: "Deny" },
    { action: "auditReport", effect: "Deny" },
  ];

  switch (role) {
    case 'superadmin':
      return [
        { action: "allAccess", effect: "Allow" },
        { action: "dashboard", effect: "Allow" },
        { action: "masters", effect: "Allow" },
        { action: "userMaster", effect: "Allow" },
        { action: "roleMaster", effect: "Allow" },
        { action: "assetMaster", effect: "Allow" },
        { action: "locationMaster", effect: "Allow" },
        { action: "stateMaster", effect: "Allow" },
        { action: "generateQrCode", effect: "Allow" },
        { action: "auditReport", effect: "Allow" },
      ];

    case 'admin':
      return [
        { action: "allAccess", effect: "Deny" },
        { action: "dashboard", effect: "Allow" },
        { action: "masters", effect: "Deny" },
        { action: "userMaster", effect: "Allow" },
        { action: "roleMaster", effect: "Deny" },
        { action: "assetMaster", effect: "Allow" },
        { action: "locationMaster", effect: "Allow" },
        { action: "stateMaster", effect: "Allow" },
        { action: "generateQrCode", effect: "Allow" },
        { action: "auditReport", effect: "Allow" },
      ];

    case 'auditor':
      return [
        { action: "allAccess", effect: "Deny" },
        { action: "dashboard", effect: "Allow" },
        { action: "masters", effect: "Deny" },
        { action: "userMaster", effect: "Deny" },
        { action: "roleMaster", effect: "Deny" },
        { action: "assetMaster", effect: "Deny" },
        { action: "locationMaster", effect: "Deny" },
        { action: "stateMaster", effect: "Deny" },
        { action: "generateQrCode", effect: "Allow" },
        { action: "auditReport", effect: "Allow" },
      ]

    case 'user':
      return [
        { action: "allAccess", effect: "Deny" },
        { action: "dashboard", effect: "Deny" },
        { action: "masters", effect: "Deny" },
        { action: "userMaster", effect: "Deny" },
        { action: "roleMaster", effect: "Deny" },
        { action: "assetMaster", effect: "Deny" },
        { action: "locationMaster", effect: "Deny" },
        { action: "stateMaster", effect: "Deny" },
        { action: "generateQrCode", effect: "Allow" },
        { action: "auditReport", effect: "Deny" },
      ];

    default:
      return defaultRights;
  }
}

export default getAccessByRole;
