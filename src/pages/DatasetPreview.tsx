import { Typography, Box, CircularProgress, Paper, Button } from "@mui/material";
import { useAuth } from "../context/useAuth";
import { api } from "../utils/api";
import { useNotification } from "../context/NotificationContext";
import { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ModuleRegistry } from "ag-grid-community";
import { ClientSideRowModelModule } from "ag-grid-community"; // ✅ not @ag-grid-community

ModuleRegistry.registerModules([ClientSideRowModelModule]);

interface DatasetPreviewProps {
  setColumns: React.Dispatch<React.SetStateAction<string[]>>;
  //setFileUrl: React.Dispatch<React.SetStateAction<string>>;
  //setDatasetName: React.Dispatch<React.SetStateAction<string>>;
  setNumericalColumns: React.Dispatch<React.SetStateAction<string[]>>;
  setCategoricalColumns: React.Dispatch<React.SetStateAction<string[]>>;
}

export default function DatasetPreview({ setColumns, setNumericalColumns,setCategoricalColumns }: DatasetPreviewProps) {
  const { user } = useAuth();
  const show = useNotification();
  const [rowData, setRowData] = useState<any[]>([]);
  const [columnDefs, setColumnDefs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [hidedataset, setHidedataset] = useState(false);

  const defaultColDef = useMemo(() => ({
    sortable: true,
    filter: true,
    resizable: true,
    minWidth: 100,
    flex: 1,
  }), []);

  // Retrieve project_id from local storage or user context
  const project_id = useMemo(() => {
    const storedProjectId = localStorage.getItem("project_id");
    if (user?.project_id) {
      localStorage.setItem("project_id", String(user.project_id)); // Save to local storage
      return user.project_id;
    }
    return storedProjectId || null;
  }, [user?.project_id]);

  useEffect(() => {
    const fetchDataset = async () => {
      try {
        setLoading(true);

        if (!user?.user_id || !project_id) {
          show("User or project info missing", "error");
          return;
        }

        const res = await api.get(`/process/get_dataset?user_id=${user.user_id}&project_id=${project_id}`);
        const dataset = res.data?.dataset;
        const columns = res.data?.columns;
        setColumns(columns); // Set the columns in the parent component
        setNumericalColumns(res.data?.numerical); // Set the numerical columns in the parent component
        setCategoricalColumns(res.data?.categorical); // Set the categorical columns in the parent component
        console.log("Dataset:", dataset);
        if (Array.isArray(dataset) && dataset.length > 0) {
          //setFileUrl(res.data?.file_url);
          //setDatasetName(res.data?.dataset_name); // Set the dataset name in the parent component
          const firstRow = dataset[0];
          const generatedCols = Object.keys(firstRow).map(key => ({
            field: key,
            headerName: key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          }));

          setColumnDefs(generatedCols);
          setRowData(dataset);
          show("Dataset loaded successfully", "success");
        } else {
          show("Dataset is empty", "warning");
        }
      } catch (err) {
        console.error(err);
        show("Failed to fetch dataset", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchDataset();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.user_id, project_id]);

  return (
    <Box sx={{ p: 3, mt: 8,mb: -2 }}>
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <Typography variant="h5" gutterBottom>
          Dataset Preview
        </Typography>

        <Button variant="contained" color="primary" onClick={() => setHidedataset(!hidedataset)} sx={{ mb: 2 }}>
          {hidedataset ? "Show Dataset" : "Hide Dataset"}
        </Button>

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : rowData.length > 0 ? (
          <div className="ag-theme-material" style={{ height: 600, width: "100%", display: hidedataset ? "none" : "block" }}>
            <AgGridReact
              rowData={rowData}
              columnDefs={columnDefs}
              defaultColDef={defaultColDef}
              animateRows
              pagination
              paginationPageSize={10}
              rowModelType="clientSide"
            />
          </div>
        ) : (
          <Typography sx={{ p: 2 }} color="text.secondary">
            No data to display.
          </Typography>
        )}
      </Paper>
    </Box>
  );
}
