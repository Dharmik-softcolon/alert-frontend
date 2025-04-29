// api/alertApi.js
import axios from "axios";
// import {baseUrl} from "../config/config";

export const fetchAlerts = async () => {
    const response = await axios.get(`https://alert-backend-i0wx.onrender.com/stocks/alert/get-all`);
    return response.data;
};

export const deleteAlert = async (id) => {
    const response = await axios.delete(`https://alert-backend-i0wx.onrender.com/stocks/alert/delete/${id}`);
    return response.data;
};

export const updateAlert = async (id, updatedData) => {
        const response = await axios.put(`https://alert-backend-i0wx.onrender.com/stocks/alert/update/${id}`, updatedData);
        return response.data;
};

export const createAlert = async (alertData) => {
    console.log(alertData)
    try {
        const response = await axios.post(`https://alert-backend-i0wx.onrender.com/stocks/alert/create`, alertData, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        return response.data;
    } catch (error) {
        console.error("Error in createAlert:", error.response?.data?.message || error.message);
        throw new Error(error.response?.data?.message || "Failed to create alert");
    }
};


