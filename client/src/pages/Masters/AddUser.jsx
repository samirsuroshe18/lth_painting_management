import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createUser } from "../../api/userApi";
import { getAllLocations } from "../../api/locationApi";
import {
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  IconButton,
} from "@mui/material";
import {
  ArrowBack as ArrowBackIcon,
} from "@mui/icons-material";

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
        const data = await getAllLocations();
        console.log("Locations fetched:", data);

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
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header Card */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" alignItems="center" gap={2}>
            <IconButton 
              onClick={handleCancel}
              color="primary"
              sx={{ p: 1 }}
            >
              <ArrowBackIcon />
            </IconButton>
            <Box>
              <Typography variant="h4" fontWeight={700} color="primary">
                Add New User
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Create a new user account with access permissions
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Form Card */}
      <Card elevation={2}>
        <CardContent sx={{ p: 4 }}>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Username</label>
                <input 
                  type="text" 
                  name="userName" 
                  value={formData.userName} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  value={formData.email} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Mobile No</label>
                <input 
                  type="text" 
                  name="mobileNo" 
                  value={formData.mobileNo} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white" 
                  required 
                />
              </div>

               <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Role</label>
                <select 
                  name="role" 
                  value={formData.role} 
                  onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-500 dark:text-white [&>option]:dark:bg-gray-700 [&>option]:dark:text-white"
                >

                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                  <option value="auditor">Auditor</option>
                </select>
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Password</label>
                <input 
                  type="password" 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white" 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  name="confirmPassword" 
                  value={formData.confirmPassword} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white" 
                  required 
                />
              </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Status</label>
                <select 
                  name="status" 
                  value={formData.status} 
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-400 rounded shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-500 dark:text-white [&>option]:dark:bg-gray-700 [&>option]:dark:text-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-2">Location</label>
                <select 
                  name="location" 
                  multiple 
                  value={formData.location} 
                  onChange={handleChange}
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-500 dark:bg-gray dark:border-gray-400 dark:text-white"
                >
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

            {/* Action Buttons */}
            <Box 
              sx={{ 
                display: 'flex', 
                justifyContent: 'flex-end', 
                gap: 2, 
                mt: 4,
                pt: 3,
                borderTop: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Button
                variant="outlined"
                onClick={handleCancel}
                size="large"
                sx={{ minWidth: 120 }}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{ minWidth: 120 }}
              >
                Create User
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>
    </Container>
  );
};

export default AddUser;