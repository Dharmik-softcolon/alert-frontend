import React, { useState, useEffect } from "react";
import {
    Paper,
    Typography,
    IconButton,
    Stack,
    Box,
    TextField,
    Button,
    Select,
    MenuItem,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { fetchAlerts, deleteAlert, updateAlert } from "./api/alertApi";

const AlertList = ({ onEdit }) => {
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editAlert, setEditAlert] = useState(null);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const getAlerts = async () => {
            try {
                const data = await fetchAlerts();
                if (data.statusCode === 200) {
                    setAlerts(data.data);
                } else {
                    setError(data.message);
                }
            } catch (err) {
                console.error("Error fetching alerts:", err);
                setError("Failed to fetch alerts");
            } finally {
                setLoading(false);
            }
        };
        getAlerts();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this alert?")) return;
        try {
            const result = await deleteAlert(id);
            if (result.statusCode === 200) {
                setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert._id !== id));
            } else {
                alert(result.message || "Failed to delete alert.");
            }
        } catch (err) {
            console.error("Error deleting alert:", err);
            alert("Error deleting alert.");
        }
    };

    const handleEditClick = (alert) => {
        setEditAlert({
            ...alert,
            alert_for: alert.alert_for ?? 0,
            hit_side: alert.hit_side ?? "",
            comment: alert.comment ?? "",
            price: alert.price ?? "",
        });
    };

    const handleEditChange = (field, value) => {
        setEditAlert((prev) => ({ ...prev, [field]: value }));
    };

    const handleUpdate = async () => {
        setUpdating(true);
        try {
            const result = await updateAlert(editAlert._id, editAlert);
            if (result.statusCode === 200) {
                const data = await fetchAlerts();
                if (data.statusCode === 200) {
                    setAlerts(data.data);
                } else {
                    alert(data.message || "Failed to fetch updated alerts.");
                }
                setEditAlert(null);
            } else {
                alert(result.message || "Failed to update alert.");
            }
        } catch (err) {
            console.error("Error updating alert:", err);
            alert("Error updating alert.");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <Typography>Loading...</Typography>;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Stack spacing={2}>
            {alerts.map((alert) => (
                <Paper key={alert._id} elevation={2} sx={{ p: 2, borderRadius: 2 }}>
                    {editAlert && editAlert._id === alert._id ? (
                        <Stack spacing={2}>
                            <TextField
                                label="Script Name"
                                value={editAlert.script_name}
                                fullWidth
                                disabled
                            />

                            <Select
                                fullWidth
                                value={editAlert?.alert_for !== undefined ? editAlert.alert_for : "Swing"}
                                onChange={(e) => handleEditChange("alert_for", Number(e.target.value))}
                            >
                                <MenuItem value="" disabled>Select Alert Type</MenuItem>
                                <MenuItem value={0}>Intraday</MenuItem>
                                <MenuItem value={1}>Swing</MenuItem>
                                <MenuItem value={2}>Weekly</MenuItem>
                                <MenuItem value={3}>Longterm</MenuItem>
                                <MenuItem value={4}>Stock Option</MenuItem>
                            </Select>

                            <TextField
                                label="Comment"
                                value={editAlert.comment}
                                fullWidth
                                onChange={(e) => handleEditChange("comment", e.target.value)}
                            />

                            <Select
                                fullWidth
                                value={editAlert?.hit_side !== undefined ? editAlert.hit_side : "BUY"}
                                onChange={(e) => handleEditChange("hit_side", e.target.value)}
                            >
                                <MenuItem value="" disabled>Select Hit Side</MenuItem>
                                <MenuItem value="BUY">BUY</MenuItem>
                                <MenuItem value="SHORT">SHORT</MenuItem>
                            </Select>

                            <TextField
                                label="Price"
                                type="number"
                                value={editAlert.price}
                                fullWidth
                                onChange={(e) => handleEditChange("price", e.target.value)}
                            />

                            <Box display="flex" justifyContent="flex-end" gap={2}>
                                <Button onClick={() => setEditAlert(null)} variant="outlined" color="secondary">
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleUpdate}
                                    variant="contained"
                                    color="primary"
                                    disabled={updating}
                                >
                                    {updating ? "Updating..." : "Update"}
                                </Button>
                            </Box>
                        </Stack>
                    ) : (
                        <Stack spacing={1}>
                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="subtitle1" fontWeight="bold">
                                    {alert.script_name}
                                </Typography>
                                <Typography variant="caption" color="primary">
                                    {["Intraday", "Swing", "Weekly", "Longterm", "Stock Option"][alert.alert_for ?? 0]}
                                </Typography>
                                <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    sx={{
                                        color: alert.hit_side === "BUY" ? "green" : "red",
                                        textTransform: "uppercase"
                                    }}
                                >
                                    {alert.hit_side}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography variant="body2" color="text.secondary">
                                    {alert.alert_for}
                                </Typography>
                                <Typography variant="body2" fontWeight="500">
                                    {alert.price}
                                </Typography>
                            </Box>

                            <Box display="flex" justifyContent="space-between" alignItems="center">
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ fontStyle: "italic" }}
                                >
                                    {alert.comment || "No comment"}
                                </Typography>
                                <Box>
                                    <IconButton onClick={() => handleEditClick(alert)} size="small">
                                        <EditIcon fontSize="small" />
                                    </IconButton>
                                    <IconButton onClick={() => handleDelete(alert._id)} size="small">
                                        <DeleteIcon fontSize="small" />
                                    </IconButton>
                                </Box>
                            </Box>
                        </Stack>
                    )}
                </Paper>
            ))}
        </Stack>
    );
};

export default AlertList;
