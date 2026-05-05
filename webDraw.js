const UI_CONFIG = {
    colors: {
        overlay: 'rgba(131,139,144,0.3)',
        modalBg: 'lightblue',
        contentBg: 'white',
        primary: 'darkblue',
        success: 'lightgreen',
        danger: 'pink',
        text: 'black'
    },
    fonts: {
        main: 'serif',
        display: 'Arial'
    }
};

const chessConnect = {
    CHESS_ONLY : 0,
    GUA_1 : 1,  //显示全部连接情况
    GUA_w : 2,  //显示白子连接情况
    GUA_b : 3,  //显示黑子连接情况

    current : 0,
};

let index = 0;  //虚线动画用

// 绘制全屏遮罩和弹窗白底
function drawModalBase(ctx, w, h, scaleHeight = 1/3) {
    ctx.save();
    ctx.fillStyle = UI_CONFIG.colors.overlay;
    ctx.fillRect(0, 0, w, h);
    
    // 动态高度
    const modalH = h * scaleHeight;
    const startY = (h - modalH) / 2;

    ctx.fillStyle = UI_CONFIG.colors.modalBg;
    ctx.fillRect(0, startY, w, modalH);
    
    ctx.fillStyle = UI_CONFIG.colors.contentBg;
    let margin = w / 15;
    ctx.fillRect(margin / 2, startY + margin / 2, w - margin, modalH - margin);
    ctx.restore();
    return { startY, modalH, margin }; // 返回坐标供后续文本定位
}

//绘制棋子图标
function drawChessIcon(ctx, x, y, r, color) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.strokeStyle = 'grey';
    ctx.stroke();
    ctx.restore();
}

//通用按钮绘制（带文字和路径记录）
function drawButton(ctx, x, y, width, height, text, color, fontSize) {
    const path = new Path2D();
    path.rect(x, y, width, height);
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.strokeStyle = '#ccc'; 
    ctx.stroke(path);
    
    ctx.fillStyle = UI_CONFIG.colors.text;
    ctx.font = `${fontSize}px ${UI_CONFIG.fonts.display}`; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    ctx.fillText(text, x + width / 2, y + height / 2 + 2);
    ctx.restore();
    
    return path;
}

// 绘制带状态的切换按钮
function drawToggleBtn(ctx, path, x, y, w, h, text, isSelected, activeCol, fontSize) {
    ctx.save();
    ctx.fillStyle = isSelected ? activeCol : '#ebedef';
    ctx.fill(path);
    
    ctx.fillStyle = isSelected ? 'white' : 'black';
    ctx.font = fontSize + 'px ' + UI_CONFIG.fonts.main;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, x + w / 2, y + h / 2);
    ctx.restore();
}

function draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq) {
    // 绘制背景底色
    ctx.fillStyle = 'lightyellow';
    ctx.fillRect(board_startW, board_startH, board_W, board_H);

    // 计算间距
    const dis = board_W / (wzq.size - 1);

    // 绘制线条
    ctx.save();
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    for (let i = 0; i < wzq.size; i++) {
        // 纵轴
        ctx.beginPath();
        ctx.moveTo(board_startW + i * dis, board_startH);
        ctx.lineTo(board_startW + i * dis, board_startH + board_H);
        ctx.stroke();
        // 横轴
        ctx.beginPath();
        ctx.moveTo(board_startW, board_startH + i * dis);
        ctx.lineTo(board_startW + board_W, board_startH + i * dis);
        ctx.stroke();
    }

    ctx.restore();

    // 遍历数据绘制棋子
    for (let i = 0; i < wzq.size; i++) {
        for (let j = 0; j < wzq.size; j++) {
            const cell = wzq.board[i][j];
            if (cell !== 0) {
                //各方向检测同色棋子(右，右下，下，左下)
                if(chessConnect.current==1 || chessConnect.current==cell+1){
                    //console.log("虚线绘制");
                    let pos1 = xy_from_board_to_canvas(i,j,board_startW,board_startH,dis);
                    let x1 = pos1.x2;
                    let y1 = pos1.y2; 
                    ctx.save();
                    ctx.strokeStyle = (cell-1) ? 'rgb(103,163,250)' : 'rgb(244,125,113)';
                    ctx.lineWidth = 4;
                    ctx.setLineDash([2,2]);
                    //虚线的偏移
                    ctx.lineDashOffset = index;
                    if(chessConnect.current==1){
                        index+=0.015;
                    }else{
                        index+=0.03; 
                    }
                    if(index > 100) index = 0;
                    //右
                    let tempX = i+1;
                    let tempY = j;
                    if(tempX<wzq.size && wzq.board[tempX][tempY]==cell){
                        let pos2 = xy_from_board_to_canvas(tempX,tempY,board_startW,board_startH,dis);
                        let x2 = pos2.x2;
                        let y2 = pos2.y2;
                        ctx.beginPath();
                        ctx.moveTo(x1,y1);
                        ctx.lineTo(x2,y2);
                        ctx.stroke();
                    }
                    //右下
                    tempX = i+1;
                    tempY = j+1;
                    if(tempX<wzq.size && tempY<wzq.size && wzq.board[tempX][tempY]==cell){
                        let pos2 = xy_from_board_to_canvas(tempX,tempY,board_startW,board_startH,dis);
                        let x2 = pos2.x2;
                        let y2 = pos2.y2;
                        ctx.beginPath();
                        ctx.moveTo(x1,y1);
                        ctx.lineTo(x2,y2);
                        ctx.stroke();
                    }
                    //下
                    tempX = i;
                    tempY = j+1;
                    if(tempY<wzq.size && wzq.board[tempX][tempY]==cell){
                        let pos2 = xy_from_board_to_canvas(tempX,tempY,board_startW,board_startH,dis);
                        let x2 = pos2.x2;
                        let y2 = pos2.y2;
                        ctx.beginPath();
                        ctx.moveTo(x1,y1);
                        ctx.lineTo(x2,y2);
                        ctx.stroke();
                    }
                    //左下
                    tempX = i-1;
                    tempY = j+1;
                    if(tempX>=0 && tempY<wzq.size && wzq.board[tempX][tempY]==cell){
                        let pos2 = xy_from_board_to_canvas(tempX,tempY,board_startW,board_startH,dis);
                        let x2 = pos2.x2;
                        let y2 = pos2.y2;
                        ctx.beginPath();
                        ctx.moveTo(x1,y1);
                        ctx.lineTo(x2,y2);
                        ctx.stroke();
                    }
                    ctx.restore();
                }
                //棋子
                const targetChess = (cell === 2) ? chessB : chessW; // 2黑 1白
                targetChess.draw(ctx, dis / 2.5, i, j, board_startW, board_startH, dis);

            }
        }
    }
}

function draw_newGame(ctx, wzq, w, h) {
    // 画底层的棋盘
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    
    // 画显示框
    drawModalBase(ctx, w, h);
    
    // 标题
    const textH = h / 3 - h / 15;
    const fontSize = textH / 6;
    ctx.fillStyle = 'black';
    ctx.font = fontSize + 'px ' + UI_CONFIG.fonts.main;
    ctx.textAlign = 'center';
    ctx.fillText("确定开始新游戏？", w / 2, h / 2 - fontSize);

    // 画按钮
    const btnW = (w - w/15) / 4;
    const btnH = fontSize * 1.8;
    const btnY = h / 2 + fontSize;

    // 绘制按钮并获取路径
    confirmPath = drawButton(ctx, w/2 - btnW - 20, btnY, btnW, btnH, "确认", UI_CONFIG.colors.success, fontSize * 0.8);
    cancelPath = drawButton(ctx, w/2 + 20, btnY, btnW, btnH, "取消", UI_CONFIG.colors.danger, fontSize * 0.8);
}

