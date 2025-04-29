import { useState } from "react";
import {
    Box,
    Button,
    Container,
    MenuItem,
    Select,
    Tab,
    Tabs,
    TextField,
    Typography,
    Paper,
    IconButton,
    Stack,
    Alert,
} from "@mui/material";
import { Add, Remove } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import { createAlert } from "./api/alertApi";
import AlertList from "./AlertList";
import {stockOptions} from "./api/stockData";


const theme = createTheme({
    typography: {
        fontFamily: "'Roboto Condensed', sans-serif",
        fontWeightRegular: 400,
        fontWeightBold: 700,
    },
});

export default function App() {
    const [alerts, setAlerts] = useState([]);
    const [stockName, setStockName] = useState("");
    const [price, setPrice] = useState(0);
    const [direction, setDirection] = useState("LOWER");
    const [comment, setComment] = useState("");  // Added comment state
    const [tab, setTab] = useState(0);
    const [editIndex, setEditIndex] = useState(null);
    const [alertFor, setAlertFor] = useState(0);
    const [responseMessage, setResponseMessage] = useState(""); // To store backend response
    const [isError, setIsError] = useState(false); // To store if the message is an error
    const [isAlertVisible, setIsAlertVisible] = useState(false); // Control visibility of the alert

    // const stockOptions = [
    //     "NIFTY",
    //     "BANKNIFTY",
    //     "FINNIFTY",
    //     "SENSEX",
    //     "LICHSGFIN",
    //     "DABUR",
    // ];

    const handleCreateOrUpdateAlert = async () => {
        if (!stockName || !price) return;

        const newAlert = { stockName, price, direction, comment, alertFor };

        if (editIndex !== null) {
            // If editing, update locally (no API call for update in this case)
            const updated = [...alerts];
            updated[editIndex] = newAlert;
            setAlerts(updated);
            setEditIndex(null);
            setResponseMessage("Alert updated successfully!");
            setIsError(false);
            setIsAlertVisible(true); // Show the alert
        } else {
            try {
                const createdAlert = await createAlert(newAlert); // Call create API
                setAlerts([...alerts, createdAlert]); // Add the created alert to UI
                setResponseMessage("Alert created successfully!");
                setIsError(false); // Success
                setIsAlertVisible(true); // Show the alert
            } catch (error) {
                console.error("Failed to create alert:", error.message);
                setResponseMessage("Failed to create alert: " + error.message);
                setIsError(true); // Error
                setIsAlertVisible(true); // Show the alert
            }
        }

        setStockName("");
        setPrice(0);
        setDirection("above");
        setComment(""); // Clear comment after submission

        // Hide the alert after 2 seconds
        setTimeout(() => {
            setIsAlertVisible(false);
        }, 2000);
    };

    const handleDelete = (index) => {
        setAlerts(alerts.filter((_, i) => i !== index));
    };

    const handleEdit = (index) => {
        const alert = alerts[index];
        setStockName(alert.stockName);
        setPrice(alert.price);
        setDirection(alert.direction);
        setComment(alert.comment); // Set comment when editing
        setEditIndex(index);
        setTab(0); // Switch to form tab when editing
        setAlertFor(alert.alertFor ?? 0);
    };

    const handleIncrement = () => setPrice((prev) => Number(prev) + 1);
    const handleDecrement = () => setPrice((prev) => Math.max(0, Number(prev) - 1));

    return (
        <ThemeProvider theme={theme}>
            <Container maxWidth="sm" sx={{ p: { xs: 2, md: 4 } }}>
                <Typography variant="h5" textAlign="center" fontWeight="bold" gutterBottom>
                    Stock Alerts
                </Typography>

                {/* Response Message Display */}
                {isAlertVisible && (
                    <Box
                        sx={{
                            position: "absolute",
                            top: 0,
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: "100%",
                            zIndex: 9999,
                            display: "flex",
                            justifyContent: "center",
                            padding: "10px",
                        }}
                    >
                        <Alert severity={isError ? "error" : "success"} sx={{ width: "auto" }}>
                            {responseMessage}
                        </Alert>
                    </Box>
                )}

                <Tabs value={tab} onChange={(e, newVal) => setTab(newVal)} centered sx={{ mb: 3 }}>
                    <Tab label="Place Alert" />
                    <Tab label="Alert List" />
                </Tabs>

                {tab === 0 ? (
                    <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, mb: 4, borderRadius: 2 }}>
                        <Stack spacing={2}>
                            <Select fullWidth value={stockName} displayEmpty onChange={(e) => setStockName(e.target.value)}>
                                <MenuItem value="">Select stock name</MenuItem>
                                {stockOptions.map((option) => (
                                    <MenuItem key={option} value={option}>
                                        {option}
                                    </MenuItem>
                                ))}
                            </Select>

                            <TextField label="Comment" fullWidth value={comment} onChange={(e) => setComment(e.target.value)} /> {/* Comment field */}

                            <Select fullWidth value={alertFor} onChange={(e) => setAlertFor(Number(e.target.value))}>
                                <MenuItem value={0}>Intraday</MenuItem>
                                <MenuItem value={1}>Swing</MenuItem>
                                <MenuItem value={2}>Weekly</MenuItem>
                                <MenuItem value={3}>Longterm</MenuItem>
                                <MenuItem value={4}>Stock Option</MenuItem>
                            </Select>

                            <Stack direction="row" spacing={1} alignItems="center">
                                <Select value={direction} onChange={(e) => setDirection(e.target.value)} size="small" sx={{ minWidth: 100, height: 48, fontWeight: 500 }}>
                                    <MenuItem value="UPPER">Above</MenuItem>
                                    <MenuItem value="LOWER">Below</MenuItem>
                                </Select>

                                <Box display="flex" alignItems="center" border="1px solid #ccc" borderRadius="8px" overflow="hidden" flexGrow={1} height={48}>
                                    <IconButton onClick={handleDecrement} size="small"><Remove /></IconButton>
                                    <TextField
                                        type="number"
                                        value={price}
                                        onChange={(e) => setPrice(e.target.value)}
                                        variant="standard"
                                        InputProps={{ disableUnderline: true }}
                                        inputProps={{
                                            style: { textAlign: "center", fontSize: "16px" },
                                        }}
                                        sx={{
                                            width: "100%",
                                            "& input": { paddingY: "12px" },
                                        }}
                                    />
                                    <IconButton onClick={handleIncrement} size="small"><Add /></IconButton>
                                </Box>
                            </Stack>

                            <Button
                                variant="contained"
                                size="large"
                                fullWidth
                                onClick={handleCreateOrUpdateAlert}
                                sx={{ fontWeight: "bold", fontSize: "16px" }}
                            >
                                {editIndex !== null ? "Update Alert" : "Create Alert"}
                            </Button>
                        </Stack>
                    </Paper>
                ) : (
                    <AlertList alerts={alerts} onEdit={handleEdit} onDelete={handleDelete} />
                )}

                {/* Footer */}
                <Box display="flex" justifyContent="center" mt={5} mb={2}>
                    <Typography variant="caption" textAlign="center" color="text.secondary" sx={{ fontSize: "12px" }}>
                        © All rights reserved by <b>Dharmik Ghevariya</b>
                    </Typography>
                </Box>
            </Container>
        </ThemeProvider>
    );
}
