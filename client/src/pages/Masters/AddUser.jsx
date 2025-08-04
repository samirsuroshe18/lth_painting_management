import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import { getAllLocations } from "../../api/locationApi"; // Uncomment if used

const AddUser = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    userName: "",
    email: "",
    mobileNo: "",
    password: "",
    confirmPassword: "",
    role: "user",
    status: "active",
    location: [],
  });

  const [locations, setLocations] = useState([]);

  useEffect(() => {
  const fetchLocations = async () => {
    try {
      const data = await getAllLocations(); // get the `.data` part directly
      console.log("Locations fetched:", data);

      // Check for success
      if (data?.success && Array.isArray(data.data)) {
        setLocations(data.data);
      } else {
        setLocations([]); // fallback
        console.warn("No locations found");
      }
    } catch (err) {
      console.error("Failed to fetch locations:", err);
      setLocations([]); // fallback
    }
  };

  fetchLocations();
}, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "location") {
      const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
      setFormData({ ...formData, location: selectedOptions });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUser(formData);
      alert("User created successfully");
      navigate("/masters/user-master");
    } catch (error) {
      console.error("Error creating user:", error);
      alert("Failed to create user");
    }
  };

  const handleCancel = () => {
    navigate("/masters/user-master");
  };

  return (
    <div className="min-w-5xl mx-auto mt-12 px-6">
      <div className="bg-white dark:bg-gray-900 rounded shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Add New User</h2>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Username</label>
              <input type="text" name="userName" value={formData.userName} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Mobile No</label>
              <input type="text" name="mobileNo" value={formData.mobileNo} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Role</label>
              <select name="role" value={formData.role} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option value="user">User</option>
                <option value="admin">Admin</option>
                <option value="superadmin">Super Admin</option>
                <option value="auditor">Auditor</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Password</label>
              <input type="password" name="password" value={formData.password} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Confirm Password</label>
              <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white" required />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Status</label>
              <select name="status" value={formData.status} onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Location</label>
              <select name="location" multiple value={formData.location} onChange={handleChange}
                className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-white">
                {Array.isArray(locations) && locations.length > 0 ? (
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
            <button type="button" onClick={handleCancel}
              className="w-full md:w-auto bg-gray-500 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-gray-600 transition-all">
              Cancel
            </button>

            <button type="submit"
              className="w-full md:w-auto bg-blue-600 text-white px-6 py-3 rounded-md text-lg font-semibold hover:bg-blue-700 transition-all">
              Create User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


export default AddUser;
