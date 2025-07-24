import { useEffect, useState } from "react";
import useMeterId from "../contexts/meterId";

function useAssetData(queryParams) {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getCurrentUser();
        dispatch(currentUser(response.data));
        setLoading(false);
      } catch (error) {
        navigate("/login");
        setLoading(false);
      }
    };
    fetchData();
  }, []);
  return data;
}

export default useAssetData;
