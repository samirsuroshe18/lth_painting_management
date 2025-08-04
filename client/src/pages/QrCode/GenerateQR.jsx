import React, { useEffect, useState } from 'react';
import { getAssets } from '../../api/assetMasterApi';
import { FaQrcode, FaMapMarkerAlt, FaDownload, FaSearch, FaFilter } from 'react-icons/fa';

const GenerateQR = () => {
  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      setLoading(true);
      const res = await getAssets('');
      const allAssets = res?.data?.assets || [];
      
      // Filter assets that have QR codes
      const assetsWithQR = allAssets.filter(asset => asset.qrCode);
      
      setAssets(assetsWithQR);
      setFilteredAssets(assetsWithQR);
      
      // Extract unique locations
      const uniqueLocations = [...new Set(
        assetsWithQR
          .map(asset => asset.locationId?.name)
          .filter(location => location)
      )];
      
      setLocations(uniqueLocations);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch assets:', err);
      setError('Failed to load QR codes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  // Filter assets based on location and search term
  useEffect(() => {
    let filtered = assets;

    // Filter by location
    if (selectedLocation !== 'all') {
      filtered = filtered.filter(asset => 
        asset.locationId?.name === selectedLocation
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredAssets(filtered);
  }, [selectedLocation, searchTerm, assets]);

  // Handle QR code download
  const downloadQRCode = (qrCode, assetName) => {
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `QR_${assetName?.replace(/[^a-zA-Z0-9]/g, '_') || 'Asset'}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#009ef7] mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading QR codes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="text-red-500 text-xl mb-4">{error}</div>
        <button
          onClick={fetchAssets}
          className="px-4 py-2 bg-[#009ef7] text-white rounded-lg hover:bg-blue-600 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center">
          <FaQrcode className="mr-3 text-[#009ef7]" />
          QR Code Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          View and download QR codes for all assets
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search assets by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#009ef7] focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Location Filter */}
          <div className="flex items-center space-x-2">
            <FaFilter className="text-gray-500 dark:text-gray-400" />
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-[#009ef7] focus:border-transparent dark:bg-gray-700 dark:text-white min-w-[200px]"
            >
              <option value="all">All Locations</option>
              {locations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
          </div>

          {/* Results Count */}
          <div className="text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            {filteredAssets.length} of {assets.length} assets
          </div>
        </div>
      </div>

      {/* QR Code Grid */}
      {filteredAssets.length === 0 ? (
        <div className="text-center py-12">
          <FaQrcode className="mx-auto text-6xl text-gray-300 dark:text-gray-600 mb-4" />
          <h3 className="text-xl font-semibold text-gray-500 dark:text-gray-400 mb-2">
            No QR codes found
          </h3>
          <p className="text-gray-400 dark:text-gray-500">
            {searchTerm || selectedLocation !== 'all' 
              ? 'Try adjusting your filters'
              : 'No assets with QR codes available'
            }
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredAssets.map(asset => (
            <div
              key={asset._id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 p-4 group h-80 flex flex-col"
            >
              {/* QR Code Image - Fixed Height */}
              <div className="relative mb-4 flex-shrink-0">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 flex justify-center items-center h-40">
                  <img
                    src={asset.qrCode}
                    alt={`QR Code for ${asset.name}`}
                    className="w-full h-full max-w-[120px] max-h-[120px] object-contain"
                  />
                </div>
                
                
              </div>

              {/* Asset Information - Flexible Content */}
              <div className="text-center flex-grow flex flex-col justify-between">
                <div>
                  {/* Asset Name - Fixed Height with Tooltip */}
                  <div className="h-12 mb-2 flex items-center justify-center">
                    <h3 
                      className="font-semibold text-gray-800 dark:text-white text-sm leading-tight line-clamp-2 px-1"
                      title={asset.name || 'Unnamed Asset'}
                    >
                      {asset.name || 'Unnamed Asset'}
                    </h3>
                  </div>
                  
                  {/* Location - Fixed Height */}
                  <div className="h-6 mb-2 flex items-center justify-center">
                    {asset.locationId?.name && (
                      <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                        <FaMapMarkerAlt className="mr-1 flex-shrink-0" />
                        <span className="truncate max-w-[140px]" title={asset.locationId.name}>
                          {asset.locationId.name}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Asset ID */}
                  <p className="text-xs text-gray-400 dark:text-gray-500 font-mono mb-3">
                    ID: {asset._id.slice(-8)}
                  </p>
                </div>

                {/* Download Button - Always at Bottom */}
                <button
                  onClick={() => downloadQRCode(asset.qrCode, asset.name)}
                  className="w-full px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors duration-200 text-sm flex items-center justify-center space-x-2 mt-auto"
                >
                  <FaDownload />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bulk Actions */}
      {/* {filteredAssets.length > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => {
              filteredAssets.forEach(asset => {
                setTimeout(() => downloadQRCode(asset.qrCode, asset.name), 100);
              });
            }}
            className="px-6 py-3 bg-[#009ef7] text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 flex items-center space-x-2 mx-auto"
          >
            <FaDownload />
            <span>Download All QR Codes</span>
          </button>
        </div>
      )} */}

      {/* Add CSS for line-clamp */}
      <style jsx>{`
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default GenerateQR;