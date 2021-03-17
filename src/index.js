import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import '../node_modules/font-awesome/css/all.css';
//import '../node_modules/font-awesome/css/font-awesome.min.css';
import '../node_modules/font-awesome/webfonts/fa-regular-400.eot';
import '../node_modules/font-awesome/css/regular.min.css';





function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);

}

class Board extends React.Component {

	renderSquare(i) {
		return (
			<Square
				value={this.props.squares[i]}
				onClick={() => this.props.handleSquareClick(i)}
			/>
		);
	}

	render() {
		const winer = calculateWinner(this.props.squares);
		let status;
		let newGame;
		if (winer) {
			status = `${winer} win!`;
			newGame = (this.props.gameMode === 'eve') ? 'Next round' : 'New game';
		}
		else if (this.props.gameMode === 'eve' && JSON.stringify(this.props.squares) === JSON.stringify(Array(9).fill(null))) {
			status = `Press New game`;
			newGame = 'New game';
		}
		else if (calculateTie(this.props.squares)) {
			status = 'Tie!'
			newGame = (this.props.gameMode === 'eve') ? 'Next round' : 'New game';
		}
		else status = `Next player: ${this.props.xIsNext ? 'X' : 'O'}`;

		return (
			<div className="game-field">
				<div className="game-cells">
					<div className="status">{status}</div>
					<div className="board-row">
						{this.renderSquare(0)}
						{this.renderSquare(1)}
						{this.renderSquare(2)}
					</div>
					<div className="board-row">
						{this.renderSquare(3)}
						{this.renderSquare(4)}
						{this.renderSquare(5)}
					</div>
					<div className="board-row">
						{this.renderSquare(6)}
						{this.renderSquare(7)}
						{this.renderSquare(8)}
					</div>
				</div>
				<div className="new-game button" onClick={() => {
					this.props.restartGame()
				}}>{newGame}</div>
			</div>
		);
	}
}

function BotSettingButton(props) {
	let className;
	className = (props.active === props.name) ? "button active" : "button"
	return (
		<div className={className} onClick={() => props.onClick(props.name)}>
			{props.name}
		</div>
	)
}

class BotSettings extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			active: 'Medium'
		}
	}

	handleActiveChange(name) {
		this.setState({
			active: name,
		});
	}

	renderBotSettingButton(difficulty, name) {
		return (
			<BotSettingButton
				name={name}
				onClick={(name) => {
					this.props.onClicks(difficulty);
					this.handleActiveChange(name);
				}}
				active={this.state.active}
			/>
		);
	}

	render() {
		return (
			<div className="bot-settings">
				{this.renderBotSettingButton(60, 'Easy')}
				{this.renderBotSettingButton(75, 'Medium')}
				{this.renderBotSettingButton(90, 'Hard')}
				{this.renderBotSettingButton(99, 'Impossible')}

			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			xIsNext: true,
			gameMode: 'pvp',
			squares: Array(9).fill(null),
			botDifficulty: 75,
		};
	}

	handleClickDifficulty(difficulty) {
		this.restartGame()
		this.setState({
			botDifficulty: difficulty,
		});
	};

	handleClickGameMode(gameMode) {
		this.restartGame()
		this.setState({
			gameMode: gameMode,
		});
	};

	handleSquareClick(i) {
		const squares = this.state.squares.slice();
		if (calculateWinner(squares) || calculateTie(squares) || squares[i] || this.state.gameMode === 'eve') {
			return;
		}
		if (this.state.gameMode === 'pvp') {
			squares[i] = this.state.xIsNext ? "X" : "O";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			});
		}
		else if (this.state.gameMode === 'pve') {
			console.log(this.state.botDifficulty)
			squares[i] = this.state.xIsNext ? "X" : "O";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			});

			this.botsTurn(squares).then((squares) => {
				this.setState({
					squares: squares,
					xIsNext: !this.state.xIsNext,
				})
			})

		}
	}

	async botsTurn(squares) {
		let location;
		let board = [];
		let player = this.state.xIsNext ? 'O' : 'X'
		for (let i = 0; i < squares.length; i++)
			if (squares[i] !== null) board[i] = squares[i];
			else board[i] = i;

		let promise = new Promise((resolve, reject) => {
			setTimeout(() => {
				resolve(minimax(board, player, this.state.botDifficulty).index);
			}, 250)
		});

		location = await promise;
		squares[location] = player;
		return squares;
	}

	restartGame() {
		let squares = this.state.squares.slice();
		squares = Array(9).fill(null)
		this.setState({
			xIsNext: true,
			squares: squares,
		});
		if (this.state.gameMode === 'eve') {
			while (squares.find(square => square === null) === null) {
				this.botsTurn(squares)
			}
		}
	}

	render() {
		return (
			<div className="game">
				<div className="left-panel">
					<BotSettings
						onClicks={(value) => this.handleClickDifficulty(value)}
					/>
					<div className="left-panel-element" onClick={() => this.handleClickGameMode('pvp')}><i className="far fa-user far-lg"></i><span>{'vs'}</span><i className="far fa-user far-lg"></i></div>
					<div className="left-panel-element" onClick={() => this.handleClickGameMode('pve')}><i className="far fa-fw fa-user far-lg"></i><span>{'vs'}</span><i className="fa fa-fw fa-desktop"></i></div>
					<div className="left-panel-element" onClick={() => this.handleClickGameMode('eve')}><i className="fa  fa-desktop"></i><span>{'vs'}</span><i className="fa fa-desktop"></i></div>
					<div className="left-panel-element"><i className="fa element-down fa-palette"></i></div>
					<div className="left-panel-element"><i className="far element-down fa-fw fa-chart-bar"></i></div>
				</div>
				<div className="game-board">
					<Board
						botDifficulty={this.state.botDifficulty}
						squares={this.state.squares}
						handleSquareClick={(i) => this.handleSquareClick(i)}
						xIsNext={this.state.xIsNext}
						gameMode={this.state.gameMode}
						restartGame={() => this.restartGame()}
					/>
				</div>
			</div>
		);
	}
}

