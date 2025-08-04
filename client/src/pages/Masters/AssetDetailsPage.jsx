import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { viewAsset } from '../../api/assetMasterApi'; // Adjust API import as needed
import { 
  FaArrowLeft, 
  FaCheck, 
  FaTimes, 
  FaClock, 
  FaUser, 
  FaCalendarAlt, 
  FaTag, 
  FaFileAlt,
  FaEdit,
  FaDownload,
  FaEye,
  FaPalette,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaDollarSign
} from 'react-icons/fa';

const AssetDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [asset, setAsset] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch asset details
  const fetchAssetDetails = async () => {
    try {
      setLoading(true);
      const response = await viewAsset(id); // You'll need to implement this API call
      setAsset(response?.data || response);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch asset details:', err);
      setError('Failed to load asset details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchAssetDetails();
    }
  }, [id]);

  // Get status styling
  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case 'approved':
        return { bg: 'bg-[#50cd89]', text: 'text-white', icon: <FaCheck /> };
      case 'rejected':
        return { bg: 'bg-[#f1416c]', text: 'text-white', icon: <FaTimes /> };
      case 'pending':
        return { bg: 'bg-[#ffc700]', text: 'text-white', icon: <FaClock /> };
      default:
        return { bg: 'bg-gray-500', text: 'text-white', icon: <FaClock /> };
    }
  };

  const handleBack = () => {
    navigate(-1); // Go back to previous page
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ef7]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-[#009ef7] text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-gray-500 text-xl mb-4">Asset not found</div>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-[#009ef7] text-white rounded-lg hover:bg-blue-600 transition"
        >
          Go Back
        </button>
      </div>
    );
  }

  const statusStyle = getStatusStyle(asset.reviewStatus);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">Asset Details</h1>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#009ef7] text-white rounded-lg hover:bg-blue-600 transition">
            <FaEdit />
            <span>Edit</span>
          </button>
          <button className="flex items-center space-x-2 px-4 py-2 bg-[#50cd89] text-white rounded-lg hover:bg-green-600 transition">
            <FaDownload />
            <span>Download QR</span>
          </button>
        </div>
      </div>

      {/* Status Card */}
      <div className={`${statusStyle.bg} text-white p-6 rounded-lg shadow-md mb-6`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">{statusStyle.icon}</div>
            <div>
              <h2 className="text-xl font-semibold">{asset.name || 'Unnamed Asset'}</h2>
              <p className="text-lg opacity-90">Status: {asset.reviewStatus || 'Unknown'}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm opacity-75">Asset ID</p>
            <p className="font-mono text-lg">{asset._id}</p>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Asset Image and QR Code */}
        <div className="lg:col-span-1">
          {/* Asset Image */}
          {asset.image && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Asset Image</h3>
              </div>
              <div className="p-4">
                <img 
                  src={asset.image} 
                  alt={asset.name}
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>
            </div>
          )}

          {/* QR Code */}
          {asset.qrCode && (
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
              <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
                <h3 className="text-lg font-semibold text-gray-700 dark:text-white">QR Code</h3>
              </div>
              <div className="p-4 flex justify-center">
                <img 
                  src={asset.qrCode} 
                  alt="QR Code"
                  className="w-48 h-48 border rounded-lg"
                />
              </div>
            </div>
          )}

          {/* Location Information */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
                <FaMapMarkerAlt className="mr-2" />
                Location Details
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {asset.locationId?.name || '-'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Current Place</p>
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  {asset.place || '-'}
                </p>
              </div>
            </div>
          </div>
        </div>

       {/* Asset Information Table */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden mb-6">
            <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
                <FaFileAlt className="mr-2" />
                Asset Information
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {[
                { label: 'Asset Name', value: asset.name || '-', icon: <FaTag /> },
                { label: 'Description', value: asset.description || '-', icon: <FaFileAlt /> },
                { label: 'Artist', value: asset.artist || '-', icon: <FaPalette /> },
                { label: 'Size', value: asset.size || '-', icon: <FaRulerCombined /> },
                { label: 'Purchase Value', value: asset.purchaseValue ? `₹${Number(asset.purchaseValue).toLocaleString('en-IN')}` : '-', icon: <FaDollarSign /> },
                { 
                  label: 'Year', 
                  value: asset.year ? new Date(asset.year).getFullYear() : '-', 
                  icon: <FaCalendarAlt /> 
                },
                { 
                  label: 'Status', 
                  value: asset.status ? 'Active' : 'Inactive', 
                  icon: asset.status ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-500" /> 
                },
                { 
                  label: 'Review Status', 
                  value: asset.reviewStatus || '-', 
                  icon: statusStyle.icon,
                  isStatus: true // Add flag to identify this as a status field
                },
              ].map((item, index) => (
                <div key={index} className="px-6 py-4 flex items-center">
                  <div className="flex items-center space-x-3 w-1/3">
                    <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <div className="w-2/3 text-gray-600 dark:text-gray-400">
                    {item.isStatus ? (
                      <span className={`font-medium ${
                        item.value?.toLowerCase() === 'approved' ? 'text-green-600 dark:text-green-400' :
                        item.value?.toLowerCase() === 'rejected' ? 'text-red-600 dark:text-red-400' :
                        item.value?.toLowerCase() === 'pending' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-gray-600 dark:text-gray-400'
                      }`}>
                        {item.value}
                      </span>
                    ) : (
                      item.value
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Information */}
          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
            <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
                
                Audit Trail
              </h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-600">
              {[
                { 
                  label: 'Created By', 
                  value: asset.createdBy?.userName || '-', 
                  icon: <FaUser /> 
                },
                { 
                  label: 'Created At', 
                  value: asset.createdAt ? new Date(asset.createdAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }) : '-', 
                  icon: <FaCalendarAlt /> 
                },
                { 
                  label: 'Updated By', 
                  value: asset.updatedBy?.userName || '-', 
                  icon: <FaUser /> 
                },
                { 
                  label: 'Last Updated', 
                  value: asset.updatedAt ? new Date(asset.updatedAt).toLocaleString('en-IN', {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true,
                  }) : '-', 
                  icon: <FaCalendarAlt /> 
                },
              ].map((item, index) => (
                <div key={index} className="px-6 py-4 flex items-center">
                  <div className="flex items-center space-x-3 w-1/3">
                    <span className="text-gray-500 dark:text-gray-400">{item.icon}</span>
                    <span className="font-medium text-gray-700 dark:text-gray-300">{item.label}</span>
                  </div>
                  <div className="w-2/3 text-gray-600 dark:text-gray-400">
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-300 dark:bg-gray-700 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">Quick Actions</h3>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <button className="flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <FaEye />
            <span>View History</span>
          </button>
          <button 
            onClick={() => window.open(asset.qrCode, '_blank')}
            className="flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
          >
            <FaDownload />
            <span>Download QR</span>
          </button>
          <button className="flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <FaFileAlt />
            <span>Generate Report</span>
          </button>
          <button className="flex items-center justify-center space-x-3 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition">
            <FaEdit />
            <span>Edit Asset</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssetDetailsPage;