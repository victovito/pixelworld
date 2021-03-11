
function GetBlockTexture(texture_id){
    return document.getElementById(texture_id);
}

class Block
{
    constructor(parentChunk, position, type, backgroundBlock){
        this.position = position
        this.type = type;
        this.backgroundBlock = backgroundBlock;
        this.texture;

        this.passLightAmount = BLOCK.properties[this.type].passLightAmount;
        this.emitLightAmount = BLOCK.properties[this.type].emitLightAmount;
        this.luminosity = 0;
        this.oldLum = 0;

        this.parentChunk = parentChunk;
    }
    
    PassLight(amount){
        
        if (amount <= 0){
            return;
        }
        
        let passAmount;
        
        if (this.emitLightAmount <= 0){
            this.luminosity = amount;
            passAmount = this.luminosity - 1 / (this.passLightAmount + 1);
        } else {
            this.luminosity = this.emitLightAmount;
            passAmount = 1;
        }
        
        let blockAbove =  world.GetBlockAt(new Vector2Int(this.position.x, this.position.y + 1));
        let blockBellow =  world.GetBlockAt(new Vector2Int(this.position.x, this.position.y - 1));
        let blockLeft =  world.GetBlockAt(new Vector2Int(this.position.x - 1, this.position.y));
        let blockRight = world.GetBlockAt(new Vector2Int(this.position.x + 1, this.position.y));
        if (blockAbove != undefined){
            if (blockAbove.luminosity < passAmount){
                blockAbove.PassLight(passAmount);
            }
        }
        if (blockBellow != undefined){
            if (blockBellow.luminosity < passAmount){
                blockBellow.PassLight(passAmount);
            }
        }
        if (blockLeft != undefined){
            if (blockLeft.luminosity < passAmount){
                blockLeft.PassLight(passAmount);
            }
        }
        if (blockRight != undefined){
            if (blockRight.luminosity < passAmount){
                blockRight.PassLight(passAmount);
            }
        }

    }

    GetLight(){

    }
    
    ChangeType(type){
        this.type = type;
        this.passLightAmount = BLOCK.properties[type].passLightAmount;
        this.emitLightAmount = BLOCK.properties[type].emitLightAmount;
        if (type != BLOCK.AIR){
            this.texture = GetBlockTexture(BLOCK.properties[type].texture);
        }
    }

    Draw(){      
        camera.RenderBlock(this);
    }

}