function calculateWinner(squares) {
	const lines = [
		[0, 1, 2],
		[3, 4, 5],
		[6, 7, 8],
		[0, 3, 6],
		[1, 4, 7],
		[2, 5, 8],
		[0, 4, 8],
		[2, 4, 6],
	];
	for (let i = 0; i < lines.length; i++) {
		const [a, b, c] = lines[i];
		if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
			return squares[a];
		}
	}
	return null;
}

function calculateTie(squares) {
	if (!squares.includes(null)) return true;
	else return null;
}

function getAvailableMoves(squares) {
	let availableMoves = [];
	for (let i = 0; i < squares.length; i++) if (squares[i] !== 'X' && squares[i] !== 'O') availableMoves.push(i);
	return availableMoves;
}

function minimax(reboard, player, init) {

	let availableMoves = getAvailableMoves(reboard);
	if (calculateWinner(reboard) === 'X') return { score: -10 };
	else if (calculateWinner(reboard) === 'O') return { score: 10 };
	else if (availableMoves.length === 0) return { score: 0 };


	let moves = [];
	for (let i = 0; i < availableMoves.length; i++) {
		let move = {};
		move.index = reboard[availableMoves[i]];
		reboard[availableMoves[i]] = player;

		if (player === 'O') {
			let g = minimax(reboard, 'X');
			move.score = g.score;
		} else {
			let g = minimax(reboard, 'O');
			move.score = g.score;
		}
		reboard[availableMoves[i]] = move.index;
		moves.push(move);
	}

	let bestMove;
	let bestMoves;
	if (player === 'O') {
		let bestScore = -10000;
		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
		if (init !== undefined) {
			let probabilityOfMistake = parseInt(Math.random() * 100)
			console.log(probabilityOfMistake)
			if (probabilityOfMistake >= init) bestMoves = moves;
			else {
				moves.sort(function (a, b) { return b.score - a.score });
				bestMoves = moves.filter(move => move.score === moves[0].score);
			}
			console.log(player)
			console.log(moves)
			console.log(bestMoves)
			return bestMoves[parseInt(Math.random() * bestMoves.length)];

		}
	} else {
		let bestScore = 10000;
		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score < bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
	}
	return moves[bestMove];
}


// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));





