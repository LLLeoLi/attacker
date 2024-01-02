<template>
    <div class="model">
        <div class="model-list">
            <div class="title">
                <Model class="icon"></Model>
                <span>模型列表</span>
            </div>
            <div class="switch">
                <el-radio-group v-model="attackType" size="large" fill="#626aef" @change="changeAttackType">
                    <el-radio-button color="#626aef" label="类型攻击" />
                    <el-radio-button color="#626aef" label="自由攻击" />
                </el-radio-group>
            </div>
            <div class="search">
                <template v-if="attackType=='自由攻击'">
                    <el-input v-model="searchInput" :prefix-icon="Attack"  placeholder="请输入prompt"/>
                </template>
                <template v-else>
                    <!-- 类型攻击 -->
                    <el-select v-model="attackScenario" placeholder="Select" multiple @change="changeScenario">
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
                </template>
            </div>
            <div class="content">
                <div class="row" v-for="(model, index) in (useAPI?modelList:models)" :key="model.name">
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
                <template v-if="attackType=='自由攻击'">
                    <el-button type="warning" :icon="Delete" :disabled="selectedModelList.length == 0"
                    @click="deleteAll">
                        清除模型
                    </el-button>
                    <el-button color="#626aef" :icon="Attack" :disabled="selectedModelList.length == 0 || searchInput.length == 0"
                    @click="attack">
                        攻击模型 
                        ({{ selectedModelList.length }}/20)
                    </el-button>
                </template>
                <template v-else>
                    <el-button color="#626aef" :icon="Attack" :disabled="selectedModelList.length == 0 || attackScenario.length == 0"
                    @click="attack">
                        攻击模型
                    </el-button>
                </template>
            </div>
        </div>
        <div class="model-res">
            <div class="title">
                <Result class="icon"></Result>
                <span>运行结果</span>
            </div>
            <template v-if="attackType=='自由攻击'">
                <div class="content" >
                    <template v-if="output.length">
                        <div class="output" v-for="(out,index) in output" :key="index">
                            <div class="output-model">
                                <div class="output-name">{{ out.name }}
                                    <!-- <el-button class="output-copy" type="text" plain :icon="DocumentCopy" @click="toCopy(out.value)"></el-button> -->
                                </div>
                            </div>
                            <div class="output-text">
                                {{ out.model_response }}
                            </div>
                        </div>
                    </template>
                    <el-empty v-else description="自由攻击-暂无内容" />
                </div>
                <div class="next">
                    <el-button type="primary" :icon="Analyse" @click="cirticAnalyze" :disabled="output.length==0">安全性检测</el-button>
                </div>
            </template>
            <template v-else>
                <div class="content" >
                    <template v-if="typeOutput.length">
                        <div class="output" v-for="(out,index) in typeOutput" :key="index">
                            <div class="output-model">
                                <div class="output-name">{{ out.type }}-{{ out.valid }}
                                </div>
                            </div>
                            <div class="output-text">
                                    <span class="output-subtitle">
                                        模型提示: <br/>
                                    </span>
                                    {{ out.prompt }}
                                    <br/>
                                    <span class="output-subtitle">
                                        模型响应: <br/>
                                    </span>
                                    {{ out.model_response }}
                            </div>
                        </div>
                    </template>
                    <el-empty v-else description="类型攻击-暂无内容" />
                </div>
                <div class="next">
                    <el-button type="primary" :icon="Analyse" @click="cirticAnalyze" :disabled="typeOutput.length==0">安全性检测</el-button>
                </div>
            </template>
            
            
        </div>
        <div class="model-analyse">
            <div class="title">
                <Analyse class="icon"></Analyse>
                <span>安全性检测</span>
            </div>
            <div v-if="showCritic" class="content">
                <template v-if="attackType=='自由攻击'">
                    <div class="rate" ref="rate"></div>
                    <div class="content" >
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
                <template v-else>
                    <div class="rate" ref="typeRate"></div>
                        <div v-for="(item,index) in Object.keys(typeRes)" 
                            class="rate" 
                            :id="item+'-chart'+randomKeys[index]">
                        </div>
                </template>
            </div>
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
import { TransitionPresets, useTransition, useClipboard, useThrottleFn } from '@vueuse/core';
import { getEva } from "../api/eva";
import { genAttackPrompt } from "../api/attack";
import * as echarts from 'echarts';
import { nextTick, onMounted } from 'vue';
import {llama2_chinese_7b_chat, chatglm2_6b} from "../api/model";
// 切换模型和API时，切换template中的modelList，然后切换attack
const useAPI = ref(true);
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
const models = ref([
    {
        name: "ChatGLM2-6B",
        description: "ChatGLM2-6B"
    },
    {
        name:"llama2_chinese_7b_chat",
        description: "llama2_chinese_7b_chat"
    }
])
const attackType = ref("类型攻击");
const attackScenario = ref([]);
let attackScenarioCopy = [];
const scenarioList = ref([
    'Reverse_Exposure',
    'Goal_Hijacking',
    'Prompt_Leaking',
    'Unsafe_Instruction_Topic',
    'Role_Play_Instruction',
    'Inquiry_With_Unsafe_Opinion',
]);
// 可视化展示rate
const showCritic = ref(false);

