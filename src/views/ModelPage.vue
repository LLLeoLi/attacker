<template>
    <div class="model">
        <div class="model-list">
            <div class="title">
                <Model class="icon"></Model>
                <span>模型列表</span>
            </div>
            <div class="switch">
                <el-radio-group v-model="attackType" size="large" fill="#626aef" @change="clearSearchInput">
                    <el-radio-button color="#626aef" label="类型攻击" />
                    <el-radio-button color="#626aef" label="自由攻击" />
                </el-radio-group>
            </div>
            <div class="search">
                <template v-if="attackType=='自由攻击'">
                    <el-input v-model="searchInput" :prefix-icon="Attack"  placeholder="请输入prompt"/>
                </template>
                <template v-else>
                    <el-select v-model="attackScenario" placeholder="Select" @change="changeSearchInput">
                        <el-option
                        v-for="item in scenarioList"
                        :key="item"
                        :label="item"
                        :value="item"
                        >
                            <span style = "
                            color: var(--el-text-color-secondary);
                            ">
                                {{ item }}
                            </span>
                        </el-option>
                    </el-select>
                    <el-input v-model="searchInput" placeholder="请输入prompt" disabled>
                    </el-input>
                </template>
            </div>
            <div class="content">
                <div class="row" v-for="(model, index) in modelList" :key="model.name">
                    <div class="model-name">
                        {{ model.name }}
                        <template v-if="!model.selected">
                            <el-button color="#626aef" :icon="Plus" @click="selectModel(model, index)" circle></el-button>
                        </template>
                        <template v-else>
                            <el-button type="danger" :icon="Minus" @click="selectModel(model, index)" circle></el-button>
                        </template>
                    </div>
                </div>
            </div>
            <div class="run">
                <el-button type="warning" :icon="Delete" :disabled="selectedModelList.length == 0"
                    @click="deleteAll">清除模型</el-button>
                <el-button color="#626aef" :icon="Attack" :disabled="selectedModelList.length == 0 || searchInput.length == 0"
                    @click="attack">攻击模型 ({{ selectedModelList.length }}/20)</el-button>
            </div>
        </div>
        <div class="model-res">
            <div class="title">
                <Result class="icon"></Result>
                <span>运行结果</span>
            </div>
            <div class="content">
                <template v-if="output.length">
                    <div class="output" v-for="out in output" :key="out.name">
                        <div class="output-model">
                            <div class="output-name">{{ out.name }}
                                <!-- <el-button class="output-copy" type="text" plain :icon="DocumentCopy" @click="toCopy(out.value)"></el-button> -->
                            </div>
                        </div>
                        <div class="output-text">
                            {{ out.value }}
                        </div>
                    </div>
                </template>
                <el-empty v-else description="暂无内容" />
            </div>
            <div class="next">
                <el-button type="primary" :icon="Analyse" @click="cirticAnalyze" :disabled="output.length==0">安全性检测</el-button>
            </div>
        </div>
        <div class="model-analyse">
            <div class="title">
                <Analyse class="icon"></Analyse>
                <span>安全性检测</span>
            </div>
            <template v-if="showCritic">
                <div class="rate" id="rate" ref="rate"></div>
                <div class="content">
                    <div class="analysis" v-for="out in criticOutput" :key="out.name">
                        <div class="analysis-model">
                            <div class="output-name">{{ out.name }}</div>
                        </div>
                        <div class="analysis-text">
                            {{ out.analysis }}
                        </div>
                    </div>
                </div>
            </template>
            <el-empty v-else description="暂无内容" />
        </div>
    </div>
</template>

