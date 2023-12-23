import axios from "axios";
const service = axios.create({
    timeout:0,
})
export default service;