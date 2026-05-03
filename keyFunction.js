function newGame_click(gameState){
    // 棋盘中间弹出：是否开始新的游戏？[是][否]
    // 状态：新游戏？
    gameState.switchState('newgame');
    console.log(gameState.current); 
    
}

function modeChoose_click(gameState){
    // 棋盘中间弹出：请选择游戏模式：[人机][人人]
    gameState.switchState('modechoose');
    console.log(gameState.current); 
}

function boardSet_click(gameState){
    // 棋盘中间弹出：请选择棋盘大小：[-][12]x[12][+]
    gameState.switchState('boardset');
    console.log(gameState.current); 
}

function ooooohhhh_click(gameState){
    // 棋盘中间弹出：是否开挂（？） [是][否]
    gameState.switchState('ooooohhhh');
    console.log(gameState.current); 
}