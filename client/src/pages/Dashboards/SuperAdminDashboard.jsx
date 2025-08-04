import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Add this import
import { getAssets, viewAsset } from '../../api/assetMasterApi';
import { FaCheck, FaTimes, FaClock, FaList, FaEye } from 'react-icons/fa';

const statusFilters = [
  { label: 'All Audits', value: 'all', color: 'bg-[#009ef7]', icon: <FaList /> },
  { label: 'Review Pending', value: 'Pending', color: 'bg-[#ffc700]', icon: <FaClock /> },
  { label: 'Approved', value: 'Approved', color: 'bg-[#50cd89]', icon: <FaCheck /> },
  { label: 'Rejected', value: 'Rejected', color: 'bg-[#f1416c]', icon: <FaTimes /> }
];

const ITEMS_PER_PAGE = 5;

const SuperAdminDashboard = () => {
  const navigate = useNavigate(); // Add this hook
  const [activeFilter, setActiveFilter] = useState('all');
  const [assets, setAssets] = useState([]);
  const [counts, setCounts] = useState({ all: 0, Pending: 0, Approved: 0, Rejected: 0 });
  const [currentPage, setCurrentPage] = useState(1);

  const fetchAssets = async () => {
    try {
      const res = await getAssets('');
      const allAssets = res?.data?.assets || [];

      const countMap = {
        all: allAssets.length,
        Pending: allAssets.filter(asset => asset.reviewStatus?.toLowerCase() === 'pending').length,
        Approved: allAssets.filter(asset => asset.reviewStatus?.toLowerCase() === 'approved').length,
        Rejected: allAssets.filter(asset => asset.reviewStatus?.toLowerCase() === 'rejected').length,
      };
      setCounts(countMap);

      const filteredAssets =
        activeFilter === 'all'
          ? allAssets
          : allAssets.filter(asset => asset.reviewStatus?.toLowerCase() === activeFilter.toLowerCase());

      setAssets(filteredAssets);
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch assets', err);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, [activeFilter]);

  // Function to handle navigation to asset details page
  const handleViewAsset = (assetId) => {
    navigate(`/masters/asset/${assetId}`); // Adjust the route as needed
  };

  const totalPages = Math.ceil(assets.length / ITEMS_PER_PAGE);
  const paginatedAssets = assets.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <div>
      {/* Top Filter Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {statusFilters.map(filter => (
          <div
            key={filter.value}
            className={`cursor-pointer text-white px-4 py-6 rounded-lg shadow-md flex items-center justify-between transition-all duration-300 ease-in-out hover:scale-105 ${
              filter.color
            } ${activeFilter === filter.value ? 'ring-3 ring-offset ring-gray-200 shadow-xl' : ''}`}
            onClick={() => setActiveFilter(filter.value)}
          >
            <div>
              <h3 className="text-lg font-semibold">{filter.label}</h3>
              <p className="text-2xl font-bold">
                {counts[filter.value] !== undefined ? counts[filter.value] : 0}
              </p>
            </div>
            <div className="text-3xl opacity-70">{filter.icon}</div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-auto transition-all duration-500">
        <table className="w-full table-auto border-collapse">
          <thead className="bg-gray-300 dark:bg-gray-800 text-gray-700 dark:text-white">
            <tr className="text-left font-semibold">
              <th className="px-6 py-4 border-b dark:border-gray-600">Sr. No</th>
              <th className="px-6 py-4 border-b dark:border-gray-600">Asset Name</th>
              <th className="px-6 py-4 border-b dark:border-gray-600">Status</th>
              <th className="px-6 py-4 border-b dark:border-gray-600">Auditor</th>
              <th className="px-6 py-4 border-b dark:border-gray-600">Created At</th>
              <th className="px-6 py-4 border-b dark:border-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAssets.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500 dark:text-gray-400">
                  No assets found.
                </td>
              </tr>
            ) : (
              paginatedAssets.map((asset, index) => (
                <tr
                  key={asset._id}
                  className={`transition-colors duration-300 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    index % 2 === 0 ? 'bg-white/60 dark:bg-white/5' : 'bg-transparent'
                  }`}
                >
                  <td className="px-6 py-4 border-b dark:border-gray-600">
                    {(currentPage - 1) * ITEMS_PER_PAGE + index + 1}
                  </td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">{asset.name || '-'}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">{asset.reviewStatus}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">{asset.createdBy?.userName || '-'}</td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">
                    {new Date(asset.createdAt).toLocaleString('en-IN', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </td>
                  <td className="px-6 py-4 border-b dark:border-gray-600">
                    <button
                      onClick={() => handleViewAsset(asset._id)}
                      className="text-blue-600 px-3 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition"
                      title="View Asset"
                    >
                        <FaEye className="text-xl" />
                    </button>
                  </td>
                </tr>
              ))
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

export default SuperAdminDashboard;