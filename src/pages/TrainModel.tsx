import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  CircularProgress,
  TextField,
  Chip,
  Grid
} from '@mui/material';
import { useAuth } from '../context/useAuth';
import { api } from '../utils/api';
import { useNotification } from '../context/NotificationContext';

interface TrainModelProps {
  numericalColumns: string[];
  categoricalColumns: string[];
}

const MODEL_METADATA = {
  classification: {
    name: "Classification",
    targetType: "categorical",
    models: [
      { id: "lr", name: "Logistic Regression" },
      { id: "rf", name: "Random Forest" },
      { id: "xgboost", name: "XGBoost" },
      { id: "lightgbm", name: "LightGBM" },
    ]
  },
  regression: {
    name: "Regression",
    targetType: "numerical",
    models: [
      { id: "rf", name: "Random Forest" },
      { id: "xgboost", name: "XGBoost" },
      { id: "lightgbm", name: "LightGBM" },
      { id: "lr", name: "Linear Regression" },
    ]
  },
  clustering: {
    name: "Clustering",
    models: [
      { id: "kmeans", name: "K-Means", requires: ["n_clusters"] },
    ]
  }
};

export default function TrainModel({ numericalColumns, categoricalColumns }: TrainModelProps) {
  const { user } = useAuth();
  const show = useNotification();

  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(true);
  const [results, setResults] = useState<any>(null);

  const [problemType, setProblemType] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [target, setTarget] = useState('');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [nClusters, setNClusters] = useState<number>(3);

  // Fetch existing results on mount or user change
  useEffect(() => {
    const fetchExisting = async () => {
      if (!user?.project_id || !user?.user_id) return;
      try {
        const resp = await api.get('/process/train', {
          params: { project_id: user.project_id, user_id: user.user_id, t: Date.now() }
        });
        if (resp.data.result) {
          const r = { ...resp.data.result };
          if (typeof r.metrics === 'string') {
            try { r.metrics = JSON.parse(r.metrics); } catch { r.metrics = []; }
          }
          setResults(r);
        } else {
          setResults(null);
        }
      } catch {
        show('Error fetching existing results', 'error');
        setResults(null);
      }
    };
    fetchExisting();
  }, [user?.project_id, user?.user_id,loading]);

  // Polling logic
  const pollTrainingStatus = async (taskId: string, taskType: string) => {
    try {
      let status = 'pending';
      let attempts = 0;
      const maxAttempts = 900;

      while (status === 'pending' && attempts < maxAttempts) {
        attempts++;
        const resp = await api.get('/process/train_status', {
          params: { train_id: taskId, task_type: taskType }
        });
        status = resp.data.status;

        if (status === 'completed') {
          // Directly use returned result or fetch fresh
          if (resp.data.result) {
            const r = { ...resp.data.result };
            if (typeof r.metrics === 'string') {
              try { r.metrics = JSON.parse(r.metrics); } catch { r.metrics = []; }
            }
            setResults(r);
          } else {
            // fallback to GET endpoint
            await new Promise(res => setTimeout(res, 500));
            await api.get('/process/train', {
              params: { project_id: user?.project_id, user_id: user?.user_id, t: Date.now() }
            }).then(r2 => {
              if (r2.data.result) setResults(r2.data.result);
            });
          }
          show('Training completed successfully', 'success');
          break;
        }
        if (status === 'failed') {
          setResults(null);
          show('Training failed', 'error');
          break;
        }

        await new Promise(res => setTimeout(res, 5000));
      }

      if (attempts >= maxAttempts) show('Training timed out', 'error');
    } catch {
      setResults(null);
      show('Error checking training status', 'error');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        type: problemType,
        model: selectedModel,
        target: problemType !== 'clustering' ? target : undefined,
        features: selectedFeatures,
        n_clusters: selectedModel === 'kmeans' ? nClusters : undefined,
        project_id: user?.project_id,
        user_id: user?.user_id
      };
      const resp = await api.post('/process/train', payload);
      if (resp.data.task_id) {
        await pollTrainingStatus(resp.data.task_id, problemType);
      } else if (resp.data.result) {
        const r = { ...resp.data.result };
        if (typeof r.metrics === 'string') {
          try { r.metrics = JSON.parse(r.metrics); } catch { r.metrics = []; }
        }
        setResults(r);
        show('Training completed successfully', 'success');
      }
    } catch {
      show('Training failed', 'error');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const getAvailableTargets = () => {
    if (problemType === 'classification') return categoricalColumns;
    if (problemType === 'regression') return numericalColumns;
    return [];
  };

  return (
    <Box sx={{ p: 3, mt: 1 }}>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="h5" gutterBottom>Train Model</Typography>
        <Button variant="contained" color="primary" onClick={() => setShowForm(s => !s)} sx={{ mb: 2 }}>
          {showForm ? 'Hide Training Form' : 'Show Training Form'}
        </Button>
        {showForm && (
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Problem Type */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Problem Type</InputLabel>
                  <Select
                    value={problemType}
                    label="Problem Type"
                    onChange={e => { setProblemType(e.target.value); setSelectedModel(''); setTarget(''); setSelectedFeatures([]); }}
                  >
                    {Object.entries(MODEL_METADATA).map(([key, val]) => (
                      <MenuItem key={key} value={key}>{val.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              {/* Model */}
              {problemType && <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Model</InputLabel>
                  <Select value={selectedModel} label="Model" onChange={e => setSelectedModel(e.target.value)}>
                    {MODEL_METADATA[problemType as keyof typeof MODEL_METADATA].models.map(m => (
                      <MenuItem key={m.id} value={m.id}>{m.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>}
              {/* Target */}
              {problemType !== 'clustering' && problemType && <Grid item xs={12} md={6}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Target Variable</InputLabel>
                  <Select value={target} label="Target Variable" onChange={e => setTarget(e.target.value)}>
                    {getAvailableTargets().map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>}
              {/* Features */}
              {problemType === 'clustering' && <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Features</InputLabel>
                  <Select
                    multiple
                    value={selectedFeatures}
                    label="Features"
                    onChange={e => { const v = e.target.value; setSelectedFeatures(typeof v === 'string' ? v.split(',') : v); }}
                    renderValue={sel => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {sel.map(val => <Chip key={val} label={val} />)}
                      </Box>
                    )}
                  >
                    {[...numericalColumns, ...categoricalColumns].map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>}
              {/* n_clusters */}
              {problemType === 'clustering' && selectedModel === 'kmeans' && <Grid item xs={12} md={6}>
                <TextField type="number" label="Number of Clusters" fullWidth value={nClusters}
                  onChange={e => setNClusters(parseInt(e.target.value, 10))}
                  InputProps={{ inputProps: { min: 2 } }} />
              </Grid>}
              {/* Submit */}
              <Grid item xs={12}>
                <Button type="submit" variant="contained" color="primary"
                  disabled={loading || !problemType || !selectedModel || 
                            (problemType !== 'clustering' && !target) ||
                            (problemType === 'clustering' && selectedFeatures.length === 0)}>
                  {loading ? <CircularProgress size={24} /> : 'Train Model'}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}
        {/* Results */}
        {results && <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>Training Results</Typography>
          <Typography variant="subtitle1">Model Performance Metrics</Typography>
          <Paper sx={{ p: 2, mb: 2 }}>
            {(Array.isArray(results.metrics) && results.metrics.length > 0) ? (
              results.metrics.map((m: any, i: number) => (
                <Typography key={i}>{Object.entries(m).map(([k,v]) => `${k}: ${v}`).join(', ')}</Typography>
              ))
            ) : (<Typography>No metrics available</Typography>)}
          </Paper>
          <Typography variant="subtitle1">Model Visualizations</Typography>
          <Grid container spacing={2}>
            {results.plots?.map((p: string, i: number) => (
              <Grid item xs={12} md={6} key={i}>
                <Paper sx={{ p: 1 }}>
                  <img src={`data:image/png;base64,${p}`} alt={`Plot ${i+1}`} style={{ width: '100%', height: 'auto' }} />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>}
      </Paper>
    </Box>
  );
}
