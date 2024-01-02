import axios from "axios";
const service = axios.create({
    baseURL: "http://115.182.62.174:8088",
    timeout:0,
})

const urls = {
    llama2_chinese_7b_chat:"/llama2_chinese_7b_chat",
    chatglm2_6b:"/chatglm2_6b",
}

export const llama2_chinese_7b_chat = async (data) => {
    return await service(urls.llama2_chinese_7b_chat,{
        method:'post',
        data
    })
}

export const chatglm2_6b = async (data) => {
    return await service(urls.chatglm2_6b,{
        method:'post',
        data
    })
}