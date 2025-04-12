import { useEffect, useState } from "react";
import { Box, Grid, Typography, CircularProgress } from "@mui/material";
import { api } from "../../utils/api";
import { useAuth } from "../../context/useAuth";
import { useNavigate } from "react-router-dom";

interface Project {
    id: number;
    name: string;
    description: string;
}

interface Props {
    onProjectClick?: (project: Project) => void; // new prop
}

export default function ViewAllProject({ onProjectClick }: Props) { // updated signature
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const auth_obj = useAuth();

    // Handle case where auth is still loading
    const user_id = auth_obj.user?.user_id;

    useEffect(() => {
        const fetchProjects = async () => {
            if (user_id === undefined) {
                // Authentication is still loading, so don't show an error yet
                return;
            }

            if (!user_id) {
                setError("User ID is missing. Please log in.");
                setLoading(false);
                return;
            }

            try {
                const response = await api.get(`/projects/all_projects?user_id=${user_id}`);
                setProjects(response.data.projects || []);
                console.log("Projects:", response.data.projects);
            } catch (err) {
                console.error("API Error:", err);
                setError("Failed to fetch projects. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [user_id]); // ✅ Runs only when user_id is available

    if (user_id === undefined) return <CircularProgress />; // 👈 Show loading state while auth is being fetched

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: "20px" }}>
            <Grid container spacing={3}>
                {projects.length > 0 ? (
                    projects.map((project) => (
                        <Grid item xs={12} sm={6} md={4} key={project.id}>
                            <Box
                                onClick={() => {
                                    if (onProjectClick) {
                                        onProjectClick(project);
                                    } else {
                                        navigate("/workspace");
                                        if (auth_obj.user) {
                                            auth_obj.user.project_id = project.id;
                                        }
                                    }
                                }}
                                sx={{
                                    cursor: "pointer",
                                    border: "1px solid rgba(96, 165, 250, 0.2)",
                                    borderRadius: "16px",
                                    padding: "24px",
                                    textAlign: "center",
                                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.2)",
                                    background: "linear-gradient(to bottom, #1E293B, #0F172A)",
                                    color: "white",
                                    transition: "transform 0.3s, box-shadow 0.3s",
                                    "&:hover": {
                                        transform: "scale(1.05)",
                                        boxShadow: "0 12px 32px rgba(0, 0, 0, 0.3)",
                                    },
                                }}
                            >
                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 2,
                                        fontWeight: 600,
                                        color: "#60A5FA",
                                        textShadow: "0 2px 4px rgba(0, 0, 0, 0.6)",
                                    }}
                                >
                                    {project.name}
                                </Typography>

                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: "rgba(255, 255, 255, 0.8)",
                                        lineHeight: 1.6,
                                        fontSize: "0.9rem",
                                    }}
                                >
                                    {project.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))
                ) : (
                    <Typography sx={{ml:5, mt:2}} variant="h6" >No projects found</Typography>
                )}
            </Grid>
        </Box>
    );
}
