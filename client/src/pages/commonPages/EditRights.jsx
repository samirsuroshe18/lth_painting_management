import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updatePermissions, fetchUser } from '../../api/userApi';

const EditRights = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await fetchUser(id);
        setUser(userData);
        const existingPermissions = userData.permissions || [];
        setPermissions(existingPermissions);

        const allAllowed = existingPermissions.every(p => p.effect === 'Allow');
        setSelectAll(allAllowed);
      } catch (err) {
        console.error("Failed to load user", err);
      }
    };

    loadUser();
  }, [id]);

  const togglePermission = (action) => {
    const updated = permissions.map(p =>
      p.action === action ? { ...p, effect: p.effect === 'Allow' ? 'Deny' : 'Allow' } : p
    );
    setPermissions(updated);
    const allAllowed = updated.every(p => p.effect === 'Allow');
    setSelectAll(allAllowed);
  };

  const handleSelectAll = () => {
    const updated = permissions.map(p => ({ ...p, effect: selectAll ? 'Deny' : 'Allow' }));
    setPermissions(updated);
    setSelectAll(!selectAll);
  };

  const handleSave = async () => {
    try {
      console.log("🚀 Sending these permissions to backend:", permissions);
      await updatePermissions(id, permissions);
      setShowDialog(true);
    } catch (err) {
      console.error("Failed to save permissions", err);
    }
  };

  const handleDialogClose = () => {
    setShowDialog(false);
    navigate("/masters/user-master");
  };

  if (!user) return <p className="text-center mt-8 dark:text-white">Loading...</p>;

  return (
    <div className="p-8 max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-md shadow-md dark:shadow-gray-700 transition-colors duration-300 relative">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        Edit Rights - {user.userName}
      </h2>

      <div className="mb-4 flex items-center">
        <input
          type="checkbox"
          checked={selectAll}
          onChange={handleSelectAll}
          className="w-4 h-4 mr-2 accent-blue-600 dark:accent-blue-400"
        />
        <label className="text-gray-700 dark:text-gray-300 font-medium">Select All</label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {permissions.map((perm, index) => (
          <div key={index} className="flex items-center">
            <input
              type="checkbox"
              checked={perm.effect === 'Allow'}
              onChange={() => togglePermission(perm.action)}
              className="w-4 h-4 mr-2 accent-blue-600 dark:accent-blue-400"
            />
            <label className="text-gray-700 dark:text-gray-200">{perm.action}</label>
          </div>
        ))}
      </div>

        <button
        onClick={handleDialogClose}
        className="bg-red-500 hover:bg-red-900 text-white px-6 py-2 rounded shadow dark:shadow-lg transition-all duration-200 mr-4"
      >
        Cancel
      </button>

      <button
        onClick={handleSave}
        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded shadow dark:shadow-lg transition-all duration-200"
      >
        Save Permissions
      </button>

     
     {showDialog && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn">
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center max-w-sm w-full transform transition-transform duration-300 scale-95 animate-popup">
      <div className="mb-4">
        <div className="flex items-center justify-center">
          <div className="relative w-16 h-16">
            <div className="absolute inset-0 rounded-full border-4 border-green-500 animate-ping"></div>
            <div className="relative w-16 h-16 flex items-center justify-center bg-green-500 rounded-full text-white text-3xl">
              ✓
            </div>
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        Permissions updated successfully!
      </h3>
      <button
        onClick={handleDialogClose}
        className="mt-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-200"
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
