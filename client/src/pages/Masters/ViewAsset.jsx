import {
  FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaPalette,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaRupeeSign,
  FaImage,
  FaBuilding,
  FaUsers,
  FaLayerGroup,
} from "react-icons/fa";
import { useLocation } from "react-router-dom";

const ViewAsset = () => {
  const { state } = useLocation();
  const initialAsset = state?.asset || {};

  const assetDetails = [
    {
      label: "Asset Image",
      value: initialAsset?.image || null,
      icon: <FaImage />,
      isImage: true,
    },
    {
      label: "Asset Name",
      value: initialAsset?.name || "-",
      icon: <FaTag />,
    },
    {
      label: "Description",
      value: initialAsset?.description || "-",
      icon: <FaFileAlt />,
    },
    {
      label: "Purchase Value",
      value: initialAsset?.purchaseValue
        ? `₹${Number(initialAsset?.purchaseValue).toLocaleString("en-IN")}`
        : "-",
      icon: <FaRupeeSign />,
    },
    {
      label: "Artist",
      value: initialAsset?.artist || "-",
      icon: <FaPalette />,
    },
    {
      label: "Size",
      value: initialAsset?.size || "-",
      icon: <FaRulerCombined />,
    },
    {
      label: "Year",
      value: initialAsset?.year || "-",
      icon: <FaCalendarAlt />,
    },
    {
      label: "Asset Location Name",
      value: initialAsset?.locationId?.name || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Asset State",
      value: initialAsset?.locationId?.stateId?.name || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Asset Location Area",
      value: initialAsset?.locationId?.areaId?.name || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Department",
      value: initialAsset?.departmentId?.name || "-",
      icon: <FaUsers />,
    },
    {
      label: "Building Name",
      value: initialAsset?.buildingId?.name || "-",
      icon: <FaBuilding />,
    },
    {
      label: "Floor",
      value: initialAsset?.floorId?.name || "-",
      icon: <FaLayerGroup />,
    },
  ];

  return (
    <div className="px-6 md:px-10 py-8">
      <div className="bg-white dark:bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden mb-6">
        <div className="bg-gray-300 dark:bg-gray-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
            <FaFileAlt className="mr-2" />
            Asset Information
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {assetDetails.map((item, index) => (
            <div key={index} className="px-6 py-4 flex items-center">
              <div className="flex items-center space-x-3 w-full md:w-1/3">
                <span className="text-gray-500 dark:text-gray-400">
                  {item.icon}
                </span>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {item.label}
                </span>
              </div>

              <div className="w-full md:w-2/3 text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                {item.isImage && item.value ? (
                  <a
                    href={item.value}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img
                      src={item.value}
                      alt={item.label}
                      className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-gray-600 hover:opacity-80 transition"
                    />
                  </a>
                ) : item.isImage ? (
                  <span className="italic text-gray-400">No file</span>
                ) : (
                  item.value
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ViewAsset;