import React from "react";
import ReactDOM from "react-dom";

import "./index.css";
import '../node_modules/font-awesome/css/all.css';
import '../node_modules/font-awesome/webfonts/fa-regular-400.eot';
import '../node_modules/font-awesome/css/regular.min.css';





function Square(props) {
	let className = props.isWinerSquare ? "square winer" : "square"
	return (
		<button className={className} onClick={props.onClick}>
			{props.value}
		</button>
	);

}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			winSquares: [],
		};
	}

	renderSquare(i, isWinerSquare) {
		return (
			<Square
				value={this.props.squares[i]}
				onClick={() => this.props.handleSquareClick(i)}
				isWinerSquare={isWinerSquare}
			/>
		);
	}

	render() {
		const winer = calculateWinner(this.props.squares).player;
		const winerLine = calculateWinner(this.props.squares).line;
		const squareLines = []
		let index = 0
		for (let i = 0; i < 3; i++) {
			const squaresInLine = []
			for (let j = 0; j < 3; j++) {
				let isWinerSquare = false;
				if (winerLine)
					if (winerLine.includes(index)) isWinerSquare = true;
				squaresInLine.push(this.renderSquare(index, isWinerSquare));
				index++;
			}
			squareLines.push(<div className="board-row">{squaresInLine}</div>);
		}

		let status;
		let newGame;
		if (winer) {
			status = `${winer} win!`;
			newGame = (this.props.gameMode === 'eve') ? 'Next round' : 'New game';
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
					{squareLines}
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
		let classOrient;
		if (this.props.gameMode === 'pvp') return null;
		else if (this.props.gameMode === 'pve' && this.props.orientation === 'left') classOrient = this.props.orientation + " bot-settings";
		else if (this.props.gameMode === 'eve') classOrient = this.props.orientation + " bot-settings";
		else return null;
		return (
			<div className={classOrient}>
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
			gameID: parseInt(Math.random() * 1000000),
			xIsNext: true,
			xIsFirst: true,
			gameMode: 'pvp',
			squares: Array(9).fill(null),
			botDifficulty: 75,
			botDifficultySecond: 75,
			score: { 'X': 0, 'O': 0 },
			gameModesActive: ['left-panel-element active', 'left-panel-element', 'left-panel-element'],
		};
	}

	checkWiner() {
		const winer = calculateWinner(this.state.squares).player;
		if (winer) {
			let score = this.state.score;
			score[winer]++;
			this.setState({
				score: score,
			});
		}
	}

	handleClickDifficulty(difficulty, botID) {
		if (botID === "bot1") this.setState({
			botDifficulty: difficulty,
			score: { 'X': 0, 'O': 0 },
		}, () => { this.restartGame() });
		else this.setState({
			botDifficultySecond: difficulty,
			score: { 'X': 0, 'O': 0 },
		}, () => { this.restartGame() });
	};

	handleClickGameMode(gameMode) {
		let gameModesActive = Array(3).fill('left-panel-element')
		if (gameMode === 'pvp') gameModesActive[0] += ' active';
		if (gameMode === 'pve') gameModesActive[1] += ' active';
		if (gameMode === 'eve') gameModesActive[2] += ' active';

		this.setState({
			gameModesActive: gameModesActive,
			gameMode: gameMode,
			xIsNext: true,
			score: { 'X': 0, 'O': 0 },
		}, () => { this.restartGame() });
	};

	handleSquareClick(i) {
		const squares = this.state.squares.slice();

		if (calculateWinner(squares).player || calculateTie(squares) || squares[i] || this.state.gameMode === 'eve') {
			return;
		}
		if (this.state.gameMode === 'pvp') {
			squares[i] = this.state.xIsNext ? "X" : "O";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			}, () => { this.checkWiner() });
		}
		else if (this.state.gameMode === 'pve') {
			squares[i] = this.state.xIsNext ? "X" : "O";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			}, () => {
				this.checkWiner();
				this.botsTurn(squares).then((squares) => {
					if (squares === undefined) return;
					this.setState({
						squares: squares,
						xIsNext: !this.state.xIsNext,
					}, () => { this.checkWiner() });
				})
			});
		}
	}

	async botsTurn(squares) {
		console.log(squares + "")
		let location;
		let board = [];
		let player = !this.state.xIsNext ? 'O' : 'X'
		for (let i = 0; i < squares.length; i++)
			if (squares[i] !== null) board[i] = squares[i];
			else board[i] = i;

		let promise = new Promise((resolve) => {
			setTimeout(() => {
				resolve(minimax(board, player, player === 'O' ? this.state.botDifficulty : this.state.botDifficultySecond, player).index);
			}, this.state.gameMode === 'pve' ? 250 : 750)
		});

		location = await promise;
		if (location === undefined) return undefined;
		else {
			squares[location] = player;
			return squares;
		}
	}

	restartGame() {
		let squares = this.state.squares.slice();
		squares = Array(9).fill(null)
		this.setState({
			xIsFirst: !this.state.xIsFirst,
			xIsNext: !this.state.xIsFirst,
			gameID: parseInt(Math.random() * 1000000),
			squares: squares,
		}, () => {
			if (this.state.gameMode === 'eve') this.botVsBot(this.state.gameID);
			else if (this.state.gameMode === 'pve' && !this.state.xIsFirst) this.botsTurn(squares).then((squares) => {
				this.setState({
					squares: squares,
					xIsNext: !this.state.xIsNext,
				});
			});;
		});

	}

	botVsBot(gameID) {
		let squares = this.state.squares.slice();
		if (this.state.gameMode === 'eve')
			this.botsTurn(squares).then((squares) => {
				if (gameID !== this.state.gameID) return;
				if (squares === undefined) return;
				this.setState({
					squares: squares,
					xIsNext: !this.state.xIsNext,
				}, () => { this.botVsBot(gameID); this.checkWiner(); });
			});
	}

	render() {

		return (
			<div className="game">
				{<BotSettings
					onClicks={(value) => this.handleClickDifficulty(value, "bot2")}
					orientation={'right'}
					gameMode={this.state.gameMode}
				/>}
				<div className="left-panel">
					<BotSettings
						onClicks={(value) => this.handleClickDifficulty(value, "bot1")}
						orientation={'left'}
						gameMode={this.state.gameMode}
					/>
					<div className={this.state.gameModesActive[0]} onClick={() => this.handleClickGameMode('pvp')}><i className="far fa-user far-lg"></i><span>{'vs'}</span><i className="far fa-user far-lg"></i></div>
					<div className={this.state.gameModesActive[1]} onClick={() => this.handleClickGameMode('pve')}><i className="far fa-fw fa-user far-lg"></i><span id="cntr-span">{'vs'}</span><i className="fa fa-fw fa-desktop"></i></div>
					<div className={this.state.gameModesActive[2]} onClick={() => { this.handleClickGameMode('eve') }}><i className="fa  fa-desktop"></i><span>{'vs'}</span><i className="fa fa-desktop"></i></div>
					<div className="left-panel-element"><i className="fa element-down fa-palette"></i></div>
					<div className="left-panel-element"><i className="far element-down fa-fw fa-chart-bar"></i></div>
				</div>
				<div className="game-board">
					<div className="score"><span className='symbol'>{'O'}</span><span className="score-values">{this.state.score['O'] + ":" + this.state.score['X']}</span><span className='symbol'>{'X'}</span></div>
					<Board
						botDifficulty={this.state.botDifficulty}
						squares={this.state.squares}
						handleSquareClick={(i) => this.handleSquareClick(i)}
						xIsNext={this.state.xIsNext}
						gameMode={this.state.gameMode}
						restartGame={() => this.restartGame()}
					//handleWiner={(winer) => { this.handleWiner(winer) }}
					/>
				</div>
			</div>
		);
	}
}

