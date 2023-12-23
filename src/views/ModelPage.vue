<template>
    <div class="model">
        <div class="model-list">
            <div class="title">
                <Model class="icon"></Model>
                <span>模型列表</span>
            </div>
            <div class="content">
                <div class="row" v-for="(model, index) in modelList" :key="model.name">
                    <div class="model-name">
                        {{ model.name }}
                        <template v-if="!model.selected">
                            <el-button type="success" :icon="Plus" @click="selectModel(model,index)" circle></el-button>
                        </template>
                        <template v-else>
                            <el-button type="danger" :icon="Minus" @click="selectModel(model,index)" circle></el-button>
                        </template>
                    </div>
                </div>
            </div>
            <div class="run">
                <el-button type="warning" :icon="Delete" :disabled="selectedModelList.length==0" @click="deleteAll">全部清除</el-button>
                <el-button color="#626aef" :icon="Attack" :disabled="selectedModelList.length==0" @click="attack">攻击模型 ({{ selectedModelList.length }}/20)</el-button>
            </div>
        </div>
        <div class="model-res">
            <div class="title">
                <Result class="icon"></Result>
                <span>运行结果</span>
            </div>
            <div class="content">
                <template v-if="output.length">
                <div v-for="out in output" :key="out.name">
                    <div>
                        {{ out.name }}
                    </div>
                    <div>
                        {{ out.value }}
                    </div>
                </div>
                </template>
                <el-empty v-else description="暂无内容" />
            </div>
            <div class="next">
                <el-button type="primary" :icon="CaretRight" >结果分析</el-button>
            </div>
        </div>
        <div class="model-analyse">
            <div class="title">
                <Analyse class="icon"></Analyse>
                <span>数据分析</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { CaretRight, Plus, Minus, Delete } from '@element-plus/icons-vue';
