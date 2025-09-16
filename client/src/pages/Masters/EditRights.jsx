import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { updatePermissions } from "../../api/userApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

// Canonical actions
const ALL_ACTIONS = [
  "allAccess",

  "dashboard:view",
  "dashboard:edit",

  "masters:view",
  "masters:edit",

  "userMaster:view",
  "userMaster:edit",

  "roleMaster:view",
  "roleMaster:edit",

  "assetMaster:view",
  "assetMaster:edit",

  "locationMaster:view",
  "locationMaster:edit",

  "stateMaster:view",
  "stateMaster:edit",
  
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

  "generateQrCode",

  "auditReport:view",
  "auditReport:edit",
];

// Get all actions except allAccess
const NON_ALL_ACCESS_ACTIONS = ALL_ACTIONS.filter(action => action !== "allAccess");

// Grouping for nicer UI
const GROUPS = [
  { key: "core", label: "Core", actions: ["allAccess", "generateQrCode"] },
  { key: "dashboard", label: "Dashboard", actions: ["dashboard:view", "dashboard:edit"] },
  { key: "masters", label: "Masters (Global)", actions: ["masters:view", "masters:edit"] },
  { key: "user", label: "User Master", actions: ["userMaster:view", "userMaster:edit"] },
  { key: "role", label: "Role Master", actions: ["roleMaster:view", "roleMaster:edit"] },
  { key: "asset", label: "Asset Master", actions: ["assetMaster:view", "assetMaster:edit"] },
  { key: "location", label: "Location Master", actions: ["locationMaster:view", "locationMaster:edit"] },
  { key: "state", label: "State Master", actions: ["stateMaster:view", "stateMaster:edit"] },
  { key: "city", label: "City Master", actions: ["cityMaster:view", "cityMaster:edit"] },
  { key: "area", label: "Area Master", actions: ["areaMaster:view", "areaMaster:edit"] },
  { key: "department", label: "Department Master", actions: ["departmentMaster:view", "departmentMaster:edit"] },
  { key: "building", label: "Building Master", actions: ["buildingMaster:view", "buildingMaster:edit"] },
  { key: "floor", label: "Floor Master", actions: ["floorMaster:view", "floorMaster:edit"] },
  { key: "audit", label: "Audit Reports", actions: ["auditReport:view", "auditReport:edit"] },
];

const humanize = (action) => {
  if (action === "allAccess") return "All Access";
  if (action === "generateQrCode") return "Generate QR Code";
  const [mod, op] = action.split(":");
  const labelMap = {
    dashboard: "Dashboard",
    masters: "Masters (Global)",
    userMaster: "User Master",
    roleMaster: "Role Master",
    assetMaster: "Asset Master",
    locationMaster: "Location Master",
    stateMaster: "State Master",
    auditReport: "Audit Reports",
  };
  const opLabel = op ? (op === "view" ? "View" : "Edit") : "";
  return `${labelMap[mod] ?? mod}${opLabel ? ` — ${opLabel}` : ""}`;
};

const toMap = (perms) => {
  const m = new Map();
  (perms || []).forEach((p) => m.set(p.action, p.effect));
  return m;
};

const normalizePermissions = (existing = []) => {
  const map = toMap(existing);
  return ALL_ACTIONS.map((a) => ({
    action: a,
    effect: map.get(a) || "Deny",
  }));
};

