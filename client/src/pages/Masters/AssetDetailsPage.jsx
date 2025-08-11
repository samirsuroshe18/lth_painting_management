import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  FaCheck,
  FaTimes,
  FaClock,
  FaUser,
  FaCalendarAlt,
  FaTag,
  FaFileAlt,
  FaPalette,
  FaMapMarkerAlt,
  FaRulerCombined,
  FaDollarSign,
  FaCommentAlt,
  FaTimesCircle,
  FaPaperclip,
  FaImage,
} from "react-icons/fa";
import { reviewAuditStatus } from "../../api/auditLogApi";
import { useDispatch } from "react-redux";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";

const AssetDetailsPage = () => {
  const { state } = useLocation();
  const auditLog = state?.auditLog || {};
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [status, setStatus] = useState(auditLog?.reviewStatus || "pending");
  const [loadingAction, setLoadingAction] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectRemark, setRejectRemark] = useState("");
  const isProposedChangesEmpty = !auditLog?.proposedChanges || Object.keys(auditLog.proposedChanges).length === 0;

  const auditItems = [
    {
      label: "Auditor Remark",
      value: auditLog?.auditorRemark || "N/A",
      icon: <FaCommentAlt />,
    },
    {
      label: "Audit Done By",
      value: auditLog?.createdBy?.userName || "N/A",
      icon: <FaUser />,
    },
    {
      label: "Audit Date",
      value: auditLog?.assetId?.createdAt
        ? new Date(auditLog.assetId.createdAt).toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })
        : "-",
      icon: <FaCalendarAlt />,
    },
    ...(auditLog?.reviewStatus === "rejected"
      ? [
          {
            label: "Rejected Remark",
            value: auditLog?.rejectedRemark || "N/A",
            icon: <FaTimesCircle />,
          },
        ]
      : []),
    {
      label: "Audit File Attachment 1",
      value: auditLog?.attachmentOne || null,
      icon: <FaPaperclip />,
      isImage: true,
    },
    {
      label: "Audit File Attachment 2",
      value: auditLog?.attachmentTwo || null,
      icon: <FaPaperclip />,
      isImage: true,
    },
    {
      label: "Audit File Attachment 3",
      value: auditLog?.attachmentThree || null,
      icon: <FaPaperclip />,
      isImage: true,
    },
  ];

  const assetDetails = [
    {
      label: "Asset Image",
      value: auditLog.assetId?.image || null,
      icon: <FaImage />,
      isImage: true,
    },
    {
      label: "Asset Name",
      value: auditLog.assetId?.name || "-",
      icon: <FaTag />,
    },
    {
      label: "Description",
      value: auditLog.assetId?.description || "-",
      icon: <FaFileAlt />,
    },
    {
      label: "Purchase Value",
      value: auditLog.assetId?.purchaseValue
        ? `₹${Number(auditLog.assetId?.purchaseValue).toLocaleString("en-IN")}`
        : "-",
      icon: <FaDollarSign />,
    },
    {
      label: "Artist",
      value: auditLog.assetId?.artist || "-",
      icon: <FaPalette />,
    },
    {
      label: "Size",
      value: auditLog.assetId?.size || "-",
      icon: <FaRulerCombined />,
    },
    {
      label: "Year",
      value: auditLog.assetId?.year || "-",
      icon: <FaCalendarAlt />,
    },
    {
      label: "Asset Location Name",
      value: auditLog.assetId?.locationId?.name || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Asset State",
      value: auditLog.assetId?.locationId?.stateId?.name || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Asset Place",
      value: auditLog.assetId?.place || "-",
      icon: <FaMapMarkerAlt />,
    },
    {
      label: "Asset Location Area",
      value: auditLog.assetId?.locationId?.area || "-",
      icon: <FaMapMarkerAlt />,
    },
  ];

  const getStatusStyle = (s) => {
    switch ((s || "").toLowerCase()) {
      case "approved":
        return { bg: "bg-[#50cd89]", text: "text-white", icon: <FaCheck /> };
      case "rejected":
        return { bg: "bg-[#f1416c]", text: "text-white", icon: <FaTimes /> };
      case "pending":
        return { bg: "bg-[#ffc700]", text: "text-black", icon: <FaClock /> };
      default:
        return { bg: "bg-gray-500", text: "text-white", icon: <FaClock /> };
    }
  };

  const handleBack = () => navigate(-1);

  const approveAudit = async () => {
    try {
      setLoadingAction(true);
      await reviewAuditStatus(auditLog._id, { reviewStatus: "approved" });
      setStatus("approved");
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoadingAction(false);
    }
  };

  const confirmRejectAudit = async () => {
    try {
      setLoadingAction(true);
      await reviewAuditStatus(auditLog._id, {
        reviewStatus: "rejected",
        rejectedRemark: rejectRemark,
      });
      setStatus("rejected");
      setRejectOpen(false);
      setRejectRemark("");
    } catch (error) {
      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoadingAction(false);
    }
  };

  if (!auditLog) {
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

  const statusStyle = getStatusStyle(status);

  return (
    <div className="px-6 md:px-10 py-8">
      {/* Top status + actions */}
      <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div
          className={`inline-flex items-center gap-2 px-3 py-2 rounded ${statusStyle.bg} ${statusStyle.text}`}
        >
          {statusStyle.icon}
          <span className="uppercase tracking-wide text-sm font-semibold">
            {status}
          </span>
        </div>

        {status?.toLowerCase() === "pending" && (
          <div className="flex items-center gap-3">
            <button
              onClick={approveAudit}
              disabled={loadingAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#50cd89] text-white hover:opacity-95 transition disabled:opacity-60"
            >
              <FaCheck /> {loadingAction ? "Processing..." : "Approve"}
            </button>
            <button
              onClick={() => setRejectOpen(true)}
              disabled={loadingAction}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-[#f1416c] text-white hover:opacity-95 transition disabled:opacity-60"
            >
              <FaTimes /> Reject
            </button>
          </div>
        )}
      </div>

      {/* Asset Information */}
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

      {/* Edited Asset Details */}
      {isProposedChangesEmpty && (
        <div className="bg-white dark:bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden mb-6">
          <div className="bg-gray-300 dark:bg-gray-800 px-6 py-4">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
              <FaFileAlt className="mr-2" />
              Edited Asset Details
            </h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-gray-600">
            {[
              { key: "name", label: "Asset Name", icon: <FaTag /> },
              { key: "description", label: "Description", icon: <FaFileAlt /> },
              { key: "artist", label: "Artist", icon: <FaPalette /> },
              { key: "size", label: "Size", icon: <FaRulerCombined /> },
              {
                key: "purchaseValue",
                label: "Purchase Value",
                icon: <FaDollarSign />,
                format: (val) => `₹${Number(val).toLocaleString("en-IN")}`,
              },
              { key: "year", label: "Year", icon: <FaCalendarAlt /> },
              { key: "place", label: "Place", icon: <FaMapMarkerAlt /> },
              {
                key: "location",
                label: "Location",
                icon: <FaMapMarkerAlt />,
                format: (val) => val?.name || val || "-",
              },
              {
                key: "image",
                label: "Image",
                icon: <FaImage />,
                format: (val) => (
                  <a href={val} target="_blank" rel="noopener noreferrer">
                    <img
                      src={val}
                      alt="image"
                      className="w-16 h-16 object-cover rounded-md border border-gray-300 dark:border-gray-600 hover:opacity-80 transition"
                    />
                  </a>
                ),
              },
            ]
              .filter(({ key }) => {
                const value = auditLog.proposedChanges[key];
                return value !== null && value !== undefined && value !== "";
              })
              .map(({ key, label, icon, format }) => {
                const value = auditLog.proposedChanges[key];
                return (
                  <div key={key} className="px-6 py-4 flex items-center">
                    <div className="flex items-center space-x-3 w-full md:w-1/3">
                      <span className="text-gray-500 dark:text-gray-400">
                        {icon}
                      </span>
                      <span className="font-medium text-gray-700 dark:text-gray-300">
                        {label}
                      </span>
                    </div>
                    <div className="w-full md:w-2/3 text-gray-600 dark:text-gray-400 mt-2 md:mt-0">
                      {format ? format(value) : value}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Added Audit Details */}
      <div className="bg-white dark:bg-[#1E1E1E] shadow-md rounded-lg overflow-hidden">
        <div className="bg-gray-300 dark:bg-gray-800 px-6 py-4">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white flex items-center">
            Added Audit Details
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-600">
          {auditItems.map((item, index) => (
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

      {/* Reject modal */}
      {rejectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#1E1E1E] w-full max-w-md rounded-lg shadow-lg overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-700">
              <h4 className="text-lg font-semibold">Reject Audit</h4>
            </div>
            <div className="px-5 py-4 space-y-3">
              <label className="text-sm text-gray-600 dark:text-gray-300">
                Reject Remark
              </label>
              <textarea
                rows={4}
                value={rejectRemark}
                onChange={(e) => setRejectRemark(e.target.value)}
                placeholder="Add a reason for rejection..."
                className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-transparent px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-5 py-4 flex items-center justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => {
                  setRejectOpen(false);
                  setRejectRemark("");
                }}
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition"
              >
                Cancel
              </button>
              <button
                onClick={confirmRejectAudit}
                disabled={!rejectRemark.trim() || loadingAction}
                className={`px-4 py-2 rounded-md text-white transition ${
                  rejectRemark.trim()
                    ? "bg-[#f1416c] hover:opacity-95"
                    : "bg-gray-400 cursor-not-allowed"
                }`}
              >
                {loadingAction ? "Processing..." : "Confirm Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetailsPage;