import React, { useEffect, useState, useCallback } from "react";
import { assetsData } from "../../redux/slices/assetMasterSlice";
import { useDispatch, useSelector } from "react-redux";
import { getAssets } from "../../api/assetMasterApi";
import { showNotificationWithTimeout } from "../../redux/slices/notificationSlice";
import { handleAxiosError } from "../../utils/handleAxiosError";
import { DataSourceCache, List } from "@toolpad/core/Crud";

const AssetMaster = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [queryParams, setQueryParams] = useState({
    page: "1",
    limit: "5",
  });
  
  // Get data from Redux store
  const data = useSelector((state) => state.assetMaster.assetData);
  console.log("Asset data:", data);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAssets(queryParams);
      dispatch(assetsData(res.data));
    } catch (error) {
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
  }, [dispatch, queryParams]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Helper function to get nested property value
  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  };

  // Helper function to normalize data with proper id field
  const normalizeAssetData = (assets) => {
    if (!Array.isArray(assets)) return [];
    return assets.map(asset => ({
      ...asset,
      id: asset._id // Add id field for MUI compatibility
    }));
  };

  const assetsDataSource = {
    fields: [
      {
        field: "name",
        headerName: "Name",
      },
      {
        field: "locationId.name",
        headerName: "Location",
      },
      {
        field: "place",
        headerName: "Place",
      },
      {
        field: "status",
        headerName: "Active",
        type: "boolean",
      },
      {
        field: "reviewStatus",
        headerName: "Review Status",
      },
    ],
    getRowId: (row) => row._id || row.id,
    getMany: async ({ paginationModel, filterModel, sortModel }) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      // Ensure data is an array and normalize it
      let processedAssets = normalizeAssetData(data?.assets || []);

      // Apply filters
      if (filterModel?.items?.length) {
        filterModel.items.forEach(({ field, value, operator }) => {
          if (!field || value == null) {
            return;
          }

          processedAssets = processedAssets.filter((asset) => {
            // Handle nested properties like "locationId.name"
            const assetValue = field.includes('.') 
              ? getNestedValue(asset, field)
              : asset[field];

            if (assetValue == null) return false;

            switch (operator) {
              case "contains":
                return String(assetValue)
                  .toLowerCase()
                  .includes(String(value).toLowerCase());
              case "equals":
                return assetValue === value;
              case "startsWith":
                return String(assetValue)
                  .toLowerCase()
                  .startsWith(String(value).toLowerCase());
              case "endsWith":
                return String(assetValue)
                  .toLowerCase()
                  .endsWith(String(value).toLowerCase());
              case ">":
                return assetValue > value;
              case "<":
                return assetValue < value;
              default:
                return true;
            }
          });
        });
      }

      // Apply sorting
      if (sortModel?.length) {
        processedAssets.sort((a, b) => {
          for (const { field, sort } of sortModel) {
            const aValue = field.includes('.') ? getNestedValue(a, field) : a[field];
            const bValue = field.includes('.') ? getNestedValue(b, field) : b[field];
            
            // Handle null/undefined values
            if (aValue == null && bValue == null) continue;
            if (aValue == null) return sort === "asc" ? -1 : 1;
            if (bValue == null) return sort === "asc" ? 1 : -1;
            
            if (aValue < bValue) {
              return sort === "asc" ? -1 : 1;
            }
            if (aValue > bValue) {
              return sort === "asc" ? 1 : -1;
            }
          }
          return 0;
        });
      }

      // Apply pagination
      const start = paginationModel.page * paginationModel.pageSize;
      const end = start + paginationModel.pageSize;
      const paginatedAssets = processedAssets.slice(start, end);

      return {
        items: paginatedAssets,
        itemCount: processedAssets.length,
      };
    },
    deleteOne: async (assetId) => {
      // Simulate loading delay
      await new Promise((resolve) => {
        setTimeout(resolve, 750);
      });

      // Filter out the deleted asset using both _id and id for compatibility
      const updatedAssets = (data?.assets || []).filter(
        (asset) => asset._id !== assetId && asset.id !== assetId
      );
      
      // Dispatch action to update Redux store
      dispatch(assetsData({ ...data, assets: updatedAssets }));
    },
  };

  const assetsCache = new DataSourceCache();

  const handleRowClick = useCallback((assetId) => {
    console.log(`Row click with id ${assetId}`);
  }, []);

  const handleCreateClick = useCallback(() => {
    console.log("Create click");
  }, []);

  const handleEditClick = useCallback((assetId) => {
    console.log(`Edit click with id ${assetId}`);
  }, []);

  const handleDelete = useCallback((assetId) => {
    console.log(`Asset with id ${assetId} deleted`);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  // Check if data and assets exist before rendering
  if (!data || !data.assets) {
    return <div>No data available</div>;
  }

  return (
    <div>
      <h1>Asset Master</h1>
      <List
        dataSource={assetsDataSource}
        dataSourceCache={assetsCache}
        initialPageSize={parseInt(queryParams.limit)}
        onRowClick={handleRowClick}
        onCreateClick={handleCreateClick}
        onEditClick={handleEditClick}
        onDelete={handleDelete}
      />
    </div>
  );
};

export default AssetMaster;