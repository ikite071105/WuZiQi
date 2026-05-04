// ai.js

// 简单的分值表
const SCORE = {
    //0:空格；1：目标颜色；2：被堵
    //根据中间下了目标颜色棋子后的情况记分
    // 连五
    '11111': 100000,

    // 活四
    '011110': 30000,

    // 冲四/跳四：一头被堵/中间有空位
    '011112': 5000,
    '211110': 5000,
    '10111': 5200,
    '11011': 5200,
    '11101': 5200,

    // 活三，两头通
    '011100': 3000,
    '001110': 3000,
    // 跳三
    '010110': 3000, 
    '011010': 3000, 

    // 眠三，一头堵
    '001112': 500,
    '211100': 500,
    '010112': 450,
    '211010': 450,
    '10011': 350,
    '11001': 350,

    // 活二
    '001100': 100,
    '01010': 80,
    '010010': 80,

    // 眠二
    '000112': 20,
    '211000': 20
};

//ai行动：普通
function aiAction_normal(wzq, aiColor) {
    let bestScore = -1;
    let x=0;
    let y=0;
    let playerColor = 1 - aiColor;

    for (let i = 0; i < wzq.size; i++) {
        for (let j = 0; j < wzq.size; j++) {
            if (wzq.board[i][j] === 0) {
                // 计算该点的分值（防守分 + 进攻分）
                let score = evaluatePoint(wzq, i, j, aiColor) + evaluatePoint(wzq, i, j, playerColor) * 0.8;
                if (score > bestScore) {
                    bestScore = score;
                    x=i;
                    y=j;
                }
            }
        }
    }
    return [x,y];
}

// 评估函数：检查(x,y)点在四个方向上的连子情况
function evaluatePoint(wzq, x, y, color) {
    let totalScore = 0;
    wzq.board[x][y] = color+1;
    //纵向检测
    let strCol = "";
    for(let i = x-4; i <= x+4; i++){
        if(i>=0 && i<wzq.size){
            let tempColor = wzq.board[i][y];
            if(tempColor==0){
                strCol += '0';
            }else if(tempColor==color+1){
                strCol += '1';
            }else{
                strCol += '2';
            }
        }
    }
    //横向检测
    let strRow = "";
    for(let i = y-4; i <= y+4; i++){
        if(i>=0 && i<wzq.size){
            let tempColor = wzq.board[x][i];
            if(tempColor==0){
                strRow += '0';
            }else if(tempColor==color+1){
                strRow += '1';
            }else{
                strRow += '2';
            }
        }
    }
    //斜连(左上往右下)
    let strLR = "";
    let j = y-4;
    for(let i = x-4; i <= x+4; i++){
        if(i>=0 && j>=0 && i<wzq.size && j<wzq.size){
            let tempColor = wzq.board[i][j];
            if(tempColor==0){
                strLR += '0';
            }else if(tempColor==color+1){
                strLR += '1';
            }else{
                strLR += '2';
            }
        }
        j++;
    }
    //斜连(左下往右上)
    let strRL = "";
    j = y-4;
    for(let i = x+4; i >= x-4; i--){
        if(i>=0 && j>=0 && i<wzq.size && j<wzq.size){
            let tempColor = wzq.board[i][j];
            if(tempColor==0){
                strRL += '0';
            }else if(tempColor==color+1){
                strRL += '1';
            }else{
                strRL += '2';
            }
        }
        j++;
    }

    totalScore += getScoreFromString(strCol);
    totalScore += getScoreFromString(strRow);
    totalScore += getScoreFromString(strLR);
    totalScore += getScoreFromString(strRL);

    wzq.board[x][y] = 0;
    return totalScore; 
}

//根据字符串查表加分
function getScoreFromString(str) {
    let s = 0;
    // 遍历分值表，看看当前字符串里包含了哪些特征
    for (let key in SCORE) {
        if (str.includes(key)) {
            s += SCORE[key];
        }
    }
    return s;
}

//简单模式：随机落子
function aiAction_easy(wzq){
    let randomX = Math.floor(Math.random()*(wzq.size));
    let randomY = Math.floor(Math.random()*(wzq.size));
    while(wzq.board[randomX][randomY]){
        randomX = Math.floor(Math.random()*(wzq.size));
        randomY = Math.floor(Math.random()*(wzq.size));
    }
    return [randomX,randomY];
}