<script setup>
import { Plus, Minus, Delete, DocumentCopy, Search, Switch } from '@element-plus/icons-vue';
import Model from "../components/icons/Model";
import Result from "../components/icons/Result";
import Attack from "../components/icons/Attack";
import Analyse from '../components/icons/Analyse';
import { ElLoading, ElMessage } from 'element-plus';
import { TransitionPresets, useTransition, useClipboard } from '@vueuse/core';
import { getEva } from "../api/models"
import * as echarts from 'echarts';
import { onMounted } from 'vue';
const models = [
    {
        name: "Qwen-14B-Chat",
        description: "Qwen-14B-Chat"
    },
    {
        name: "Qwen-14B-Base",
        description: "Qwen-14B-Base"
    },
    {
        name: "InternLM-20B",
        description: "InternLM-20B"
    },
    {
        name: "InternLM-Chat-7B",
        description: "InternLM-Chat-7B"
    },
    {
        name: "Baichuan2-13B-Chat",
        description: "Baichuan2-13B-Chat"
    },
    {
        name: "Yulan-Chat-2-13B",
        description: "Yulan-Chat-2-13B"
    },
    {
        name: "Baichuan-13B-Chat",
        description: "Baichuan-13B-Chat"
    },
    {
        name: "ChatGLM3-6B",
        description: "ChatGLM3-6B"
    },
    {
        name: "Qwen-7B-Base",
        description: "Qwen-7B-Base"
    },
    {
        name: "BELLE-LLaMA-2-Chat",
        description: "BELLE-LLaMA-2-Chat"
    },
    {
        name: "Baichuan2-7B-Chat",
        description: "Baichuan2-7B-Chat"
    },
    {
        name: "ChatGLM2-6B",
        description: "ChatGLM2-6B"
    },
    {
        name: "Qwen-14B-Chat",
        description: "Qwen-14B-Chat"
    },
    {
        name: "LLaMa-2-13B-Chinese-Chat",
        description: "LLaMa-2-13B-Chinese-Chat"
    },
    {
        name: "Chinese-Alpaca-2-7B-Chat",
        description: "Chinese-Alpaca-2-7B-Chat"
    },
    {
        name: "Chinese-LLaMA-2-7B-Chat",
        description: "Chinese-LLaMA-2-7B-Chat"
    },
    {
        name: "Baichuan-13B-Base",
        description: "Baichuan-13B-Base"
    },
    {
        name: "Baichuan2-13B-Base",
        description: "Baichuan2-13B-Base"
    },
    {
        name: "XVERSE-13B",
        description: "XVERSE-13B"
    },
    {
        name: "InternLM-7B",
        description: "InternLM-7B"
    }
];
const modelList = ref([
    {
        name: "Qwen-14B-Chat",
        description: "Qwen-14B-Chat"
    },
    {
        name: "Qwen-14B-Base",
        description: "Qwen-14B-Base"
    },
    {
        name: "InternLM-20B",
        description: "InternLM-20B"
    },
    {
        name: "InternLM-Chat-7B",
        description: "InternLM-Chat-7B"
    },
    {
        name: "Baichuan2-13B-Chat",
        description: "Baichuan2-13B-Chat"
    },
    {
        name: "Yulan-Chat-2-13B",
        description: "Yulan-Chat-2-13B"
    },
    {
        name: "Baichuan-13B-Chat",
        description: "Baichuan-13B-Chat"
    },
    {
        name: "ChatGLM3-6B",
        description: "ChatGLM3-6B"
    },
    {
        name: "Qwen-7B-Base",
        description: "Qwen-7B-Base"
    },
    {
        name: "BELLE-LLaMA-2-Chat",
        description: "BELLE-LLaMA-2-Chat"
    },
    {
        name: "Baichuan2-7B-Chat",
        description: "Baichuan2-7B-Chat"
    },
    {
        name: "ChatGLM2-6B",
        description: "ChatGLM2-6B"
    },
    {
        name: "Qwen-14B-Chat",
        description: "Qwen-14B-Chat"
    },
    {
        name: "LLaMa-2-13B-Chinese-Chat",
        description: "LLaMa-2-13B-Chinese-Chat"
    },
    {
        name: "Chinese-Alpaca-2-7B-Chat",
        description: "Chinese-Alpaca-2-7B-Chat"
    },
    {
        name: "Chinese-LLaMA-2-7B-Chat",
        description: "Chinese-LLaMA-2-7B-Chat"
    },
    {
        name: "Baichuan-13B-Base",
        description: "Baichuan-13B-Base"
    },
    {
        name: "Baichuan2-13B-Base",
        description: "Baichuan2-13B-Base"
    },
    {
        name: "XVERSE-13B",
        description: "XVERSE-13B"
    },
    {
        name: "InternLM-7B",
        description: "InternLM-7B"
    }
]);
const attackType = ref("类型攻击");
const attackScenario = ref("");
const scenarioList = ref([
    'Reverse_Exposure',
    'Goal_Hijacking',
    'Prompt_Leaking',
    'Unsafe_Instruction_Topic',
    'Role_Play_Instruction',
    'Inquiry_With_Unsafe_Opinion',
])
const searchInput = ref("");
const clearSearchInput = (value)=>{
    if(value=='自由攻击') searchInput.value = "";
    else changeSearchInput(attackScenario.value);
}
const changeSearchInput = (value)=>{
    console.log("change",value);
    // TODO:更换为筛选结果
    searchInput.value = value;
}
const selectedModelList = ref([]);
// 选择攻击模型
const selectModel = (model, index) => {
    model.selected = !model.selected;
    if (model.selected) {
        model.index = index;
        selectedModelList.value.push(model);
    } else {
        selectedModelList.value.splice(selectedModelList.value.indexOf(model), 1);
    }
}
// 全部清除
const deleteAll = () => {
    modelList.value.forEach(model => {
        model.selected = false;
    })
    selectedModelList.value.length = 0;
}

