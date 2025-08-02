import React, { useEffect, useState } from "react";
import {
  getAllLocations,
  addLocation,
  updateLocation,
} from "../../api/locationApi";
import { getAllStates } from "../../api/stateApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import editIcon from "@/assets/icons/edit.png";
import { motion, AnimatePresence } from "framer-motion";
import { FaChevronLeft } from "react-icons/fa";

const LocationMaster = () => {
  const [locations, setLocations] = useState([]);
  const [states, setStates] = useState([]);
  const [locationName, setLocationName] = useState("");
  const [selectedStates, setSelectedStates] = useState("");
  const [area, setArea] = useState("");
  const [status, setStatus] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editStateId, setEditStateId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const dispatch = useDispatch();
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentLocation = locations.slice(indexOfFirstItem, indexOfLastItem);
  const fetchLocations = async () => {
    try {
      const result = await getAllLocations();
      setLocations(result?.data || []);
    } catch (error) {
      console.error("Error fetching Location:", error);
    }
  };

  const fetchStates = async () => {
    try {
      const result = await getAllStates();
      setStates(result?.data || []);
    } catch (error) {
      console.error("Error fetching States:", error);
    }
  };

  useEffect(() => {
    fetchLocations();
    fetchStates();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!locationName || !status) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: "Please fill in all fields.",
        })
      );
      return;
    }

    try {
      if (editMode) {
        await updateLocation(editStateId, {
          name: locationName,
          state: selectedStates, 
          area: area,
          status: status,
        });

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State updated successfully",
          })
        );
      } else {
        await addLocation({
          name: locationName,
          state: selectedStates, 
          area: area,
          status: status,
        });

        dispatch(
          showNotificationWithTimeout({
            show: true,
            type: "success",
            message: "State added successfully",
          })
        );
      }

      setLocationName("");
      setSelectedStates("");
      setArea("");
      setStatus("");
      setEditStateId(null);
      setEditMode(false);
      setShowModal(false);
      fetchLocations();
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: editMode ? "Failed to update state" : "Failed to add state",
        })
      );
    }
  };

  const handleEditClick = (state) => {
    setLocationName(state.name);
    setSelectedStates(state.stateId._id);
    setArea(state.area);
    setStatus(state.status ? "active" : "inactive");
    setEditStateId(state._id);
    setEditMode(true);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditMode(false);
    setLocationName("");
    setSelectedStates("");
    setArea("");
    setStatus("");
    setEditStateId(null);
  };

  return (
    <div className="p-6 text-gray-800 dark:text-gray-100 transition-colors duration-300">
      {/* Modal with Animation */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-white/30 dark:bg-black/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative bg-white dark:bg-[#1e1e1e] p-6 rounded-2xl w-full max-w-2xl shadow-xl border border-gray-200 dark:border-gray-700 transition-colors duration-300"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl font-bold"
                aria-label="Close"
              >
                ×
              </button>

              <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-gray-100">
                {editMode ? "Edit Location" : "Add New Location"}
              </h2>

              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {/* Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={locationName}
                      onChange={(e) => setLocationName(e.target.value)}
                      placeholder="Enter Location name"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Select State */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Select State
                    </label>
                    <select
                      value={selectedStates}
                      onChange={(e) => setSelectedStates(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Choose state</option>
                      {states.map((state) => (
                        <option key={state._id} value={state._id}>
                          {state.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Area
                    </label>
                    <input
                      type="text"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                      placeholder="Enter area"
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2a2a2a] text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select status</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Buttons - centered below the grid */}
                <div className="flex justify-center gap-4">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-gray-700 dark:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                  >
                    {editMode ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gray-100 dark:bg-[#1e1e1e] p-6 rounded-2xl shadow-md transition-colors duration-300">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-100">
            Location List
          </h3>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-sm shadow transition cursor-pointer"
            onClick={() => {
              setShowModal(true);
              setEditMode(false);
              setLocationName("");
              setSelectedStates("");
              setArea("");
              setStatus("");
            }}
          >
            + Add New Location
          </button>
        </div>

        {locations.length === 0 ? (
          <div className="text-gray-500 dark:text-gray-400 text-center py-6">
            No states found.
          </div>
        ) : (
          <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden">
            {/* Desktop Header */}
            <div className="hidden sm:grid grid-cols-6 font-semibold bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-100 py-2 px-2">
              <div>Sr.No</div>
              <div>Name</div>
              <div>State</div>
              <div>Area</div>
              <div>Status</div>
              <div>Action</div>
            </div>

            {/* Responsive Rows */}
            {currentLocation.map((state, index) => (
              <div
                key={state._id}
                className={`grid sm:grid-cols-6 grid-cols-1 sm:items-center py-2 px-4 gap-1 text-gray-800 dark:text-gray-200 border-t border-gray-200 dark:border-gray-700 ${
                  index % 2 === 0
                    ? "bg-white/60 dark:bg-white/5"
                    : "bg-transparent"
                }`}
              >
                <div className="text-center sm:text-left">
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    Sr.No:{" "}
                  </span>
                  {indexOfFirstItem + index + 1}
                </div>
                <div className="break-words">
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    Name:{" "}
                  </span>
                  {state.name}
                </div>
                <div className="break-words">
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    State:{" "}
                  </span>
                  {state.stateId.name}
                </div>
                <div className="break-words">
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    State:{" "}
                  </span>
                  {state.area}
                </div>
                <div>
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    Status:{" "}
                  </span>
                  <span
                    className={`inline-block px-3 py-1 text-xs font-medium rounded-full ${
                      state.status
                        ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                    }`}
                  >
                    {state.status ? "Active" : "Inactive"}
                  </span>
                </div>
                <div>
                  <span className="sm:hidden font-medium text-gray-500 dark:text-gray-400">
                    Action:{" "}
                  </span>
                  <button
                    className="transition cursor-pointer"
                    title="Edit"
                    onClick={() => handleEditClick(state)}
                  >
                    <img
                      src={editIcon}
                      alt="Edit"
                      className="h-8 w-14 object-contain transition duration-200 hover:brightness-150"
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {Math.ceil(locations.length / itemsPerPage) > 1 && (
          <div className="flex justify-center items-center mt-4 gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              &lt;
            </button>

            {[...Array(Math.ceil(locations.length / itemsPerPage)).keys()].map(
              (page) => (
                <button
                  key={page + 1}
                  onClick={() => setCurrentPage(page + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === page + 1
                      ? "bg-blue-600 text-white hover:bg-blue-700"
                      : "border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200"
                  }`}
                >
                  {page + 1}
                </button>
              )
            )}

            <button
              onClick={() =>
                setCurrentPage((prev) =>
                  Math.min(prev + 1, Math.ceil(locations.length / itemsPerPage))
                )
              }
              disabled={
                currentPage === Math.ceil(locations.length / itemsPerPage)
              }
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LocationMaster;
