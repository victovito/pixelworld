
var world;
var camera;

var blockSelected;

var deltaTime = 0;
var lastUpdate = Date.now();
var start = Date.now();
var time = 0;

function Run(){
    InitGame();
    
    CreateInputs({});
    
    world = new World();
    camera = new Camera();
    
    let randomXpos = Math.floor((Math.random() * 200) - 100) + 0.5;
    world.GenerateRecursiveWorld(randomXpos, world.renderChunksDistance);
    
    new Player(new Vector2(randomXpos, world.chunks[0].GetTerrainHeight(randomXpos)));
    
    blockSelected = BLOCK.STONE;
    
    Update();
    
}

function Update(){
    time = Date.now() - start;
    let now = Date.now();
    deltaTime = (now - lastUpdate) / 1000;
    lastUpdate = now;

    ScreenInfo();

    world.GenerateRecursiveWorld(playerList[0].position.x, world.renderChunksDistance);
    world.RemoveFarChunks(playerList[0].position.x);
    world.DoDayNightCycle();
    UpdatePlayers();
    camera.position = playerList[0].position.Add(new Vector2(0, playerList[0].size.y/2));
    camera.Render();

    window.requestAnimationFrame(Update);
}

function ScreenInfo(){
    document.getElementById("coords").innerHTML = 
    `x: ${playerList[0].position.x.toFixed(2)}</br>y: ${playerList[0].position.y.toFixed(2)}
    </br>world seed: ${world.seed}`

    document.getElementById("framerate").innerHTML = `${(1 / deltaTime).toFixed(0)}fps`;
}

window.onload = Run;
