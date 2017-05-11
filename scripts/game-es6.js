class NumberedBox extends createjs.Container {
    constructor(game, number = 0) {
        super();

        this.game = game;
        this.number = number;

        var movieclip = new lib.NumberedBox();
        movieclip.numberText.text = number;

        // movieclip.numberText.font = '28px Oswald';
        // movieclip.numberText.textBaseLine = 'alphabet'; // Firefox requires explicit baseline
        // movieclip.numberText.x += 2; // shift a bit to the right
        // movieclip.numberText.y = 35; // offset from baseline

        // copied and adjusted from graphics.js (output of Adobe Animate)
        new createjs.ButtonHelper(movieclip, 0, 1, 2, false, new lib.NumberedBox(), 3);

        // adding containers to containers = hierarchy, stage will be the root container
        this.addChild(movieclip);

        this.setBounds(0, 0, 50, 50);

        // click/tap handler
        this.on('click', this.handleClick.bind(this));
    }
    // this dispatching method is here so that we could do box-specific things, like an animation of the clicked box
    handleClick() {
        // do box-specific stuff
        createjs.Sound.play('Jump');
        this.game.handleClick(this); // do the game-related global stuff
    }
}

// The game logic
class GameData {
    constructor() {
        this.amountOfBox = 10;
        this.resetData();
    }
    resetData() {
        this.currentNumber = 1;
    }
    nextNumber() {
        this.currentNumber++;
    }
    isRightNumber(number) {
        return (number === this.currentNumber);
    }
    isGameWin() {
        return this.currentNumber > this.amountOfBox;
    }
}

class Game {
    constructor() {
        console.log(`Welcome to the game. Version ${this.version()}`);

        this.loadSound();

        this.canvas = document.getElementById('game-canvas');
        this.stage = new createjs.Stage(this.canvas);

        // save game's width and height for cases where we change the canvas size
        this.stage.width = this.canvas.width;
        this.stage.height = this.canvas.height;

        this.stage.enableMouseOver();

        // setting it as an attribute on window makes the stage visible globally for debugging
        window.debugStage = this.stage;

        // enable tap on touch devices
        createjs.Touch.enable(this.stage);

        // enable high-res screens
        this.retinalize();

        // Ticker is like a clock running at the desired FPS
        createjs.Ticker.setFPS(60);
        // keep re-drawing the stage on every tick
        createjs.Ticker.on('tick', this.stage);

        // game related initialization
        this.gameData = new GameData();

        this.restartGame();
    }
    version() {
        return '1.0.0';
    }
    loadSound() {
        createjs.Sound.alternateExtensions = ['ogg', 'wav'];
        createjs.Sound.registerSound('soundfx/jump7.aiff', 'Jump');
        createjs.Sound.registerSound('soundfx/game-over.aiff', 'Game Over');
    }
    restartGame() {
        this.gameData.resetData();
        this.stage.removeAllChildren();
        this.stage.addChild(new lib.Background()); // background
        this.generateMultipleBoxes(this.gameData.amountOfBox);
    }
    generateMultipleBoxes(amount = 10) {
        for (var i = amount; i > 0; i--) {
            var movieclip = new NumberedBox(this, i);
            this.stage.addChild(movieclip); // what is added later goes in front
            movieclip.x = Math.random() * (this.stage.width - movieclip.getBounds().width);
            movieclip.y = Math.random() * (this.stage.height - movieclip.getBounds().height);
        }
    }
    // removing a box from the stage is a high-level decision, belongs in Game class, not in NumberedBox
    handleClick(numberedBox) {
        if (this.gameData.isRightNumber(numberedBox.number)) {
            this.stage.removeChild(numberedBox);
            this.gameData.nextNumber();

            if (this.gameData.isGameWin()) {
                createjs.Sound.play('Game Over');
                var gameOverView = new lib.GameoverView();
                this.stage.addChild(gameOverView);
                gameOverView.restartButton.on('click', (function () {
                    createjs.Sound.play('Jump');
                    this.restartGame();
                }).bind(this)); // bind Game object to click handler otherwise this would be the button
            }
        }
    }
    retinalize() {
        this.stage.width = this.canvas.width;
        this.stage.height = this.canvas.height;
        let ratio = window.devicePixelRatio;
        if (ratio === undefined) {
            return; // no info about screen
        }
        // use higher resolutino for the canvas
        this.canvas.setAttribute('width', Math.round(this.stage.width * ratio));
        this.canvas.setAttribute('height', Math.round(this.stage.height * ratio));

        this.stage.scaleX = this.stage.scaleY = ratio;

        // Use CSS to shrink down the visible size of the high-res canvas
        this.canvas.style.width = this.stage.width + 'px';
        this.canvas.style.height = this.stage.height + 'px';
    }
}

// start the game
var game = new Game();