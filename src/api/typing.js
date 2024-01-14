import { ref } from "vue"

// 每组数据显示的时间间隔
const waitingTime = {
    min: 1000,
    max: 1500,
}

// 两段长的文字（模型提示内容、模型响应内容）每次显示间隔的时间
const wordDelay = {
    min: 100,
    max: 250,
}

// 除两段长的文字（模型提示内容、模型响应内容）外的文字每次显示间隔的时间
const wordDelayTotal = {
    min: 500,
    max: 800,
}

// 两段长的文字（模型提示内容、模型响应内容）每次显示的字符数
const wordNum = {
    min: 5,
    max: 20,
}

let showGroupTimeout
let showWordTimeout
export let showIndex = ref(0)
export let typeOutWaiting = ref(false)
export const showTypeOutput = (typeOutput,curIndex) => {
    typeOutWaiting.value = true
    const data = typeOutput.value[showIndex.value]
    // 这里定义了基本的显示内容
    data.name = data.type + '-' + data.valid
    data.model_tip_subtitle = '模型提示:'
    data.model_response_subtitle = '模型响应:'

    const duration = random(waitingTime)
    if(showGroupTimeout) {
        clearTimeout(showGroupTimeout)
    }
    showGroupTimeout = setTimeout(() => {
        typeOutWaiting.value = false
        showAnimation(0, data, 'name', 'name2', true, function() {
            showAnimation(0, data, 'model_tip_subtitle', 'model_tip_subtitle2', true, function() {
                showAnimation(0, data, 'prompt', 'prompt2', false, function() {
                  showAnimation(0, data, 'model_response_subtitle', 'model_response_subtitle2', false, function() {
                        showAnimation(0, data, 'model_response', 'model_response2', false, function() {
                            curIndex.value = showIndex.value
                            showIndex.value ++
                            if(showIndex.value < typeOutput.value.length) {
                                showTypeOutput(typeOutput,curIndex)
                            } else {
                                typeOutWaiting.value = false;
                            }
                        })  
                    })  
                })
            })
        })
    }, duration);
}

export const clearTypeOutput = (typeOutWaiting) => {
    if(showIndex) {
        showIndex.value = 0
    }
    if(typeOutWaiting) {
        typeOutWaiting.value = false
    }
    
    if(showGroupTimeout) {
        clearTimeout(showGroupTimeout)
    }
    if(showWordTimeout) {
        clearTimeout(showWordTimeout)
    }
}
// 动画效果实现方式是添加为对象添加新的变量
const showAnimation = (index = 0, data, key_input, key_output, showTotal, func_callback) =>  {
    let delay = random(wordDelay)
    if(showTotal) {
        delay = random(wordDelayTotal)
    }

    if(showWordTimeout) {
        clearTimeout(showWordTimeout)
    }
    showWordTimeout = setTimeout(() => {
        if(showTotal) {
            index = data[key_input].length
        }
        data[key_output] = data[key_input].substr(0, index)

        setTimeout(() => {
            if(document.getElementById("content")) {
                document.getElementById("content").scrollTop = document.getElementById("content").scrollHeight;
            }
        }, 10);

        if(index >= data[key_input].length) {
            index = data[key_input].length
            clearTimeout(showWordTimeout)
            if(func_callback) {
                func_callback()
            }
        } else {
            index += random(wordNum)
            showAnimation(index, data, key_input, key_output, showTotal, func_callback)
        }
    }, delay)
}

const random = (obj) => {
    return Math.floor(Math.random()*(obj.max-obj.min) + obj.min)
}
