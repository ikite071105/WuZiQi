function newGame_click(gameState){
    gameState.switchState('newgame');
}

function modeChoose_click(gameState){
    gameState.switchState('modechoose');
}

function boardSet_click(gameState){
    gameState.switchState('boardset');
}

function ooooohhhh_click(chessConnect){
    if(chessConnect.current<3){
        chessConnect.current++;
    }else{
        chessConnect.current = 0;
    }
}
