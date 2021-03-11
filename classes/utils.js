
function InitGame(){
    
    window.addEventListener('resize', ResizeCanvas, false);
    
    window.addEventListener("wheel", function(e){
        let deltaY = e.deltaY;
        let amount = 1 + deltaY / -Math.abs(deltaY) / 15;
        camera.zoom *= amount;
        try {
            for (let c of world.chunks){
                camera.ResizeChunkCanvas(c.chunkCanvas);
                c.RequestUpdate();
            }
            for (let p of playerList){
                camera.ResizeEntityCanvas(p);
            }
        } catch {}
    });
    
    window.addEventListener("mousedown", function(e){
        if (e.which == 1){
            dragging = true;
        }
    });
    
    window.addEventListener("mouseup", function(e){
        if (e.which == 1){
            dragging = false;
        }
    });
    
    window.addEventListener("mousemove", function(e){
        // try {
        //     if (dragging){
        //         camera.position = camera.position.Sub(
        //             new Vector2(e.movementX / camera.zoom, -e.movementY / camera.zoom));
        //     }
        // } catch{}
    });
    
    window.addEventListener("click", function(e){
        let x = e.pageX;
        let y = e.pageY;
        let clickPos = camera.ScreenPointToWorldPos(new Vector2(x, y));
        if (e.which == 1){
            world.RemoveBlockAt(clickPos);
        }
    });

    window.addEventListener("contextmenu", function(e){
        let x = e.pageX;
        let y = e.pageY;
        let clickPos = camera.ScreenPointToWorldPos(new Vector2(x, y));
        world.PlaceBlockAt(clickPos, blockSelected);
    });
    
    ResizeCanvas();
}
    
function ResizeCanvas(){
    // if (canvas){
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeigh;
    //     return;
    // }
    // let allCanvas = document.getElementsByTagName("canvas");
    // for (let canvas of allCanvas){
    //     canvas.width = window.innerWidth;
    //     canvas.height = window.innerHeight;
    // }
    let bg_canvas = document.getElementById("background");
    bg_canvas.width = window.innerWidth;
    bg_canvas.height = window.innerHeight;

    // try {
    //     for (let c of world.chunks){
    //         c.Draw();
    //     }
    // } catch {}
}

function UpdateCanvas(canvas){
    
    let ctx = canvas.getContext("2d");
    
    ctx.resetTransform();
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    World.DrawBackground(ctx);
    
}
    
class Vector2Int
{
    constructor(x = 0, y = 0){
        this.x = Math.floor(x);
        this.y = Math.floor(y);
    }
    
    ToVector2(){
        return new Vector2(this.x, this.y);
    }
    
    Add(vector){
        return new Vector2(this.x + Math.floor(vector.x), this.y + Math.floor(vector.y));
    }
    
    Sub(vector){
        return new Vector2(this.x - Math.floor(vector.x), this.y - Math.floor(vector.y));
    }
    
    Scale(factor){
        return new Vector2(this.x * factor, this.y * factor);
    }

}

class Vector2
{
    constructor(x = 0, y = 0){
        this.x = x;
        this.y = y;
    }

    ToVector2Int(){
        return new Vector2(Math.floor(this.x), Math.floor(this.y));
    }

    Add(vector){
        return new Vector2(this.x + vector.x, this.y + vector.y);
    }

    Sub(vector){
        return new Vector2(this.x - vector.x, this.y - vector.y);
    }

    Scale(factor){
        return new Vector2(this.x * factor, this.y * factor);
    }

    InvertY(){
        return new Vector2(this.x, -this.y);
    }

    RoundValues(){
        return new Vector2(Math.round(this.x), Math.round(this.y));
    }

}

function GetChunkSizeXMultiple(number){
    let n = Math.floor(number);
    const x = world.chunkSizeX;
    if (n % x == 0){
        return n;
    }
    return Math.floor(n / x) * world.chunkSizeX;
}

function Lerp(value, start, end){
    return (1-value) * start + value * end;
}

window.oncontextmenu = function(){
    return false;
}
