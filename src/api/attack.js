import axios from "axios";
const service = axios.create({
    baseURL: "http://115.182.62.174:5000",
    timeout:0,
})
const urls = {
    attackPrompt:'/attack_prompt',
}

export const genAttackPrompt = async (data) => {
    return await service(urls.attackPrompt,{
        method:'post',
        data
    })
}