//游戏结束界面
function draw_gameOver(ctx, wzq, w, h, current_chess) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    
    drawModalBase(ctx, w, h, 1/2); 

    const fontSize = (h / 3) / 6;
    const winner = (current_chess === 1) ? '● 黑子' : '○ 白子';
    
    ctx.fillStyle = 'black';
    ctx.font = `bold ${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`游戏结束，胜者为 ${winner}`, w/2, h/2 - fontSize * 1.8);

    // 绘制按钮
    const btnW = w * 0.7;
    const btnH = fontSize * 1.8;
    newgamePath = drawButton(ctx, w/2 - btnW/2, h/2 - fontSize/2, btnW, btnH, "点击开始新游戏", 'rgb(156,172,175)', fontSize);

    viewBoardPath = drawButton(ctx, w/2 - btnW/2, h/2 - fontSize/2 + btnH*1.2, btnW, btnH, "点击显示棋盘", 'rgb(214,216,194)', fontSize);
}

//棋盘设置界面
function draw_boardSet(ctx, wzq, w, h, size) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);

    const { startY, modalH, margin } = drawModalBase(ctx, w, h, 1/3);
    
    const text_StartH = startY + margin / 2;
    const text_H = modalH - margin;
    const fontSize = text_H / 6;

    ctx.fillStyle = 'black';
    ctx.font = fontSize + 'px serif';
    ctx.textAlign = 'center';
    ctx.fillText("棋盘大小设置", w/2, text_StartH + fontSize * 1.2);

    const row2Y = text_StartH + text_H * 0.45;
    const btnSide = fontSize * 2;

    sizeMinusPath = drawButton(ctx, w/2 - btnSide * 2, row2Y - btnSide/2, btnSide, btnSide, "▼", "#f0f0f0", fontSize);
    
    ctx.fillStyle = 'black';
    ctx.font = (fontSize * 1.2) + 'px Arial';
    ctx.fillText(size, w/2, row2Y + fontSize/3);
    
    sizePlusPath = drawButton(ctx, w/2 + btnSide, row2Y - btnSide/2, btnSide, btnSide, "▲", "#f0f0f0", fontSize);

    const btnW = (w - w/15) / 4;
    const btnH = fontSize * 1.8;
    const row3Y = text_StartH + text_H * 0.68;

    sizeConfirmPath = drawButton(ctx, w/2 - btnW - 20, row3Y, btnW, btnH, "确认", UI_CONFIG.colors.success, fontSize * 0.8);
    sizeCancelPath = drawButton(ctx, w/2 + 20, row3Y, btnW, btnH, "取消", UI_CONFIG.colors.danger, fontSize * 0.8);
}

//模式选择界面
function draw_modeChoose(ctx, wzq, w, h, current_mode) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    const { startY, modalH } = drawModalBase(ctx, w, h);

    const fontSize = modalH / 6;
    const btnW = (w - w/15) / 3; 
    const btnH = fontSize * 1.5;

    const row1Y = startY + modalH * 0.2; 
    pvpPath = new Path2D();
    pvpPath.rect(w/2 - btnW - 20, row1Y, btnW, btnH);
    pvePath = new Path2D();
    pvePath.rect(w/2 + 20, row1Y, btnW, btnH);

    drawToggleBtn(ctx, pvpPath, w/2 - btnW - 20, row1Y, btnW, btnH, "人人模式", current_mode === 0, UI_CONFIG.colors.primary, fontSize * 0.8);
    drawToggleBtn(ctx, pvePath, w/2 + 20, row1Y, btnW, btnH, "人机模式", current_mode === 1, UI_CONFIG.colors.primary, fontSize * 0.8);

    const ctrlBtnW = (w - w/15) / 4;
    const ctrlBtnY = startY + modalH * 0.6; 
    modeConfirmPath = drawButton(ctx, w/2 - ctrlBtnW - 20, ctrlBtnY, ctrlBtnW, btnH, "下一步", UI_CONFIG.colors.success, fontSize * 0.7);
    modeCancelPath = drawButton(ctx, w/2 + 20, ctrlBtnY, ctrlBtnW, btnH, "取消", UI_CONFIG.colors.danger, fontSize * 0.7);
}

//人人模式设置界面
function draw_modeSet_0(ctx, wzq, w, h, colorFirst) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    const { startY, modalH } = drawModalBase(ctx, w, h);

    const fs = modalH / 6;
    const bw = (w - w/15) / 3;
    const bh = fs * 1.5;
    const rowY = startY + modalH * 0.2;

    blackFirstPath = new Path2D(); blackFirstPath.rect(w/2 - bw - 20, rowY, bw, bh);
    whiteFirstPath = new Path2D(); whiteFirstPath.rect(w/2 + 20, rowY, bw, bh);

    drawToggleBtn(ctx, blackFirstPath, w/2 - bw - 20, rowY, bw, bh, "    黑子先手", colorFirst === 1, UI_CONFIG.colors.primary, fs * 0.8);
    drawToggleBtn(ctx, whiteFirstPath, w/2 + 20, rowY, bw, bh, "    白子先手", colorFirst === 0, UI_CONFIG.colors.primary, fs * 0.8);
    
    drawChessIcon(ctx, w/2 - bw - 5, rowY + bh/2, fs * 0.4, 'black');
    drawChessIcon(ctx, w/2 + 35, rowY + bh/2, fs * 0.4, 'white');

    // 确认/返回 统一
    const ctrlBtnW = (w - w/15) / 4;
    const ctrlBtnY = startY + modalH * 0.6;
    modeConfirmPath = drawButton(ctx, w/2 - ctrlBtnW - 20, ctrlBtnY, ctrlBtnW, bh, "确定", UI_CONFIG.colors.success, fs * 0.7);
    modeCancelPath = drawButton(ctx, w/2 + 20, ctrlBtnY, ctrlBtnW, bh, "返回", UI_CONFIG.colors.danger, fs * 0.7);
}

//人机模式设置
function draw_modeSet_1(ctx, wzq, w, h, playerColor, playerFirst) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);

    const { startY, modalH } = drawModalBase(ctx, w, h, 0.5);

    const baseModalH = h / 3;
    const fs = baseModalH / 6;           
    const bw = (w - w/15) / 3;         
    const bh = fs * 1.5;           
    const ctrlBtnW = (w - w/15) / 4;    

    ctx.fillStyle = 'black';
    ctx.font = ` ${fs}px serif`;
    ctx.textAlign = 'center';
    
    ctx.fillText("你是：", w/2, startY + fs * 1.6); 

    // 黑子 / 白子
    const row1Y = startY + fs * 2.2;
    playerBlackPath = new Path2D(); playerBlackPath.rect(w/2 - bw - 20, row1Y, bw, bh);
    playerWhitePath = new Path2D(); playerWhitePath.rect(w/2 + 20, row1Y, bw, bh);
    
    drawToggleBtn(ctx, playerBlackPath, w/2 - bw - 20, row1Y, bw, bh, "    黑子", playerColor === 1, UI_CONFIG.colors.primary, fs * 0.8);
    drawToggleBtn(ctx, playerWhitePath, w/2 + 20, row1Y, bw, bh, "    白子", playerColor === 0, UI_CONFIG.colors.primary, fs * 0.8);
    
    drawChessIcon(ctx, w/2 - bw - 5, row1Y + bh/2, fs * 0.4, 'black');
    drawChessIcon(ctx, w/2 + 35, row1Y + bh/2, fs * 0.4, 'white');

    // 先手 / 后手 
    const row2Y = row1Y + bh + 15;
    playerFirstPath = new Path2D(); playerFirstPath.rect(w/2 - bw - 20, row2Y, bw, bh);
    playerLastPath = new Path2D(); playerLastPath.rect(w/2 + 20, row2Y, bw, bh);
    
    drawToggleBtn(ctx, playerFirstPath, w/2 - bw - 20, row2Y, bw, bh, "先手", playerFirst === 1, 'darkgreen', fs * 0.8);
    drawToggleBtn(ctx, playerLastPath, w/2 + 20, row2Y, bw, bh, "后手", playerFirst === 0, 'darkgreen', fs * 0.8);

    // 确认 / 返回
    const ctrlBtnY = startY + modalH - bh - 18; 
    mode1ConfirmPath = drawButton(ctx, w/2 - ctrlBtnW - 20, ctrlBtnY, ctrlBtnW, bh, "确认", UI_CONFIG.colors.success, fs * 0.7);
    mode1CancelPath = drawButton(ctx, w/2 + 20, ctrlBtnY, ctrlBtnW, bh, "返回", UI_CONFIG.colors.danger, fs * 0.7);
}

// 比分栏绘制
function drawWinCount(ctx, w, h, winB, winW, mode) {
    ctx.clearRect(0, 0, w, h);
    
    const centerY = h / 2;
    const centerX = w / 2;
    const fontSize = 2 * h / 3;
    const radius = 8;
    
    ctx.font = `${fontSize}px ${UI_CONFIG.fonts.main}`;
    ctx.textBaseline = 'middle';

    // 确定文字内容
    let nameB = "黑方";
    let nameW = "白方";

    if(mode) { // 人机模式
        nameB = (playerColor == 1) ? "玩家" : "人机";
        nameW = (playerColor == 0) ? "玩家" : "人机";
    }else{          // 人人模式
        nameB = "玩家1";
        nameW = "玩家2";
    }

    // 绘制左侧（黑棋）
    const textB = `${nameB}  ${winB}`;
    const metricsB = ctx.measureText(textB);
    const leftStart = centerX - metricsB.width - 40; 

    drawChessIcon(ctx, leftStart, centerY, radius, 'black');
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(textB, leftStart + radius + 10, centerY);

    // 绘制中间的分隔符
    ctx.textAlign = 'center';
    ctx.fillStyle = 'grey';
    ctx.fillText("VS", centerX, centerY);

    // 绘制右侧（白棋）
    const textW = `${winW}  ${nameW}`;
    const rightStart = centerX + 30; 

    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.fillText(textW, rightStart, centerY);
    
    const metricsW = ctx.measureText(textW);
    drawChessIcon(ctx, rightStart + metricsW.width + 15, centerY, radius, 'white');
}
