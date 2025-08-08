import { useCallback, useMemo, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { IconButton, Tooltip, Box, Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography, CircularProgress,} from "@mui/material";
import { CheckCircle, Cancel, QrCode } from "@mui/icons-material";
import { getAssets, removeAsset, viewAsset } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
import { History } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import { DataSourceCache, List } from "@toolpad/core/Crud";

const peopleCache = new DataSourceCache();

export default function AssetMaster() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [refreshToken, setRefreshToken] = useState(0);
  const [qrDialogOpen, setQrDialogOpen] = useState(false);
  const [selectedQr, setSelectedQr] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const rowsRef = useRef(new Map());
  const hiddenIdsRef = useRef(new Set());
  const [hiddenTick, setHiddenTick] = useState(0);

  function findAssetInCache(cache, id) {
    const key = String(id);
    const buckets = Object.values((cache && cache.cache) || {});
    for (const bucket of buckets) {
      const items = (bucket && bucket.value && bucket.value.items) || [];
      const hit = items.find((item) => String(item && item.id) === key);
      if (hit) return hit;
    }
    return undefined;
  }

  const handleRowClick = useCallback(
    (assetId) => {
      const key = String(assetId);
      const asset = rowsRef.current.get(key) || findAssetInCache(peopleCache, assetId);
      if (asset) {
        navigate("edit-asset", { state: { asset, read: true } });
      } else {
        console.warn("Row not found for id:", assetId);
      }
    },
    [navigate]
  );

  const handleCreateClick = useCallback(() => {
    navigate("new");
  }, [navigate]);

  const handleApprove = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "success",
        message: "Asset approved successfully",
      })
    );
  };

  const handleReject = (assetId) => {
    dispatch(
      showNotificationWithTimeout({
        show: true,
        type: "info",
        message: "Asset rejected",
      })
    );
  };

  const handleEdit = (row) => {
    navigate("edit-asset", { state: { asset: row } });
  };

  // UPDATED: optimistic delete with rollback
  const handleDelete = async () => {
    const idStr = String(assetToDelete?.id || assetToDelete?._id);
    if (!idStr) return;

    // Optimistically hide immediately
    hiddenIdsRef.current.add(idStr);
    setHiddenTick((t) => t + 1); // force List to refetch via dataSource update
    setDeleteDialogOpen(false);

    try {
      setLoading(true);
      const response = await removeAsset(idStr);

      // Keep local caches clean
      rowsRef.current.delete(idStr);

      // Optional: true server resync (pagination/total)
      setRefreshToken((t) => t + 1);

      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "success",
          message: response?.message || "Asset deleted",
        })
      );
    } catch (error) {
      // Rollback: show it again
      hiddenIdsRef.current.delete(idStr);
      setHiddenTick((t) => t + 1);

      dispatch(
        showNotificationWithTimeout({
          show: true,
          type: "error",
          message: handleAxiosError(error),
        })
      );
    } finally {
      setLoading(false);
    }
  };

  const handleHistory = (assetId) => {
    navigate("log-history", { state: { assetId } });
  };

  const CustomActions = ({ row }) => (
    <Box sx={{ display: "flex", gap: 0.5 }}>
      {row.reviewStatus === "pending" && (
        <>
          <Tooltip title="Approve">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row._id);
              }}
              sx={{ color: "success.main" }}
            >
              <CheckCircle fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleReject(row._id);
              }}
              sx={{ color: "error.main" }}
            >
              <Cancel fontSize="small" />
            </IconButton>
          </Tooltip>
        </>
      )}

      <Tooltip title="QR Code">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            const src = row.qrCode?.startsWith("data:image")
              ? row.qrCode
              : "data:image/png;base64," + row.qrCode;
            setSelectedQr(src);
            setQrDialogOpen(true);
          }}
          sx={{ color: "primary.main" }}
        >
          <QrCode fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Edit Asset">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleEdit(row);
          }}
          sx={{ color: "warning.main" }}
        >
          <EditIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Delete">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            setAssetToDelete(row);
            setDeleteDialogOpen(true);
          }}
          sx={{ color: "error.main" }}
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Audit Logs">
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            handleHistory(row._id);
          }}
          sx={{ color: "secondary.main" }}
        >
          <History fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );

  const assetsDataSource = useMemo(() => {
    return {
      fields: [
        { field: "srNo", headerName: "Sr. No", flex: 0, minWidth: 80 },

        // Only elastic column
        { field: "name", headerName: "Name", flex: 2, minWidth: 150 },

        {
          field: "location",
          headerName: "Location",
          flex: 2,
          minWidth: 120,
          renderCell: (params) => (
            <span>{params.row.locationId?.name || "-"}</span>
          ),
        },
        { field: "place", headerName: "Place", flex: 2, minWidth: 120 },
        {
          field: "status",
          headerName: "Status",
          flex: 1,
          minWidth: 100,
          renderCell: (p) => (
            <span>{p.row.status ? "Active" : "Inactive"}</span>
          ),
        },
        {
          field: "reviewStatus",
          headerName: "Review Status",
          flex: 1,
          minWidth: 140,
        },

        {
          field: "customActions",
          headerName: "Actions",
          flex: 2,
          minWidth: 210,
          sortable: false,
          filterable: false,
          renderCell: (params) => (
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                height: "100%",
                justifyContent: "end",
                gap: 0.5,
              }}
            >
              <CustomActions row={params.row} />
            </Box>
          ),
        },
      ],

      getMany: async ({ paginationModel, filterModel, sortModel }) => {
        try {
          const page = (paginationModel?.page || 0) + 1;
          const limit = paginationModel?.pageSize || 5;
          const params = { page, limit };

          if (filterModel?.items?.length) {
            filterModel.items.forEach(({ field, value, operator }) => {
              if (!field || value == null || value === "") return;
              if (field === "name" && operator === "contains") {
                params.search = value;
              }
              if (field === "reviewStatus" && operator === "equals") {
                params.status = value;
              }
              if (field === "startDate") params.startDate = value;
              if (field === "endDate") params.endDate = value;
            });
          }

          if (sortModel?.length) {
            const sortField = sortModel[0]?.field;
            const sortOrder = sortModel[0]?.sort === "asc" ? 1 : -1;
            params.sortField = sortField;
            params.sortOrder = sortOrder;
          }

          const res = await getAssets(params);

          // Normalize & index rows
          let response = (res.data.assets || []).map((asset, index) => ({
            ...asset,
            id: asset._id,
            srNo: (page - 1) * limit + index + 1,
          }));

          // Put in our own cache
          response.forEach((row) => rowsRef.current.set(String(row.id), row));
          setData(response);

          // Optimistic hide: remove rows whose ids are in hidden set
          const hidden = hiddenIdsRef.current;
          const filtered = response.filter(
            (row) => !hidden.has(String(row.id))
          );

          return {
            items: filtered,
            // Keep server total to preserve pagination, or switch to filtered.length
            itemCount: res.data.pagination?.totalEntries ?? filtered.length,
          };
        } catch (error) {
          dispatch(
            showNotificationWithTimeout({
              show: true,
              type: "error",
              message: handleAxiosError(error),
            })
          );
          return { items: [], itemCount: 0 };
        }
      },
    };
    // include hiddenTick so List refetches when we hide/unhide rows optimistically
  }, [dispatch, refreshToken, hiddenTick]);

  return (
    <>
      <List
        dataSource={assetsDataSource}
        dataSourceCache={peopleCache}
        initialPageSize={5}
        onRowClick={handleRowClick}
        onCreateClick={handleCreateClick}
        on
      />

      <Dialog open={qrDialogOpen} onClose={() => setQrDialogOpen(false)}>
        <DialogTitle>QR Code</DialogTitle>
        <DialogContent>
          {selectedQr && (
            <img
              src={selectedQr}
              alt="QR Code"
              style={{
                width: 256,
                height: 256,
                margin: "auto",
                display: "block",
              }}
            />
          )}
        </DialogContent>
        <DialogActions>
          {selectedQr && (
            <Button
              component="a"
              href={selectedQr}
              download="qrcode.png"
              color="primary"
              variant="contained"
            >
              Download QR
            </Button>
          )}
          <Button onClick={() => setQrDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>Delete Asset</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{assetToDelete?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="error"
            fullWidth={window.innerWidth < 600}
            disabled={loading}
            onClick={handleDelete}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                minWidth: "72px",
                height: "24px",
              }}
            >
              {loading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Delete"
              )}
            </Box>
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
