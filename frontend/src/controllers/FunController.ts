export class FunController{
    gol: GOL;

    constructor(canvas: HTMLCanvasElement){
        this.gol = new GOL(canvas)
    }

    public gameOfLife(){
        this.gol.run()
    }

}

/**
 * Inspired by https://css-tricks.com/game-life/, refactored as a TypeScript class. 
 */
class GOL{
    canvas: HTMLCanvasElement;
    WIDTH: number;
    HEIGHT: number;
    ctx: CanvasRenderingContext2D;
    LEN = 10;
    x: number;
    y: number;
    myGol: any[] = [];
    golTmp: any[] = [];

    constructor(canvas: HTMLCanvasElement){
        this.canvas = canvas
        this.WIDTH = canvas.clientWidth
        this.HEIGHT = canvas.clientHeight
        canvas.height = this.HEIGHT
        canvas.width = this.WIDTH
        this.ctx = canvas.getContext("2d")!
        this.x = Math.floor(this.WIDTH/this.LEN);
        this.y = this.HEIGHT/this.LEN;
    }

    public run(){
        this.initMatrix();
        setInterval(() => this.nextStep(), 50);
    }
        
    initTmp(){
    for(var xVal = 0; xVal<=this.x+2;xVal++){
        this.golTmp[xVal] = new Array();
        for(var yVal = 0; yVal<=this.y+2; yVal++){
            this.golTmp[xVal][yVal] = 0;
        }
        } 
    }

    initMatrix(){
    // reset matrix
    this.myGol = new Array();
    this.golTmp = new Array();

        for(var xVal = 0; xVal<=this.x+2;xVal++){
        this.myGol[xVal] = new Array();
        this.golTmp[xVal] = new Array();
        for(var yVal = 0; yVal<=this.y+2; yVal++){
            this.golTmp[xVal][yVal] = 0;
            var randVal = Math.floor((Math.random()*2));
            this.myGol[xVal][yVal] = randVal;
        if (randVal == 1){
            this.draw(xVal+1,yVal+1)
        }
        }
        }

        
    }

    draw(x: number, y: number){
    this.ctx.fillRect(this.LEN*(x-1),this.LEN*(y-1),this.LEN,this.LEN);
    }

    nextStep(){
        // reset tempArray
        this.initTmp();
        // reset canvas
        this.ctx.fillStyle = "rgb(32, 32, 34)";
        this.ctx.clearRect(0,0,this.WIDTH,this.HEIGHT);

        for(var xVal = 1; xVal<=this.x+1;xVal++){
            for(var yVal = 1; yVal<=this.y+1; yVal++){
                var neighbourSum = this.myGol[xVal-1][yVal] + this.myGol[xVal-1][yVal-1] + this.myGol[xVal-1][yVal+1] + this.myGol[xVal][yVal-1] + this.myGol[xVal][yVal+1] + this.myGol[xVal+1][yVal] + this.myGol[xVal+1][yVal+1] + this.myGol[xVal+1][yVal-1];
                if(this.myGol[xVal][yVal] == 1){
                    if(neighbourSum == 2 || neighbourSum == 3){
                        this.golTmp[xVal][yVal] = 1;
                        this.ctx.fillStyle = "rgb(166,109,3)";
                        this.draw(xVal,yVal);
                }
            } else {
                if(neighbourSum == 3) {
                    this.golTmp[xVal][yVal] = 1;
                    this.ctx.fillStyle = "rgb(191,144,4)";
                    this.draw(xVal,yVal);
                }
            }
            }
        }
        
        this.myGol = this.golTmp.slice();
    }
}