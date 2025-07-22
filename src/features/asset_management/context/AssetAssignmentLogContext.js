import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AssetAssignmentLogContext = createContext();

/**
 * The AssetProvider component is a context provider that provides
 * the following values to its children components:
 *
 *   - assets: an array of asset records
 *   - fetchAssets: a function that fetches assets from the server
 *   - createAsset: a function to create a new asset
 *   - updateAsset: a function to update an existing asset
 *   - deleteAsset: a function to delete an asset
 *
 * The component fetches assets from the server when mounted and
 * makes them available to its children components.
 *
 * @param {{ children: React.ReactNode }} props
 * @returns {React.ReactElement}
 */
export const AssetAssignmentLogProvider = ({ children }) => {
  const [assetAssignmentLogs, setAssetAssignmentLogs] = useState([]);

  // Fetch assets from the database on mount
  useEffect(() => {
    fetchAssetAssignmentLogs();
  }, []);

  // Fetch all assets
  const fetchAssetAssignmentLogs = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: `${process.env.REACT_APP_API_URL}/asset_assignment`,
        withCredentials: true,
      });
      setAssetAssignmentLogs(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Create a new asset
  const createAssetAssignment = async (newAssetLog) => {
    try {
      const { data } = await axios({
        method: "post",
        url: `${process.env.REACT_APP_API_URL}/asset_assignment`,
        data: newAssetLog,
        withCredentials: true,
      });
      setAssetAssignmentLogs((prevAssets) => [...prevAssets, data]);
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  // Update an existing asset
  const updateAssetAssignmentLog = async (logId, updatedAsset) => {
    try {
      const { data } = await axios({
        method: "put",
        url: `${process.env.REACT_APP_API_URL}/asset_assignment/${logId}`,
        data: updatedAsset,
        withCredentials: true,
      });
      setAssetAssignmentLogs((prevAssets) =>
        prevAssets.map((asset) =>
          asset.log_id === logId ? { ...asset, ...data } : asset
        )
      );
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  // Delete an asset
  const deleteAssetAssignment = async (logId) => {
    try {
      await axios({
        method: "delete",
        url: `${process.env.REACT_APP_API_URL}/asset_assignment/${logId}`,
        withCredentials: true,
      });
      setAssetAssignmentLogs((prevAssets) =>
        prevAssets.filter((asset) => asset.log_id !== logId)
      );
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <AssetAssignmentLogContext.Provider
      value={{
        assetAssignmentLogs,
        fetchAssetAssignmentLogs,
        createAssetAssignment,
        updateAssetAssignmentLog,
        deleteAssetAssignment,
      }}
    >
      {children}
    </AssetAssignmentLogContext.Provider>
  );
};
export default AssetAssignmentLogContext;
