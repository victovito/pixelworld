class Chunk
{
    constructor(position){
        this.position = position;

        this.draw = true;

        this.sizeX = world.chunkSizeX;
        this.sizeY = world.chunkSizeY;
        
        this.id = World.GetChunkId(position);

        this.chunkCanvas = document.createElement("canvas");
        document.body.appendChild(this.chunkCanvas);
        this.chunkCanvas.id = this.id;
        camera.ResizeChunkCanvas(this.chunkCanvas);
        this.chunkCanvas.style.position = "absolute";
        this.chunkCanvas.style.zIndex = 2;
        this.ctx = this.chunkCanvas.getContext("2d");
        
        this.blocks = new Array(this.sizeX);
        for (let c = 0; c < this.sizeX; c++){
            this.blocks[c] = new Array(this.sizeY);
        }

        world.chunks.push(this);
    }

    GenerateChunk(){
        var trees = this.GetTreesPosition();
        //console.log(trees);
        for (let x = 0; x < this.sizeX; x++){
            let terrainHeight = this.GetTerrainHeight(x + this.position.x);
            for (let y = 0; y < this.sizeY; y++){
                let caveNoise = this.CavesNoise(x + this.position.x, y);

                let type;
                let backgroundBlock = BLOCK.AIR;
                if (y <= terrainHeight){
                    if (y == Math.floor(terrainHeight)){
                        if (y >= world.seaLevel + 2){
                            type = BLOCK.GRASS;
                            backgroundBlock = BLOCK.GRASS;
                        } else {
                            type = BLOCK.SAND;
                            backgroundBlock = BLOCK.DIRT;
                        }
                    } else if (y > Math.round(terrainHeight - 5)){
                        type = BLOCK.DIRT;
                        backgroundBlock = BLOCK.DIRT;
                    } else {
                        type = BLOCK.STONE;
                        backgroundBlock = BLOCK.STONE;
                    }
                } else if (y <= world.seaLevel){
                    type = BLOCK.WATER;
                } else {
                    type = BLOCK.AIR;
                }

                // if (caveNoise){
                //     if (type != BLOCK.WATER){
                //         type = BLOCK.AIR;
                //     }
                // }

                this.blocks[x][y] = new Block(this, new Vector2Int(this.position.x + x, this.position.y + y), type, backgroundBlock);
            }
        }
        this.PlaceTrees(trees, TREE.OAK);
        world.UpdateLight();
    }

    GetTerrainHeight(x){
        return this.LayeredTerrainGeneration(x);
    }

    LayeredTerrainGeneration(x){
        x += world.xOffset;
        let layer1 = world.simplexNoise.noise2D(x / 750, 0) * 95 + 100;
        let layer2 = (1 + world.simplexNoise.noise2D(x / 20, 0) * 3) + 8;
        let layer3 = 0.7 + world.simplexNoise.noise2D((x + 10) / 150, 0) * 0.6;

        if (layer1 > 95){
            layer1 -= (layer1 - 95) / 1.5;
        } else if (layer1 < 40){
            layer1 += (layer1 - 40) / 2;
        }

        if (layer3 < 1){
            layer3 = 1;
        }

        return layer1 * layer3 + layer2;
    }

    CavesNoise(x, y){
        x += world.xOffset;
        let value = Math.max(world.simplexNoise.noise2D(x / 15, y / 5)) - 0.3;
        if (value > -0.5 && value < 0){
            return true;
        } else {
            return false;
        }
    }

    PlaceTrees(treesArray, type){
        for (let tree of treesArray){
            let terrainHeight = Math.floor(this.GetTerrainHeight(tree));
            let relativePosition = new Vector2Int(tree - this.position.x, terrainHeight + 2);
            let randomTree = ((world.simplexNoise.noise2D(tree * 12.1346801, 0) + 1) / 2) * Object.keys(type).length;
            randomTree = Math.floor(randomTree);
            try {
                if (terrainHeight + 1 > world.seaLevel){
                    this.PlaceTree(type[randomTree], relativePosition);
                }
            } catch{}
        }
    }

    GetTreesPosition(){

        let trees = [];

        let x1 = this.position.x - 10;
        let x2 = this.position.x + world.chunkSizeX + 10;

        for (let n = x1; n < x2; n++){
            if (world.simplexNoise.noise2D(n * 2, 0) > 0.4){
                let push = true;
                for (let e of trees){
                    if (n >= e && n <= e + 2){
                        push = false;
                        break;
                    }
                }
                if (push){
                    trees.push(n);
                }
            }
        }
        return trees;

    }

    PlaceTree(tree, relativePosition){
        let pattern = tree.pattern;
        let patternCenter = tree.center;
        for (let x = relativePosition.x;
                x < relativePosition.x + pattern[0].length; x++){
            for (let y = relativePosition.y;
                    y < relativePosition.y + pattern.length; y++){
                let posX = x - patternCenter[1];
                let posY = y + patternCenter[0] - pattern.length;
                if (posX < 0 || posX > this.sizeX){
                    continue;
                }
                if (posY < 0 || posY > this.sizeY){
                    continue;
                }

                try {
                    let currentBlock = this.blocks[posX][posY];
                    if (currentBlock.type == BLOCK.AIR || currentBlock.type == BLOCK.LEAVES){
                        let newType = pattern[pattern.length - 1 - (y - relativePosition.y)][x -relativePosition.x];
                        if (newType != BLOCK.AIR){
                            this.blocks[posX][posY].ChangeType(newType);
                        }
                    }
                } catch{}
            }
        }
    }

    PlacePattern(pattern, relativePosition){
        
    }

    BreakBlock(relativePosition){
        let x = relativePosition.x;
        let y = relativePosition.y;

        let block = this.blocks[x][y];
        if (block.type == BLOCK.AIR){
            return;
        }
        block.ChangeType(BLOCK.AIR);
        world.UpdateLight();
        this.RequestUpdate();
    }

    PlaceBlock(relativePosition, type){
        let x = relativePosition.x;
        let y = relativePosition.y;

        let block = this.blocks[x][y];
        if (block.type != BLOCK.AIR && block.type != BLOCK.WATER){
            return;
        }
        block.ChangeType(type);
        world.UpdateLight();
        this.RequestUpdate();
    }
    
    RequestUpdate(){
        this.draw = true;
    }
    
    Draw(){
        camera.PostionChunkCanvas(this);
        if (this.draw){
            camera.ResizeChunkCanvas(this.chunkCanvas);
            this.ctx.imageSmoothingEnabled = false;
            this.ctx.clearRect(0, 0, this.chunkCanvas.clientWidth, this.chunkCanvas.clientHeight);
            for (let x = 0; x < this.sizeX; x++){
                for (let y = 0; y < this.sizeY; y++){
                    let block = this.blocks[x][y];
                    block.Draw();
                    block.oldLum = block.luminosity;
                }
            }
            this.draw = false;
        }
    }

}