// 获取内容
const getToken = () => {
    return "24.d67162c0bee374c3575f6cf1b1049653.2592000.1705859414.282335-45184890";
}
const output = ref([]);
const attack = () => {
    if (!searchInput.value) {
        ElMessage({
            message: '请输入prompt',
            type: 'warning',
        });
        return;
    }
    if (selectedModelList.value.length == 0) {
        ElMessage({
            message: '请选择模型',
            type: 'warning',
        });
        return;
    }
    output.value.length = 0;
    selectedModelList.value.forEach(model => {
        attackApi(model);
    })
    console.log("output",output.value);
}
const attackApi = async (model) => {
    const url = `https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/chat/chatglm2_6b_32k?access_token=${getToken()}`;
    const data = {
        "top_p": 0.5,
        "temperature": 0.9,
        "messages": [
            { "role": "user", "content": searchInput.value },
        ],
        "stream": true,
    };
    let obj = {};
    obj.name = model.name;
    obj.index = model.index;
    obj.value = "";
    let res = {};
    try {
        res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data)
        });
    } catch {
        output.value.push(obj);
        output.value.sort((a, b) => a.index < b.index);
        return;
    }
    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    while (true) {
        res = await reader.read();
        // console.log("res", res);
        if (res.done) break;
        // console.log(obj.name,res.value.replace("data: ",""));
        let value = {
            result: ""
        }
        try {
            value = JSON.parse(res.value.replace("data: ", ""));
        } catch {
            value.result = "";
        }
        obj.value += value.result;
    }
    output.value.push(obj);
    console.log(output.value);
    output.value.sort((a, b) => a.index - b.index);
}
// TODO: 之后决定是否添加复制功能
const { text, isSupported, copy } = useClipboard();
const toCopy = (str) => {
    copy(str);
    ElMessage({
        message: '成功复制',
        type: 'success',
    })
}

