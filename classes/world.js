class World
{

    constructor(){

        this.seed = World.RandomSeed();
        
        this.chunkSizeX = 4;
        this.chunkSizeY = 256;
        this.renderChunksDistance = 7;

        this.seaLevel = 100;

        this.gravity = 10;

        this.dayTime = 8; //Value always beetwen 0 and 24
        this.sunMoonBrightness = 0;
        this.brightnessCycle = [0.1,0.1,0.1,0.5,1,1,1,1,1,1,0.1,0.1];
        this.timePassSpeed = 0; //0.04;

        this.chunks = [];
        this.xOffset = 95123;
        this.simplexNoise = new SimplexNoise(this.seed);
        this.perlinNoise;
        
    }

    static RandomSeed(){
        let seed = "";
        for (let i = 0; i < 10; i++){
            let newChar = [0,1,2,3,4,5,6,7,8,9][Math.floor(Math.random() * 10)];
            seed = seed.toString() + newChar.toString();
        }
        return seed;
    }

    static GetChunkId(position){
        let x = GetChunkSizeXMultiple(position.x) / world.chunkSizeX;
        return `x:${x}`;
    }

    static CheckForExistingChunks(id){
        for (let c of world.chunks){
            if (id == c.id){
                return true;
            }
        }
        return false;
    }

    GetChunkById(id){
        for (let chunk of this.chunks){
            if (chunk.id == id){
                return chunk;
            }
        }
    }

    GetBlockAt(position){
        if (position instanceof Vector2){
            position = position.ToVector2Int();
        }
        let chunkX = GetChunkSizeXMultiple(position.x);
        let chunkId = World.GetChunkId(position);
        let chunk = this.GetChunkById(chunkId);
        if (chunk == undefined){
            return;
        }
        let relativePos = new Vector2Int(position.x - chunkX, position.y);

        return chunk.blocks[relativePos.x][relativePos.y];
    }

    CreateChunk(position){
        if (!World.CheckForExistingChunks(World.GetChunkId(position))){
            let c = new Chunk(position);
            c.GenerateChunk();
        }
    }

    GenerateRecursiveWorld(x, radius){
        x = GetChunkSizeXMultiple(x);
        if (radius <= 0) { return; }
        this.CreateChunk(new Vector2Int(x, 0));
        this.GenerateRecursiveWorld(x + this.chunkSizeX, radius - 1);
        this.GenerateRecursiveWorld(x - this.chunkSizeX, radius - 1);
    }

    DrawWorld() {
        this.chunks.forEach(chunk => {
            chunk.Draw();
        });
    }

    ClearChunks(){
        while (this.chunks.length > 0){
            this.chunks.pop();
        }
    }

    RemoveFarChunks(x){
        for (let c of this.chunks){
            let clear = Math.abs(c.position.x - x) > (this.renderChunksDistance + 1) * this.chunkSizeX;
            if (clear){
                document.body.removeChild(c.chunkCanvas);
                this.chunks.splice(this.chunks.indexOf(c), 1);
            }
        }
    }

    RemoveBlockAt(position){
        let chunkX = GetChunkSizeXMultiple(position.x);
        let chunkId = World.GetChunkId(new Vector2(chunkX, 0));
        if (!World.CheckForExistingChunks(chunkId)){
            return;
        }
        let chunk = this.GetChunkById(chunkId);

        try {position = position.ToVector2Int();} catch{}

        let x = position.x - chunkX;
        let y = position.y;

        if (y >= world.chunkSizeY || y < 0){
            return;
        }

        chunk.BreakBlock(new Vector2Int(x,y));
    }

    PlaceBlockAt(position, block){
        let chunkX = GetChunkSizeXMultiple(position.x);
        let chunkId = World.GetChunkId(new Vector2(chunkX, 0));
        if (!World.CheckForExistingChunks(chunkId)){
            return;
        }
        let chunk = this.GetChunkById(chunkId);

        try {position = position.ToVector2Int();} catch{}

        let x = position.x - chunkX;
        let y = position.y;

        if (y >= world.chunkSizeY || y < 0){
            return;
        }

        chunk.PlaceBlock(new Vector2Int(x,y), block);
    }

    RefreshChunks(){
        this.chunks.forEach(c => {
            c.RequestUpdate();
        });
    }

    DoDayNightCycle(){
        if (Math.floor(time / 1000) - (time / 1000).toFixed(1) == 0){
            this.UpdateLight();
        }
        this.dayTime += this.timePassSpeed * deltaTime;
    }

    GetBrightness(){
        while (this.dayTime > 24){
            this.dayTime -= 24;
        }
        let dayTimeInPercentage = this.dayTime / 24;
        let brightnessIndex = Lerp(dayTimeInPercentage, 0, this.brightnessCycle.length);
        let beetwenValuesPercentage = brightnessIndex - Math.floor(brightnessIndex);
        brightnessIndex = Math.floor(brightnessIndex);
        let brightness = Lerp(beetwenValuesPercentage,
            this.brightnessCycle[brightnessIndex],
            this.brightnessCycle[brightnessIndex + 1]);
        
        return brightness;
    }

    CalculateDirectLight(chunk){

        chunk.blocks.forEach(c => {
            c.forEach(b => {
                b.luminosity = 0;
            });
        });
        
        let brightness = this.GetBrightness();
        for (let x = 0; x < this.chunkSizeX; x++){
            let y = this.chunkSizeY - 1;
            while (true){
                let block = chunk.blocks[x][y];
                if (block.type == BLOCK.AIR){
                    block.luminosity = brightness;
                } else {
                    block.luminosity = brightness;
                    break;
                }
                y -= 1;
                if (y < 0){
                    break;
                }
            }
        }
    }

    UpdateLight(){
        for (let chunk of this.chunks){
            this.CalculateDirectLight(chunk);
        }

        let blocksToUpdate = [];

        for (let chunk of this.chunks){
            for (let y = world.chunkSizeY - 1; y > 0; y--){
                for (let x = 0; x < world.chunkSizeX; x++){
                    let block = chunk.blocks[x][y];
                    block.PassLight(Math.max(block.luminosity, block.emitLightAmount));
                    if (block.oldLum != block.luminosity){
                        blocksToUpdate.push(block);
                    }
                }
            }
        }

        for (let chunk of this.chunks){
            for (let y = world.chunkSizeY - 1; y > 0; y--){
                for (let x = 0; x < world.chunkSizeX; x++){
                    let block = chunk.blocks[x][y];
                    if (block.oldLum != block.luminosity){
                        chunk.RequestUpdate();
                    }
                }
            }
        }
        
    }

}
