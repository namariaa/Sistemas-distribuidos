import axios from "axios";

const axiosInstance = axios.create({
	baseURL: "10.25.2.165",
});

export default axiosInstance;