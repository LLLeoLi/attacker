import axios from "axios";
const service = axios.create({
    baseURL: "http://115.182.62.174:8080",
    timeout:0,
})
export default service;