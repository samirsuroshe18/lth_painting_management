import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllUsers } from "../../api/userApi";
import { HiPencilAlt, HiKey } from "react-icons/hi";

const USERS_PER_PAGE = 5;

const UserMaster = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchUsers();
  }, []);

  
 const fetchUsers = async () => {
  try {
    const response = await getAllUsers();
    console.log("Fetched users:", response);
    setUsers(response.data); 
  } catch (error) {
    console.error("Error fetching users:", error);
  }
};

  const handleAddUser = () => {
    navigate("/masters/add-user");
  };

  const handleEditUser = (userId) => {
    navigate(`/masters/edit-user/${userId}`);
  };

  const handleEditRights = (userId) => {
    navigate(`/edit-rights/${userId}`);
  };

  const indexOfLastUser = currentPage * USERS_PER_PAGE;
  const indexOfFirstUser = indexOfLastUser - USERS_PER_PAGE;
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(users.length / USERS_PER_PAGE);

  return (
    <div className="bg-gray-50 dark:bg-[#1e1e1e] p-6 w-full rounded-lg shadow-md transition-colors duration-300">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
          User List
        </h1>
        <button
          onClick={handleAddUser}
          className="bg-blue-600 text-white px-4 py-2 rounded-sm hover:bg-blue-700 transition"
        >
          + Add New User
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto shadow-md rounded-lg">
        <table className="min-w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg transition-colors duration-300">
          <thead className="bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 text-left">
            <tr>
              <th className="py-3 px-4 text-center">Sr. No</th>
              <th className="py-3 px-4">Username</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Last Login</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
  {currentUsers.map((user, index) => (
    <tr
      key={user._id}
      className="border-t border-gray-200 dark:border-gray-600 even:bg-gray-50 dark:even:bg-gray-700"
    >
      <td className="py-3 px-4 text-center text-gray-800 dark:text-gray-200">
        {(currentPage - 1) * USERS_PER_PAGE + index + 1}
      </td>
      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
        {user.userName}
      </td>
      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
        {user.email}
      </td>
      <td className="py-3 px-4 capitalize text-gray-800 dark:text-gray-200">
        {user.role}
      </td>
      <td className="py-3 px-4 text-gray-800 dark:text-gray-200">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleString() : "Never"}
      </td>
      <td className="py-3 px-4 text-center">
        <div className="flex justify-center gap-4">
          <button
            onClick={() => handleEditUser(user._id)}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition text-xl cursor-pointer"
            title="Edit User"
          >
            <HiPencilAlt />
          </button>

          {/* Only show Edit Rights if role is not 'user' */}
          {user.role !== "user" && (
            <button
              onClick={() => handleEditRights(user._id)}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition text-xl cursor-pointer"
              title="Edit Rights"
            >
              <HiKey />
            </button>
          )}
        </div>
      </td>
    </tr>
  ))}

  {currentUsers.length === 0 && (
    <tr>
      <td
        colSpan="6"
        className="text-center text-gray-500 dark:text-gray-400 py-4 italic"
      >
        No users found.
      </td>
    </tr>
  )}
</tbody>

        </table>
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center items-center gap-3 pb-6">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage((prev) => prev - 1)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          &lt;
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? "bg-blue-600 text-white hover:bg-blue-700"
                : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage((prev) => prev + 1)}
          className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
        >
          &gt;
        </button>
      </div>
    </div>
  );
};

export default UserMaster;
