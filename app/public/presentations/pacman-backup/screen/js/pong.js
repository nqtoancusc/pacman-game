/* jshint -W098 */
function Pong() {
	//BEGIN LIBRARY CODE
	var x;
	var y;
	var dx;
	var dy;
	var WIDTH;
	var HEIGHT;
	var ctx;
	var paddlex;
	var paddleY;
	var paddleHt;
	var paddleWt;
	var intervalId;
	var rightDown = false;
	var leftDown = false;
	var radius;
	var paddlexAI;
	var gameController = {
		velocityY: 0,
		sensitivity: 0.05,
		gameSpeed: 20
	};
	
	var canvas = document.getElementById('pongCanvas');

	function onKeyEventChange(change) {
		return function (evt) {
			switch (evt.keyCode) {
				// Left/Right
				case 37: leftDown = change; break;
				case 39: rightDown = change; break;
				// Up/Down
				case 38: leftDown = change; break;
				case 40: rightDown = change; break;
			}
		};
	}
	$(document).keydown(onKeyEventChange(true));
	$(document).keyup(onKeyEventChange(false));

	function init_paddles() {
		paddlex = WIDTH / 2;
		paddlexAI = paddlex;
		paddleHt = 10;
		paddleWt = 75;
		gameController.velocityY = 0;
	}

	function init() {
		ctx = canvas.getContext('2d');
		WIDTH = canvas.width;
		HEIGHT = canvas.height;
		x = 150;
		y = 150;
		dx = 2;
		dy = 4;
		radius = 10;
		rightDown = false;
		leftDown = false;
		intervalId = 0;
		intervalId = setInterval(draw, gameController.gameSpeed);
		init_paddles();
	}

	function circle(x,y,r) {
		ctx.beginPath();
		ctx.arc(x, y, r, 0, Math.PI*2, true);
		ctx.closePath();
		ctx.fill();
	}

	function rect(x,y,w,h) {
		ctx.beginPath();
		ctx.rect(x,y,w,h);
		ctx.closePath();
		ctx.fill();
	}

	function clear() {
		ctx.clearRect(0, 0, WIDTH, HEIGHT);
	}

	function followBallAI() {

		//randomly pick number beteween 0 and 1
		var delayReaction = Math.random();
		
		//25% chance of reaction delay
		if(delayReaction >= 0.25) {

			if(x > paddlexAI + paddleWt) {
				if(paddlexAI + paddleWt + 5 <= WIDTH) {
					paddlexAI += 5;
				}
			}
			
			else if(x < paddlexAI) {
				if(paddlexAI - 5 >= 0) {
					paddlexAI -= 5;
				}
			}
			
			else {

				var centerPaddle = Math.random();

				//80% chance of better centering the paddle
				//otherwise the paddleAI will most of the times
				//hit the ball in one of its extremities
				if(centerPaddle > 0.2) {

					//if ball closer to left side of computer paddle
					if( Math.abs(x - paddlexAI) < Math.abs(x - paddlexAI - paddleWt) ) {
						if(paddlexAI - 5 >= 0) {
							paddlexAI -= 5;
						}
					}
					else {
						if(paddlexAI + paddleWt + 5 <= WIDTH) {
							paddlexAI += 5;
						}
					}
				}
			}
		}
	}
	
	function notify(msg) {
		$('#notify').html(msg).fadeIn(200).delay(500).fadeOut(200);
	}
	
	//END LIBRARY CODE

	function draw() {
		clear();
		circle(x, y, radius);

		//move the paddle if left or right is currently pressed
		if (rightDown) {
			paddlex += 5;
		} else if (leftDown) {
			paddlex -= 5;
		}

		paddlex += gameController.velocityY * gameController.sensitivity;
		paddlex = Math.min(WIDTH - paddleWt, paddlex);
		paddlex = Math.max(0, paddlex);
		
		followBallAI();
		
		rect(paddlex, HEIGHT-paddleHt, paddleWt, paddleHt);
		rect(paddlexAI, 0, paddleWt, paddleHt);

		if (x + dx + radius > WIDTH || x + dx - radius < 0) {
			dx = -dx;
		}

		//upper lane
		if (y + dy - radius <= 0) {

			if (x <= paddlexAI || x >= paddlexAI + paddleWt) {
				clearInterval(intervalId);
				notify('Voitit pelin!');
				init();
			}

			else {
				dy = -dy;
			}
		}
		
		//lower lane
		else if (y + dy + radius > HEIGHT) {
			if (x > paddlex && x < paddlex + paddleWt) {
				dx = 8 * ((x-(paddlex+paddleWt/2))/paddleWt);
				dy = -dy;
			}
			else {
				clearInterval(intervalId);
				notify('Hävisit');
				init();
			}
		}

		x += dx;
		y += dy;
	}

	return {
		init: init,
		getGameController: function() {
			return gameController;
		}
	};
}