const UI_CONFIG = {
    colors: {
        overlay: 'rgba(0,0,70,0.4)',
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

// webDraw.js

/**
 * 绘制全屏遮罩和弹窗白底
 */
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
/**
 * 通用按钮绘制（带文字和路径记录）
 * @returns {Path2D} 用于点击检测
 */
// 修改 drawButton 使其更符合你旧版的 textBaseline 习惯
function drawButton(ctx, x, y, width, height, text, color, fontSize) {
    const path = new Path2D();
    path.rect(x, y, width, height);
    
    ctx.save();
    ctx.fillStyle = color;
    ctx.fill(path);
    ctx.strokeStyle = '#ccc'; // 还原旧版的描边
    ctx.stroke(path);
    
    ctx.fillStyle = UI_CONFIG.colors.text;
    ctx.font = `${fontSize}px ${UI_CONFIG.fonts.display}`; // 还原 Arial
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // 这里的 y + height / 2 + 2 是为了模拟你旧代码中 +5px 的视觉感
    ctx.fillText(text, x + width / 2, y + height / 2 + 2);
    ctx.restore();
    
    return path;
}

/**
 * 绘制带状态的切换按钮（例如：选中蓝色，未选中灰色）
 */
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
    // 1. 绘制背景底色
    ctx.fillStyle = 'lightyellow';
    ctx.fillRect(board_startW, board_startH, board_W, board_H);

    // 2. 计算间距
    const dis = board_W / (wzq.size - 1);

    // 3. 绘制线条
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

    // 4. 遍历数据绘制棋子
    // 假设全局已经 new 好了 chessB 和 chessW 实例
    for (let i = 0; i < wzq.size; i++) {
        for (let j = 0; j < wzq.size; j++) {
            const cell = wzq.board[i][j];
            if (cell !== 0) {
                const targetChess = (cell === 2) ? chessB : chessW; // 2黑 1白
                targetChess.draw(ctx, dis / 2.5, i, j, board_startW, board_startH, dis);
            }
        }
    }
}

function draw_newGame(ctx, wzq, w, h) {
    // 1. 先画底层的棋盘
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    
    // 2. 画弹窗基础
    drawModalBase(ctx, w, h);
    
    // 3. 画标题
    const textH = h / 3 - h / 15;
    const fontSize = textH / 6;
    ctx.fillStyle = 'black';
    ctx.font = fontSize + 'px ' + UI_CONFIG.fonts.main;
    ctx.textAlign = 'center';
    ctx.fillText("确定开始新游戏？", w / 2, h / 2 - fontSize);

    // 4. 画按钮
    const btnW = (w - w/15) / 4;
    const btnH = fontSize * 1.8;
    const btnY = h / 2 + fontSize;

    // 直接调用封装好的函数，并更新全局路径对象
    confirmPath = drawButton(ctx, w/2 - btnW - 20, btnY, btnW, btnH, "确认", UI_CONFIG.colors.success, fontSize * 0.8);
    cancelPath = drawButton(ctx, w/2 + 20, btnY, btnW, btnH, "取消", UI_CONFIG.colors.danger, fontSize * 0.8);
}

function draw_gameOver(ctx, wzq, w, h, current_chess) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    drawModalBase(ctx, w, h);

    const fontSize = (h / 3) / 6;
    const winner = (current_chess === 1) ? '● 黑子' : '○ 白子';
    
    ctx.fillStyle = 'black';
    ctx.font = `bold ${fontSize}px serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`游戏结束，胜者为 ${winner}`, w/2, h/2 - fontSize);

    // 绘制大按钮
    const btnW = w * 0.7;
    const btnH = fontSize * 1.8;
    newgamePath = drawButton(ctx, w/2 - btnW/2, h/2 + fontSize/7, btnW, btnH, "点击开始新游戏", 'rgb(125,149,146)', fontSize);
}

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

function draw_modeChoose(ctx, wzq, w, h, current_mode) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    const { startY, modalH } = drawModalBase(ctx, w, h);

    const fontSize = modalH / 6;
    const btnW = (w - w/15) / 3; // 统一按钮宽度
    const btnH = fontSize * 1.5;
    
    // 1. 中间两个模式切换按钮 - 整体上移到 modal 中心偏上
    const row1Y = startY + modalH * 0.2; 
    pvpPath = new Path2D();
    pvpPath.rect(w/2 - btnW - 20, row1Y, btnW, btnH);
    pvePath = new Path2D();
    pvePath.rect(w/2 + 20, row1Y, btnW, btnH);

    drawToggleBtn(ctx, pvpPath, w/2 - btnW - 20, row1Y, btnW, btnH, "人人模式", current_mode === 0, UI_CONFIG.colors.primary, fontSize * 0.8);
    drawToggleBtn(ctx, pvePath, w/2 + 20, row1Y, btnW, btnH, "人机模式", current_mode === 1, UI_CONFIG.colors.primary, fontSize * 0.8);

    // 2. 下方控制按钮 - 间距与 newgame 一致 (40px)
    const ctrlBtnW = (w - w/15) / 4;
    const ctrlBtnY = startY + modalH * 0.6; // 稍微往上提
    modeConfirmPath = drawButton(ctx, w/2 - ctrlBtnW - 20, ctrlBtnY, ctrlBtnW, btnH, "下一步", UI_CONFIG.colors.success, fontSize * 0.7);
    modeCancelPath = drawButton(ctx, w/2 + 20, ctrlBtnY, ctrlBtnW, btnH, "取消", UI_CONFIG.colors.danger, fontSize * 0.7);
}

/**
 * 人人模式设置界面
 */
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

function draw_modeSet_1(ctx, wzq, w, h, playerColor, playerFirst) {
    draw_board(ctx, board_startW, board_startH, board_W, board_H, wzq);
    // 弹窗框体保持 0.55 比例以容纳多行内容
    const { startY, modalH } = drawModalBase(ctx, w, h, 0.5);

    // --- 关键修正：手动计算 fs 和尺寸，使其与 modeSet_0 的 1/3 比例保持物理一致 ---
    // modeSet_0 的 modalH 是 h/3，所以物理字号 fs 应基于 h/3 计算
    const baseModalH = h / 3;
    const fs = baseModalH / 6;           // 对齐 modeSet_0 的字号
    const bw = (w - w/15) / 3;          // 对齐 modeSet_0 的按钮宽度
    const bh = fs * 1.5;                // 对齐 modeSet_0 的按钮高度
    const ctrlBtnW = (w - w/15) / 4;    // 对齐 modeSet_0 的控制按钮宽度

    ctx.fillStyle = 'black';
    ctx.font = ` ${fs}px serif`;
    ctx.textAlign = 'center';
    // 标题位置稍微下移一点点，避免顶着边缘
    ctx.fillText("你是：", w/2, startY + fs * 1.6); 

    // 第一行：黑子 / 白子 (位置参考标题下移)
    const row1Y = startY + fs * 2.2;
    playerBlackPath = new Path2D(); playerBlackPath.rect(w/2 - bw - 20, row1Y, bw, bh);
    playerWhitePath = new Path2D(); playerWhitePath.rect(w/2 + 20, row1Y, bw, bh);
    
    drawToggleBtn(ctx, playerBlackPath, w/2 - bw - 20, row1Y, bw, bh, "    黑子", playerColor === 1, UI_CONFIG.colors.primary, fs * 0.8);
    drawToggleBtn(ctx, playerWhitePath, w/2 + 20, row1Y, bw, bh, "    白子", playerColor === 0, UI_CONFIG.colors.primary, fs * 0.8);
    
    // 图标对齐逻辑保持与 modeSet_0 一致
    drawChessIcon(ctx, w/2 - bw - 5, row1Y + bh/2, fs * 0.4, 'black');
    drawChessIcon(ctx, w/2 + 35, row1Y + bh/2, fs * 0.4, 'white');

    // 第二行：先手 / 后手 (间距 15px)
    const row2Y = row1Y + bh + 15;
    playerFirstPath = new Path2D(); playerFirstPath.rect(w/2 - bw - 20, row2Y, bw, bh);
    playerLastPath = new Path2D(); playerLastPath.rect(w/2 + 20, row2Y, bw, bh);
    
    drawToggleBtn(ctx, playerFirstPath, w/2 - bw - 20, row2Y, bw, bh, "先手", playerFirst === 1, 'darkgreen', fs * 0.8);
    drawToggleBtn(ctx, playerLastPath, w/2 + 20, row2Y, bw, bh, "后手", playerFirst === 0, 'darkgreen', fs * 0.8);

    // 底部控制按钮：确认 / 返回
    // 使用与 modeSet_0 相同的 ctrlBtnW 和间隔
    const ctrlBtnY = startY + modalH - bh - 18; // 距离底部留出固定感
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

    // 1. 确定文字内容
    let nameB = "黑方";
    let nameW = "白方";

    if (mode === 1) { // 人机模式
        nameB = (playerColor === 1) ? "玩家" : "人机";
        nameW = (playerColor === 0) ? "玩家" : "人机";
    } else { // 人人模式
        nameB = "玩家1";
        nameW = "玩家2";
    }

    // 2. 绘制左侧（黑棋）
    // 测量文字宽度以便居中对齐
    const textB = `${nameB}  ${winB}`;
    const metricsB = ctx.measureText(textB);
    const leftStart = centerX - metricsB.width - 40; // 这里的 40 是给棋子预留的空间

    drawChessIcon(ctx, leftStart, centerY, radius, 'black');
    ctx.fillStyle = 'black';
    ctx.textAlign = 'left';
    ctx.fillText(textB, leftStart + radius + 10, centerY);

    // 3. 绘制中间的分隔符
    ctx.textAlign = 'center';
    ctx.fillStyle = 'grey';
    ctx.fillText("VS", centerX, centerY);

    // 4. 绘制右侧（白棋）
    const textW = `${winW}  ${nameW}`;
    const rightStart = centerX + 30; // 偏移出中间 VS 的位置

    ctx.textAlign = 'left';
    ctx.fillStyle = 'black';
    ctx.fillText(textW, rightStart, centerY);
    
    // 棋子放在文字后面
    const metricsW = ctx.measureText(textW);
    drawChessIcon(ctx, rightStart + metricsW.width + 15, centerY, radius, 'white');
}
