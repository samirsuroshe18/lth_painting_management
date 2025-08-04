import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchUser, updateUser } from "../../api/userApi";
import { getAllLocations } from "../../api/locationApi";
import { useDispatch } from 'react-redux';
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNo: "",
    role: "user",
    password: "",
    confirmPassword: "",
    location: [],
    status: "active",
  });

  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const user = await fetchUser(id);
        setFormData({
          userName: user.userName || "",
          email: user.email || "",
          mobileNo: user.mobileNo || "",
          role: user.role || "user",
          password: "",
          confirmPassword: "",
          location: user.location?.map((loc) => loc._id) || [],
          status: user.isActive ? "active" : "inactive",
        });
      } catch (err) {
        console.error("Error fetching user:", err);
        dispatch(
          showNotificationWithTimeout({
            show: true,
            message: "Failed to fetch user data.",
            type: "error",
          })
        );
      }

      try {
        const data = await getAllLocations();
        if (data?.success && Array.isArray(data.data)) {
          setLocations(data.data);
        } else {
          setLocations([]);
          console.warn("No locations found");
        }
      } catch (err) {
        console.error("Failed to fetch locations:", err);
        setLocations([]);
      }
    };

    fetchData();
  }, [id, dispatch]);

  // ✅ Handle form input changes
  const handleChange = (e) => {
    const { name, value, type, selectedOptions } = e.target;

    if (type === "select-multiple") {
      const values = Array.from(selectedOptions, (option) => option.value);
      setFormData({ ...formData, [name]: values });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // ✅ Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          message: "Passwords do not match.",
          type: "error",
        })
      );
      return;
    }

    try {
      const updateData = {
        userName: formData.userName,
        email: formData.email,
        mobileNo: formData.mobileNo,
        role: formData.role,
        location: formData.location,
        status: formData.status,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await updateUser(id, updateData);

      dispatch(
        showNotificationWithTimeout({
          show: true,
          message: "User updated successfully!",
          type: "success",
        })
      );

      navigate("/masters/user-master");
    } catch (err) {
      console.error("Error updating user:", err);
      dispatch(
        showNotificationWithTimeout({
          show: true,
          message: "Failed to update user.",
          type: "error",
        })
      );
    }
  };

  return (
    <div className="min-w-5xl mx-auto mt-12 px-5">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg p-7">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Edit User</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Username</label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Mobile No</label>
              <input
                type="text"
                name="mobileNo"
                value={formData.mobileNo}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              />
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Location</label>
              <select
                name="location"
                multiple
                value={formData.location}
                onChange={handleChange}
                className="w-full h-32 px-4 py-2 border rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              >
                {locations.length > 0 ? (
                  locations.map((loc) => (
                    <option key={loc._id} value={loc._id}>
                      {loc.name}
                    </option>
                  ))
                ) : (
                  <option disabled>No locations available</option>
                )}
              </select>
            </div>
          </div>

          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate("/masters/user-master")}
              className="bg-gray-500 text-white px-6 py-3 rounded-md font-semibold hover:bg-gray-600 transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-semibold hover:bg-blue-700 transition-all"
            >
              Update User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUser;
