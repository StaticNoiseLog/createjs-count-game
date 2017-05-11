'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var NumberedBox = function (_createjs$Container) {
    _inherits(NumberedBox, _createjs$Container);

    function NumberedBox(game) {
        var number = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

        _classCallCheck(this, NumberedBox);

        var _this = _possibleConstructorReturn(this, (NumberedBox.__proto__ || Object.getPrototypeOf(NumberedBox)).call(this));

        _this.game = game;
        _this.number = number;

        var movieclip = new lib.NumberedBox();
        movieclip.numberText.text = number;

        // movieclip.numberText.font = '28px Oswald';
        // movieclip.numberText.textBaseLine = 'alphabet'; // Firefox requires explicit baseline
        // movieclip.numberText.x += 2; // shift a bit to the right
        // movieclip.numberText.y = 35; // offset from baseline

        // copied and adjusted from graphics.js (output of Adobe Animate)
        new createjs.ButtonHelper(movieclip, 0, 1, 2, false, new lib.NumberedBox(), 3);

        // adding containers to containers = hierarchy, stage will be the root container
        _this.addChild(movieclip);

        _this.setBounds(0, 0, 50, 50);

        // click/tap handler
        _this.on('click', _this.handleClick.bind(_this));
        return _this;
    }
    // this dispatching method is here so that we could do box-specific things, like an animation of the clicked box


    _createClass(NumberedBox, [{
        key: 'handleClick',
        value: function handleClick() {
            // do box-specific stuff
            createjs.Sound.play('Jump');
            this.game.handleClick(this); // do the game-related global stuff
        }
    }]);

    return NumberedBox;
}(createjs.Container);

// The game logic


var GameData = function () {
    function GameData() {
        _classCallCheck(this, GameData);

        this.amountOfBox = 10;
        this.resetData();
    }

    _createClass(GameData, [{
        key: 'resetData',
        value: function resetData() {
            this.currentNumber = 1;
        }
    }, {
        key: 'nextNumber',
        value: function nextNumber() {
            this.currentNumber++;
        }
    }, {
        key: 'isRightNumber',
        value: function isRightNumber(number) {
            return number === this.currentNumber;
        }
    }, {
        key: 'isGameWin',
        value: function isGameWin() {
            return this.currentNumber > this.amountOfBox;
        }
    }]);

    return GameData;
}();

var Game = function () {
    function Game() {
        _classCallCheck(this, Game);

        console.log('Welcome to the game. Version ' + this.version());

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

    _createClass(Game, [{
        key: 'version',
        value: function version() {
            return '1.0.0';
        }
    }, {
        key: 'loadSound',
        value: function loadSound() {
            createjs.Sound.alternateExtensions = ['ogg', 'wav'];
            createjs.Sound.registerSound('soundfx/jump7.aiff', 'Jump');
            createjs.Sound.registerSound('soundfx/game-over.aiff', 'Game Over');
        }
    }, {
        key: 'restartGame',
        value: function restartGame() {
            this.gameData.resetData();
            this.stage.removeAllChildren();
            this.stage.addChild(new lib.Background()); // background
            this.generateMultipleBoxes(this.gameData.amountOfBox);
        }
    }, {
        key: 'generateMultipleBoxes',
        value: function generateMultipleBoxes() {
            var amount = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 10;

            for (var i = amount; i > 0; i--) {
                var movieclip = new NumberedBox(this, i);
                this.stage.addChild(movieclip); // what is added later goes in front
                movieclip.x = Math.random() * (this.stage.width - movieclip.getBounds().width);
                movieclip.y = Math.random() * (this.stage.height - movieclip.getBounds().height);
            }
        }
        // removing a box from the stage is a high-level decision, belongs in Game class, not in NumberedBox

    }, {
        key: 'handleClick',
        value: function handleClick(numberedBox) {
            if (this.gameData.isRightNumber(numberedBox.number)) {
                this.stage.removeChild(numberedBox);
                this.gameData.nextNumber();

                if (this.gameData.isGameWin()) {
                    createjs.Sound.play('Game Over');
                    var gameOverView = new lib.GameoverView();
                    this.stage.addChild(gameOverView);
                    gameOverView.restartButton.on('click', function () {
                        createjs.Sound.play('Jump');
                        this.restartGame();
                    }.bind(this)); // bind Game object to click handler otherwise this would be the button
                }
            }
        }
    }, {
        key: 'retinalize',
        value: function retinalize() {
            this.stage.width = this.canvas.width;
            this.stage.height = this.canvas.height;
            var ratio = window.devicePixelRatio;
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
    }]);

    return Game;
}();

// start the game
var game = new Game();