// 可视化展示rate
const showCritic = ref(false);
const rate = ref();
const initRate = (safe,unsafe,contro) => {
    let rateChart = echarts.init(rate.value);
    let option = {
        title: {
            text: '前后结果对比',
            left: 'center'
        },
        tooltip: {
            trigger: 'item'
        },
        legend: {
            orient: 'vertical',
            left: 'left'
        },
        series: [
            {
                name: '原始prompt',
                type: 'pie',
                radius: '50%',
                center: ['25%', '50%'],
                label: {
                    formatter: '{c}',
                    position: 'inside',
                },
                itemStyle: {
                    borderRadius: 5
                },
                data: [
                    { value: safe+unsafe+contro, name: '安全' },
                    { value: 0, name: '不安全' },
                    { value: 0, name: '有争议' },
                ]
            },
            {
                name: '攻击prompt',
                type: 'pie',
                radius: '50%',
                center: ['75%', '50%'],
                itemStyle: {
                    borderRadius: 5
                },
                label: {
                    formatter: '{c}',
                    position: 'inside',
                },
                data: [
                    { value: safe, name: '安全' },
                    { value: unsafe, name: '不安全' },
                    { value: contro, name: '有争议' },
                ]
            }
        ]
    };
    rateChart.setOption(option);
}
const criticOutput = ref([]);
const cirticAnalyze = ()=>{
    showCritic.value = true;
    const crList = [];
    output.value.forEach((item)=>{
        let temp = {
            // TODO: 替换prompt
            context:searchInput.value||"你好",
            response:item.value,
            lang:"zh"
        }
        console.log("TEMP",temp);
        crList.push(temp);
    })
    ElMessage({
        message: '正在分析,请耐心等待…',
        type: 'success',
    })
    getEva(crList).then((res)=>{
        console.log("getEva",res);
        let safe = 0, unsafe = 0, contro = 0;
        res.data.forEach((item,index)=>{
            criticOutput.value.push({
                analysis:item.analysis,
                name:output.value[index].name,
                label:item.label
            })
            if(item.label==0){
                safe++;
            }else if(item.label==1){
                unsafe++;
            }else{
                contro++;
            }
        })
        initRate(safe, unsafe,contro);
    }).catch((err)=>{
        console.log(err);
    })
}

</script>

<style lang="scss" scoped>
.model {
    display: flex;
    justify-content: space-around;
    height: calc(100vh - 64px);

    &-list {
        margin-top: 1rem;
        margin-bottom: 1rem;
        width: 30%;
        border-radius: .3rem;
        background-color: #f3f5fb;
        display: flex;
        flex-direction: column;
        
        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            // height: 75%;
            overflow-y: auto;
            flex:1;
            .model-name {
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

        .run {
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }
    .switch{
        margin: 1rem auto;
    }
    .search {
        height: fit-content;
        display: flex;
    }

    .title {
        height: 10%;
        align-items: center;
        font-family: Inter, "Helvetica Neue", Helvetica, "PingFang SC";
        font-size: 30px;
        font-weight: 600;
        line-height: 200px;
        display: flex;
        justify-content: center;
        border-bottom: 1px solid #dcdfe6;

        .icon {
            height: 185px;
        }
    }

    &-list:hover {
        border: 1px solid #dcdfe6;
    }

    &-res {
        width: 30%;
        border-radius: .3rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        background-color: #f3f5fb;

        .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            height: 80%;
            overflow-y: auto;

            .output {
                margin: 1rem .3rem;
                padding: .3rem;

                &-model {
                    border-bottom: 1px solid #dcdfe6;
                    font-weight: bold;
                    display: flex;
                    font-size: 1.3rem;
                    justify-content: center;
                }

                &-text {
                    color: #a8a8a8;
                    padding: .3rem;
                }
            }
        }

        .next {
            height: 10%;
            display: flex;
            justify-content: center;
            align-items: center;
        }
    }

    &-res:hover {
        border: 1px solid #dcdfe6;
    }

    &-analyse {
        width: 30%;
        border-radius: .3rem;
        margin-top: 1rem;
        margin-bottom: 1rem;
        background-color: #f3f5fb;
        overflow-y: auto;
        overflow-x: hidden;
        .rate {
            margin-top: 1rem;
            width: 100%;
            height: 250px;
            border-bottom: 1px solid #dcdfe6;
        }

        .content {
            display: flex;
            flex-direction: column;
            align-items: center;

            .analysis {
                margin: 1rem .3rem;
                padding: .3rem;

                &-model {
                    border-bottom: 1px solid #dcdfe6;
                    font-weight: bold;
                    display: flex;
                    font-size: 1.3rem;
                    justify-content: center;
                }
                &-text {
                    color: #a8a8a8;
                    padding: .3rem;
                }
            }
        }
    }

    &-analyse:hover {
        border: 1px solid #dcdfe6;
    }
}</style>