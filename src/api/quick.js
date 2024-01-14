import axios from "axios";

const service = axios.create({
    baseURL: "/",
    timeout:0,
})

const urls = {
    quick:'/quick_60.json',
}

export const getQuick = async (typeList) => {
    console.log("type",typeList)
    let res = await service.get(urls.quick);
    let arr = [];
    for(let i = 0;i<60;i++){
        if(typeList.indexOf(res.data[i].type)!=-1) arr.push(res.data[i]);
    }
    res.data = arr;
    return res;
}