import Model from "../components/icons/Model";
import Result from "../components/icons/Result";
import Attack from "../components/icons/Attack";
import Analyse from '../components/icons/Analyse';
import { onMounted } from 'vue';
import axios from 'axios';
const models = [
    {
        name:"Qwen-14B-Chat",
        description:"Qwen-14B-Chat"
    },
    {
        name:"Qwen-14B-Base",
        description:"Qwen-14B-Base"
    },
    {
        name:"InternLM-20B",
        description:"InternLM-20B"
    },
    {
        name:"InternLM-Chat-7B",
        description:"InternLM-Chat-7B"
    },
    {
        name:"Baichuan2-13B-Chat",
        description:"Baichuan2-13B-Chat"
    },
    {
        name:"Yulan-Chat-2-13B",
        description:"Yulan-Chat-2-13B"
    },
    {
        name:"Baichuan-13B-Chat",
        description:"Baichuan-13B-Chat"
    },
    {
        name:"ChatGLM3-6B",
        description:"ChatGLM3-6B"
    },
    {
        name:"Qwen-7B-Base",
        description:"Qwen-7B-Base"
    },
    {
        name:"BELLE-LLaMA-2-Chat",
        description:"BELLE-LLaMA-2-Chat"
    },
    {
        name:"Baichuan2-7B-Chat",
        description:"Baichuan2-7B-Chat"
    },
    {
        name:"ChatGLM2-6B",
        description:"ChatGLM2-6B"
    },
    {
        name:"Qwen-14B-Chat",
        description:"Qwen-14B-Chat"
    },
    {
        name:"LLaMa-2-13B-Chinese-Chat",
        description:"LLaMa-2-13B-Chinese-Chat"
    },
    {
        name:"Chinese-Alpaca-2-7B-Chat",
        description:"Chinese-Alpaca-2-7B-Chat"
    },
    {
        name:"Chinese-LLaMA-2-7B-Chat",
        description:"Chinese-LLaMA-2-7B-Chat"
    },
    {
        name:"Baichuan-13B-Base",
        description:"Baichuan-13B-Base"
    },
    {
        name:"Baichuan2-13B-Base",
        description:"Baichuan2-13B-Base"
    },
    {
        name:"XVERSE-13B",
        description:"XVERSE-13B"
    },
    {
        name:"InternLM-7B",
        description:"InternLM-7B"
    }
];
const modelList = ref([
    {
        name:"Qwen-14B-Chat",
        description:"Qwen-14B-Chat"
    },
    {
        name:"Qwen-14B-Base",
        description:"Qwen-14B-Base"
    },
    {
        name:"InternLM-20B",
        description:"InternLM-20B"
    },
    {
        name:"InternLM-Chat-7B",
        description:"InternLM-Chat-7B"
    },
    {
        name:"Baichuan2-13B-Chat",
        description:"Baichuan2-13B-Chat"
    },
    {
        name:"Yulan-Chat-2-13B",
        description:"Yulan-Chat-2-13B"
    },
    {
        name:"Baichuan-13B-Chat",
        description:"Baichuan-13B-Chat"
    },
    {
        name:"ChatGLM3-6B",
        description:"ChatGLM3-6B"
    },
    {
        name:"Qwen-7B-Base",
        description:"Qwen-7B-Base"
    },
    {
        name:"BELLE-LLaMA-2-Chat",
        description:"BELLE-LLaMA-2-Chat"
    },
    {
        name:"Baichuan2-7B-Chat",
        description:"Baichuan2-7B-Chat"
    },
    {
        name:"ChatGLM2-6B",
        description:"ChatGLM2-6B"
    },
    {
        name:"Qwen-14B-Chat",
        description:"Qwen-14B-Chat"
    },
    {
        name:"LLaMa-2-13B-Chinese-Chat",
        description:"LLaMa-2-13B-Chinese-Chat"
    },
    {
        name:"Chinese-Alpaca-2-7B-Chat",
        description:"Chinese-Alpaca-2-7B-Chat"
    },
    {
        name:"Chinese-LLaMA-2-7B-Chat",
        description:"Chinese-LLaMA-2-7B-Chat"
    },
    {
        name:"Baichuan-13B-Base",
        description:"Baichuan-13B-Base"
    },
    {
        name:"Baichuan2-13B-Base",
        description:"Baichuan2-13B-Base"
    },
    {
        name:"XVERSE-13B",
        description:"XVERSE-13B"
    },
    {
        name:"InternLM-7B",
        description:"InternLM-7B"
    }
]);
const selectedModelList = ref([]);
// 选择攻击模型
const selectModel = (model,index) => {
    model.selected = !model.selected;
    if(model.selected){
        model.index = index;
        selectedModelList.value.push(model);
    }else{
        selectedModelList.value.splice(selectedModelList.value.indexOf(model),1);
    }
}
// 全部清除
const deleteAll = ()=>{
    modelList.value.forEach(model=>{
        model.selected = false;
    })
    selectedModelList.value.length = 0;
}
const getToken = ()=>{
    return "24.d67162c0bee374c3575f6cf1b1049653.2592000.1705859414.282335-45184890";
}
const output = ref([]);
const attack = ()=>{
    output.value.length = 0;
    selectedModelList.value.forEach(model=>{
        attackApi(model);
    })
    console.log(output.value);
}
const attackApi = async (model)=>{
    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/chatglm2_6b_32k?access_token=${getToken()}`;
    const data = {
        "top_p": 0.5,
        "temperature": 0.9,
        "messages": [
            {"role": "user", "content": "你好，我想问一下，我想买一件衣服，但是我不知道怎么买，你能帮我吗？"},
        ],
        "stream":true,
    };
    const res = await fetch(url,{
        method:"POST",
        headers:{
            "Content-Type":"application/json",
        },
        body: JSON.stringify(data)
    });
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let obj = {};
    obj.name = model.name;
    obj.index = model.index;
    obj.value = "";
    while(true){
        let res = await reader.read();
        if(res.done) break;
        console.log(obj.name,res.value.replace("data: ",""));
        let value = {
            result:""
        }
        try{
            value = JSON.parse(res.value.replace("data: ",""));
        }catch{
            value.result = "";
        }
        obj.value +=value.result;
    }
    output.value.push(obj);
    output.value.sort((a,b)=>a.index<b.index);
}
</script>

<style lang="scss" scoped>
.model{
    display: flex;
    justify-content: space-around;
    height: calc(90vh - 64px);
    &-list{
        width: 35%;
        border-radius: .3rem;
        background-color: #f3f5fb;
        .content{
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 80%;
            overflow-y: auto;
            .model-name{
                font-family: Inter, "Helvetica Neue", Helvetica, "PingFang SC";
                font-size: 20px;
                font-weight: 400;
                border-left: 6px solid #8b8b8b;
                line-height: 30px;
                margin: 3px;
                padding: 1px;
                display: flex;
                justify-content: space-between;
            }
            .row {
                width: 100%;
                margin-bottom: 10px;
            }
        }
        .run{
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .title{
        height: 10%;
        margin: 0 auto;
        align-items: center;
        font-family: Inter, "Helvetica Neue", Helvetica, "PingFang SC";
        font-size: 30px;
        font-weight: 600;
        line-height: 200px;
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #dcdfe6;
        .icon{
            height: 185px;
        }
    }
    &-list:hover{
        border: 1px solid #dcdfe6;
    }
    &-res{
        width:35%;
        border-radius: .3rem;
        background-color: #f3f5fb;
        .content{
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 80%;
            overflow-y: auto;
        }
        .next{
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    &-res:hover{
        border: 1px solid #dcdfe6;
    }
}
</style>