const EditRights = () => {
  const { state } = useLocation();
  const user = state?.user || {};
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState(normalizePermissions(user.permissions || []));
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const allAllowed = useMemo(
    () => permissions.length > 0 && permissions.every((p) => p.effect === "Allow"),
    [permissions]
  );

  // Effect to auto-manage allAccess based on other permissions
  useEffect(() => {
    const nonAllAccessPerms = permissions.filter(p => p.action !== "allAccess");
    const allOtherPermissionsAllowed = nonAllAccessPerms.length > 0 && nonAllAccessPerms.every(p => p.effect === "Allow");
    const hasAnyDeniedPermission = nonAllAccessPerms.some(p => p.effect === "Deny");
    
    const currentAllAccess = permissions.find(p => p.action === "allAccess");
    
    // If all other permissions are allowed, enable allAccess
    // If any permission is denied, disable allAccess
    if (currentAllAccess) {
      if (allOtherPermissionsAllowed && currentAllAccess.effect !== "Allow") {
        setPermissions(prev =>
          prev.map(p =>
            p.action === "allAccess" ? { ...p, effect: "Allow" } : p
          )
        );
      } else if (hasAnyDeniedPermission && currentAllAccess.effect !== "Deny") {
        setPermissions(prev =>
          prev.map(p =>
            p.action === "allAccess" ? { ...p, effect: "Deny" } : p
          )
        );
      }
    }
  }, [permissions]);

  const togglePermission = (action) => {
    setPermissions((prev) => {
      const newPermissions = prev.map((p) =>
        p.action === action
          ? { ...p, effect: p.effect === "Allow" ? "Deny" : "Allow" }
          : p
      );

      // Special handling for allAccess toggle
      if (action === "allAccess") {
        const allAccessPerm = newPermissions.find(p => p.action === "allAccess");
        if (allAccessPerm && allAccessPerm.effect === "Allow") {
          // If allAccess is being enabled, enable all other permissions
          return newPermissions.map(p => ({ ...p, effect: "Allow" }));
        }
      }

      return newPermissions;
    });
  };

  const setBulk = (actions, effect) => {
    setPermissions((prev) =>
      prev.map((p) => (actions.includes(p.action) ? { ...p, effect } : p))
    );
  };

  const handleAllowAll = () => setBulk(ALL_ACTIONS, "Allow");
  const handleDenyAll = () => setBulk(ALL_ACTIONS, "Deny");
  const handleGroupAllow = (actions) => setBulk(actions, "Allow");
  const handleGroupDeny = (actions) => setBulk(actions, "Deny");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return q
      ? permissions.filter((p) => humanize(p.action).toLowerCase().includes(q))
      : permissions;
  }, [permissions, search]);

  const handleSave = async () => {
    setIsLoading(true); // Start loading
    try {
      const toSave = [...permissions].sort((a, b) => a.action.localeCompare(b.action));
      await updatePermissions(id, toSave);
      
      // Add 1 second delay to show loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsLoading(false); // Stop loading before showing success dialog
      setShowDialog(true);
    } catch (error) {
      // Add delay even for errors to maintain consistent UX
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsLoading(false); // Stop loading on error
      dispatch(showNotificationWithTimeout({
        show: true,
        type: "error",
        message: handleAxiosError(error),
      }));
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    navigate("/masters/user-master");
  };

  return (
    <div className="p-6 md:p-8 text-gray-900 dark:text-gray-200">
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
            Edit Permissions
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            User: <span className="font-semibold text-gray-800 dark:text-gray-100">{user.userName}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleAllowAll}
            disabled={isLoading}
            className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Allow All
          </button>
          <button
            onClick={handleDenyAll}
            disabled={isLoading}
            className="rounded-lg bg-rose-600 px-4 py-2 text-sm font-semibold text-white hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Deny All
          </button>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            disabled={isLoading}
            placeholder="Search permissions…"
            className="w-56 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2A2A2A] px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
        </div>
      </div>

      {/* Groups */}
      <div className="space-y-6">
        {GROUPS.map((g) => {
          const rows = filtered.filter((p) => g.actions.includes(p.action));
          if (!rows.length) return null;

          const groupAllAllowed = rows.every((r) => r.effect === "Allow");
          const groupAllDenied = rows.every((r) => r.effect === "Deny");

          return (
            <div key={g.key} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#252525] p-4 shadow">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{g.label}</h3>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGroupAllow(g.actions)}
                    disabled={isLoading}
                    className="rounded-md border border-green-600 px-3 py-1 text-xs text-green-600 dark:text-green-400 hover:bg-green-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Allow Group
                  </button>
                  <button
                    onClick={() => handleGroupDeny(g.actions)}
                    disabled={isLoading}
                    className="rounded-md border border-rose-600 px-3 py-1 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Deny Group
                  </button>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                      groupAllAllowed
                        ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                        : groupAllDenied
                        ? "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300"
                        : "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200"
                    }`}
                  >
                    {groupAllAllowed ? "All Allowed" : groupAllDenied ? "All Denied" : "Mixed"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {rows.map((perm) => (
                  <label
                    key={perm.action}
                    className={`flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#2A2A2A] px-3 py-2 text-sm ${
                      isLoading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <div className="mr-3">
                      <div className="font-medium text-gray-900 dark:text-gray-100">{humanize(perm.action)}</div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-500">{perm.action}</div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePermission(perm.action)}
                      disabled={isLoading}
                      className={`relative inline-flex h-6 w-12 items-center rounded-full transition ${
                        perm.effect === "Allow" ? "bg-blue-600" : "bg-gray-400 dark:bg-gray-500"
                      } ${isLoading ? 'cursor-not-allowed' : ''}`}
                    >
                      <span
                        className={`inline-block h-5 w-5 transform rounded-full bg-white transition ${
                          perm.effect === "Allow" ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                  </label>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-8 flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
        <button
          onClick={() => navigate("/masters/user-master")}
          disabled={isLoading}
          className="rounded-lg border border-gray-300 dark:border-gray-600 px-5 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {isLoading && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isLoading ? 'Saving...' : 'Save Permissions'}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 z-40 bg-black/30 flex items-center justify-center">
          <div className="bg-white dark:bg-[#252525] rounded-lg p-6 shadow-lg flex flex-col items-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-900 dark:text-gray-100 font-medium">Saving permissions...</p>
          </div>
        </div>
      )}

      {/* Success dialog */}
      {showDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="mx-4 w-full max-w-sm rounded-xl border border-green-200 dark:border-green-700 bg-white dark:bg-[#252525] p-6 shadow-lg">
            <div className="mb-4 flex justify-center">
              <div className="relative h-14 w-14">
                <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping" />
                <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-green-600 text-white text-2xl">
                  ✓
                </div>
              </div>
            </div>
            <h3 className="mb-2 text-center text-lg font-semibold text-gray-900 dark:text-gray-100">
              Permissions updated successfully!
            </h3>
            <button
              onClick={handleDialogClose}
              className="mx-auto mt-3 block rounded-md bg-blue-600 px-5 py-2 text-sm text-white hover:bg-blue-500"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditRights;