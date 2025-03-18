import { createContext, useEffect, useState } from "react";
import axios from "axios";

export const AssetContext = createContext();

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
export const AssetProvider = ({ children }) => {
  const [assets, setAssets] = useState([]);

  // Fetch assets from the database on mount
  useEffect(() => {
    fetchAssets();
  }, []);

  // Fetch all assets
  const fetchAssets = async () => {
    try {
      const { data } = await axios({
        method: "get",
        url: "/assets/",
        withCredentials: true,
      });
      setAssets(data);
    } catch (error) {
      console.error("Error fetching assets:", error);
    }
  };

  // Create a new asset
  const createAsset = async (newAsset) => {
    try {
      const { data } = await axios({
        method: "post",
        url: "/assets/",
        data: newAsset,
        withCredentials: true,
      });
      setAssets((prevAssets) => [...prevAssets, data]);
    } catch (error) {
      console.error("Error creating asset:", error);
    }
  };

  // Update an existing asset
  const updateAsset = async (assetId, updatedAsset) => {
    try {
      const { data } = await axios({
        method: "put",
        url: `/assets/${assetId}`,
        data: updatedAsset,
        withCredentials: true,
      });
      setAssets((prevAssets) =>
        prevAssets.map((asset) =>
          asset.asset_id === assetId ? { ...asset, ...data } : asset
        )
      );
    } catch (error) {
      console.error("Error updating asset:", error);
    }
  };

  // Delete an asset
  const deleteAsset = async (assetId) => {
    try {
      await axios({
        method: "delete",
        url: `/assets/${assetId}`,
        withCredentials: true,
      });
      setAssets((prevAssets) =>
        prevAssets.filter((asset) => asset.reference_number !== assetId)
      );
    } catch (error) {
      console.error("Error deleting asset:", error);
    }
  };

  return (
    <AssetContext.Provider
      value={{
        assets,
        fetchAssets,
        createAsset,
        updateAsset,
        deleteAsset,
      }}
    >
      {children}
    </AssetContext.Provider>
  );
};
export default AssetContext;