function calculateWinner(squares) {
	if (squares === undefined) return null;
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
			return { player: squares[a], line: lines[i] };
		}
	}
	return { player: null, line: null };
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

function minimax(reboard, player, difficulty, initiator) {
	let opponent;
	if (initiator !== undefined) {
		opponent = initiator === 'X' ? 'O' : 'X';
	}
	let availableMoves = getAvailableMoves(reboard);
	if (calculateWinner(reboard).player === opponent) return { score: -10 };
	else if (calculateWinner(reboard).player === initiator) return { score: 10 };
	else if (availableMoves.length === 0) return { score: 0 };


	let moves = [];
	for (let i = 0; i < availableMoves.length; i++) {
		let move = {};
		move.index = reboard[availableMoves[i]];
		reboard[availableMoves[i]] = player;

		if (player === 'O') {
			let g = minimax(reboard, 'X', undefined, initiator);
			move.score = g.score;
		} else {
			let g = minimax(reboard, 'O', undefined, initiator);
			move.score = g.score;
		}
		reboard[availableMoves[i]] = move.index;
		moves.push(move);
	}

	let bestMove;
	let bestMoves;
	if (player === initiator) {

		let bestScore = -10000;
		for (let i = 0; i < moves.length; i++) {
			if (moves[i].score > bestScore) {
				bestScore = moves[i].score;
				bestMove = i;
			}
		}
		if (difficulty !== undefined) {
			let probabilityOfMistake = parseInt(Math.random() * 100)
			if (probabilityOfMistake >= difficulty) bestMoves = moves;
			else {
				moves.sort(function (a, b) { return b.score - a.score });
				bestMoves = moves.filter(move => move.score === moves[0].score);
			}
			console.log(initiator + " " + difficulty + " " + probabilityOfMistake);
			console.log(moves);
			console.log(bestMoves);
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





