import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { updateUser } from "../../api/userApi";
import { useDispatch, useSelector } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";

const EditUser = () => {
  const userData = useSelector((state) => state.auth.userData?.user);
  const { state } = useLocation();
  const user = state?.user || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [locations, setLocations] = useState(userData.location || []);
  const [formData, setFormData] = useState({
    userName: user.userName || "",
    email: user.email || "",
    mobileNo: user.mobileNo || "",
    role: user.role || "user",
    location: user.location || [],
    status: user.isActive !== undefined ? user.isActive : true,
  });

  // Normalize user location to an array of IDs
  useEffect(() => {
    if (user.location) {
      const userLocationIds = Array.isArray(user.location)
        ? user.location.map((loc) =>
            typeof loc === "object" ? loc._id : loc
          )
        : [typeof user.location === "object" ? user.location._id : user.location];

      setFormData((prev) => ({
        ...prev,
        location: userLocationIds,
      }));
    }
  }, [user.location]);

  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;
    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, (option) => option.value);
      setFormData({ ...formData, [name]: values });
    } else if (name === "status") {
      const statusValue =
        value === "active" || value === true || value === "true";
      setFormData({ ...formData, [name]: statusValue });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const updateData = {
        userName: formData.userName,
        email: formData.email,
        mobileNo: formData.mobileNo,
        role: formData.role,
        location: formData.location,
        status: formData.status,
      };

      await updateUser(user._id, updateData);

      dispatch(
        showNotificationWithTimeout({
          show: true,
          message: "User updated successfully!",
          type: "success",
        })
      );

      navigate("/masters/user-master");
    } catch (err) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          message: "Failed to update user.",
          type: "error",
        })
      );
    }
  };

  const isLocationSelected = (locationId) =>
    Array.isArray(formData.location) &&
    formData.location.includes(locationId);

  return (
    <div className="">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-4 rounded-xl bg-white dark:bg-[#252525] shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-4 flex items-center gap-3">
            <button
              onClick={() => navigate("/masters/user-master")}
              className="inline-flex items-center justify-center h-10 w-10 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-[#2A2A2A]"
              aria-label="Back"
              title="Back"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="fill-current"
              >
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Edit User
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-300">
                Update user details and access scope
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="rounded-xl bg-white dark:bg-[#252525] shadow-sm border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit}>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Username
                </label>
                <input
                  type="text"
                  name="userName"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                />
              </div>

              {/* Mobile */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Mobile No
                </label>
                <input
                  type="text"
                  name="mobileNo"
                  value={formData.mobileNo}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                />
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>

              {/* Status & Location */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status ? "active" : "inactive"}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm 
                      focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">
                    Location
                  </label>
                  <select
                    name="location"
                    multiple
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full min-h-[160px] px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm 
                      focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#2A2A2A] dark:text-gray-100"
                  >
                    {Array.isArray(locations) && locations.length > 0 ? (
                      locations.map((loc, index) => {
                        const locationId =
                          typeof loc === "object" ? loc._id : loc;
                        const locationName =
                          typeof loc === "object" ? loc.name : loc;
                        const selected = isLocationSelected(locationId);

                        return (
                          <option
                            key={locationId || `loc-${index}`}
                            value={locationId}
                            className={
                              selected
                                ? "bg-grey-100 dark:bg-blue-900"
                                : ""
                            }
                          >
                            {selected
                              ? `✓ ${String(locationName)}`
                              : String(locationName)}
                          </option>
                        );
                      })
                    ) : (
                      <option disabled>No locations available</option>
                    )}
                  </select>
                  <div className="mt-2 flex items-center justify-between">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Hold{" "}
                      <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-[#1E1E1E] border dark:border-gray-700">
                        Ctrl/Cmd
                      </kbd>{" "}
                      to select multiple locations
                    </p>
                    <p className="text-xs text-blue-600 dark:text-blue-400">
                      Selected:{" "}
                      {Array.isArray(formData.location)
                        ? formData.location.length
                        : 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => navigate("/masters/user-master")}
                className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-100 dark:hover:bg-[#2A2A2A]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Update User
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUser;
