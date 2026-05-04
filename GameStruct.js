//游戏状态机
const gameState = {
    PLAYING:'playing',
    GAMEOVER:'gameover',
    GAMEOVER_BOARD:'gameover_board',
    MODESET_0:'modeset_0',
    MODESET_1:'modeset_1',
    NEWGAME:'newgame',
    MODECHOOSE:'modechoose',
    BOARDSET:'boardset',
    OOOOOHHHH:'ooooohhhh',

    current:'playing', 
    
    //状态切换
    switchState(newState){
        this.current = newState;
    }
};

//棋子类
class Chess {
    x;
    y;
    color;

  constructor(color) {
    this.color = color; // black: 黑, white: 白
  }

  draw(board,r,x0,y0,board_startW,board_startH,dis){
    let x = xy_from_board_to_canvas(x0,y0,board_startW,board_startH,dis).x2;
    let y = xy_from_board_to_canvas(x0,y0,board_startW,board_startH,dis).y2;
    
    this.chessPath = new Path2D();
    this.chessPath.moveTo(x,y);
    board.save();
    board.fillStyle = this.color;
    board.strokeStyle = 'grey';
    this.chessPath.arc(x, y, r, 0, Math.PI * 2);
    board.fill(this.chessPath);
    board.stroke(this.chessPath);
    board.restore();
  }
}

//棋盘类
class GobangGame {
  size; 
  board; 

  constructor(size = 12) {
    this.size = size;
    this.board = Array.from({ length: size }, () => Array(size).fill(0));
  }
}

//棋盘坐标转画布坐标
function xy_from_board_to_canvas(x1,y1,board_startW,board_startH,dis){
    let x2 = board_startH+x1*dis;
    let y2 = board_startW+y1*dis;
    return {x2,y2};
}

//画布坐标转棋盘坐标
function xy_from_canvas_to_board(x2,y2,board_startW,board_startH,dis,wzq){
    let board_endW = board_startW+(wzq.size-1)*dis;
    let board_endH = board_startH+(wzq.size-1)*dis;
    let x1, y1;
    if(x2>board_endW+dis/2 || y2>board_endH+dis/2 || x2<board_startW-dis/2 || y2 < board_startH-dis/2){
        x1 = -1;
        y1 = -1;
    }
    //(x1,y1)->(startW+dis*x1+-dis/2, startH+dis*y1+-dis/2)
    x2 -= board_startW;
    x2 /= dis;
    x2 += 0.5;
    x1 = Math.floor(x2);

    y2 -= board_startH;
    y2 /= dis;
    y2 += 0.5;
    y1 = Math.floor(y2);

    return {x1,y1};
}