const changeAttackType = ()=>{
    reset();
}
const searchInput = ref("");
const selectedModelList = ref([]);
// 当攻击场景变化后，清空运行结果
const changeScenario = (value)=>{
    // 清空运行结果
    typeOutput.value.length = 0;
    // 清空图表
    showCritic.value = false;
    if(typeRateChart!=null){
        typeRateChart.dispose();
    }
    typeRes.value.length = 0;
    subCharts.forEach((item)=>{
        item.dispose();
    })
    subCharts.length = 0;
    console.log("value",value);
}
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
    models.value.forEach(model=>{
        model.selected = false;
    })
    selectedModelList.value.length = 0;
}

// 直接将值初始化
const reset = ()=>{
    // attacker
    attackScenario.value.length = 0;
    attackScenarioCopy.length = 0;
    searchInput.value = "";
    deleteAll();
    // response
    output.value.length = 0;
    typeOutput.value.length = 0;
    // critic
    showCritic.value = false;
}

// 获取token
const getToken = () => {
    return "24.d67162c0bee374c3575f6cf1b1049653.2592000.1705859414.282335-45184890";
}

const output = ref([]);
const typeOutput = ref([]);
// 开始对指定模型的攻击
const attack = useThrottleFn(() => {
    if(attackType.value == "类型攻击" && selectedModelList.value.length > 1){
        ElMessage({
            message: '类型攻击只能选择一个模型',
            type: 'warning',
        });
        return;
    }
    output.value.length = 0;
    ElMessage({
        message: '正在攻击,请耐心等待…',
        type: 'success',
    })
    if(attackType.value == "自由攻击"){
        // 使用API版本
        if(useAPI.value){
            selectedModelList.value.forEach(model => {
                attackApi(model);
            })
        }
        // 使用模型版本
        else{
            selectedModelList.value.forEach(model=>{
                attackModel(model);
            })
        }
    }else{
        attackScenarioCopy = attackScenario.value;
        const payload = {
            type_list:attackScenarioCopy,
            select_model:"gpt-3.5-turbo",
        };
        genAttackPrompt(payload).then((res)=>{
            console.log("genAttackPrompt",res);
            typeOutput.value = res.data.res;
        }).catch((err)=>{
            console.log(err);
        })
    }
},3000)
// 用于API版本的prompt自由攻击
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
    obj.model_response = "";
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
        obj.model_response += value.result;
    }
    output.value.push(obj);
    output.value.sort((a, b) => a.index - b.index);
}
// 用于模型版本的prompt自由攻击
const attackModel = async (model)=>{
    let obj = {};
    obj.name = model.name;
    obj.index = model.index;
    obj.model_response = "";
    try{
        if(model.name=="llama2_chinese_7b_chat"){
            let res = await llama2_chinese_7b_chat([{context:searchInput.value}]);
            console.log("llama2_chinese_7b_chat",res);
            obj.model_response = res.data[0].response;
        }else if(model.name=="ChatGLM2-6B"){
            let res = await chatglm2_6b([{context:searchInput.value}]);
            console.log("chatglm2_6b",res.data[0].response);
            obj.model_response = res.data[0].response;
        }
    }catch(err){
        console.log(err);
    }
    output.value.push(obj);
    output.value.sort((a, b) => a.index < b.index);
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


// 自由攻击模式
const rate = ref();
const rateSafe = ref({
    safe:0,
    unsafe:0,
    contro:0,
})
// 生成图表
const initRate = () => {
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
                    { value: rateSafe.value.safe + rateSafe.value.unsafe + rateSafe.value.contro, name: '安全' },
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
                    { value: rateSafe.value.safe, name: '安全' },
                    { value: rateSafe.value.unsafe, name: '不安全' },
                    { value: rateSafe.value.contro, name: '有争议' },
                ]
            }
        ]
    };
    rateChart.setOption(option);
}
// 类型攻击模式
const typeRate = ref();
const typeRes = ref({});
// 生成图表
let randomKeys = ref([]);
let typeRateChart = null;
const initTypeRate = ()=>{
    typeRateChart = echarts.init(typeRate.value);
    let safe_count = 0;
    let total_count = 0;
    randomKeys.value.length = 0;
    Object.values(typeRes.value).forEach((item)=>{
        safe_count += item.safe;
        total_count += item.total;
        randomKeys.value.push(Math.random());
    })
    const typeOption = {
        title: {
            text: '攻击结果分析',
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
                name: '攻击结果',
                type: 'pie',
                radius: '50%',
                data: [
                    { value: safe_count, name: '安全' },
                    { value: total_count - safe_count, name: '不安全' },
                ],
                emphasis: {
                    itemStyle: {
                    shadowBlur: 10,
                    shadowOffsetX: 0,
                    shadowColor: 'rgba(0, 0, 0, 0.5)'
                    }
                }
            }
        ]
    };
    typeRateChart.setOption(typeOption);
    initSubTypeRate();
}
let subCharts = [];
const initSubTypeRate = async()=>{
    subCharts.length = 0;
    await nextTick();
    for(let i=0;i<Object.keys(typeRes.value).length;i++){
        let tempChart = echarts.init(document.getElementById(Object.keys(typeRes.value)[i]+'-chart'+randomKeys.value[i]));
        let temp = {
            title: {
                text: Object.keys(typeRes.value)[i],
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
                    name: '攻击结果',
                    type: 'pie',
                    radius: '50%',
                    data: [
                        { value: typeRes.value[Object.keys(typeRes.value)[i]].safe, name: '安全' },
                        { value: typeRes.value[Object.keys(typeRes.value)[i]].total - typeRes.value[Object.keys(typeRes.value)[i]].safe, name: '不安全' },
                    ],
                    emphasis: {
                        itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                        }
                    }
                }
            ]
        };
        tempChart.setOption(temp);
        subCharts.push(tempChart);
    }
}
// 获取分析结果
const criticOutput = ref([]);
const cirticAnalyze = useThrottleFn(async ()=>{
    showCritic.value = true;
    await nextTick();
    if(attackType.value == "自由攻击"){
        const crList = [];
        output.value.forEach((item)=>{
            let temp = {
                context:searchInput.value,
                response:item.model_response,
                lang:"zh"
            }
            crList.push(temp);
        })
        ElMessage({
            message: '正在分析,请耐心等待…',
            type: 'success',
        })
        getEva(crList).then((res)=>{
            console.log("getEva",res);
            rateSafe.value.safe = 0;
            rateSafe.value.unsafe = 0;
            rateSafe.value.contro = 0;
            res.data.forEach((item,index)=>{
                criticOutput.value.push({
                    analysis:item.analysis,
                    name:output.value[index].name,
                    label:item.label
                })
                if(item.label==0){
                    rateSafe.value.safe++;
                }else if(item.label==1){
                    rateSafe.value.unsafe++;
                }else{
                    rateSafe.value.contro++;
                }
            })
            initRate();
        }).catch((err)=>{
            console.log("getEva",err);
        })
    }
    // 类型攻击
    else{
        typeRes.value = attackScenarioCopy.reduce((pre,cur)=>{
            pre[cur] = {
                safe:0,
                total:0,
            };
            return pre;
        },{});
        typeOutput.value.forEach((item)=>{
            if(item.valid == "safe"){
                typeRes.value[item.type].safe++;
            }
            typeRes.value[item.type].total++;
        })
        console.log("typeRes",typeRes.value);
        initTypeRate();
    }
},3000)

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
            overflow-x: hidden;
            .output {
                margin-top: .5rem;
                padding: .3rem;

                &-model {
                    border-bottom: 1px solid #dcdfe6;
                    font-weight: bold;
                    display: flex;
                    font-size: 1.3rem;
                    justify-content: center;
                }
                &-subtitle{
                    font-weight: bold;
                    color: black;
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
        .rate {
            margin-top: 1rem;
            width: 100%;
            height: 250px;
            border-bottom: 1px solid #dcdfe6;
        }

        .content {
            overflow-y: auto;
            overflow-x: hidden;
            max-height: 90%;
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
}
.el-select{
    width: 100%;
}
</style>../api/eva