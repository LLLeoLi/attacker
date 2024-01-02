import service from "../http/request";
const urls = {
    eva:'/eva',
}
export const getEva = async (data) => {
    return await service(urls.eva,{
        method:'post',
        data
    })
}