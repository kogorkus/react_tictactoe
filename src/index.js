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
			newGame = 'New game'
		}
		else if (calculateTie(this.props.squares)) {
			status = 'Tie!'
			newGame = 'New game'
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
			vsBot: true,
			squares: Array(9).fill(null),
			botDifficulty: 75,
		};
	}

	handleClick(difficulty) {
		this.restartGame()
		this.setState({
			botDifficulty: difficulty,
		});
	};

	handleSquareClick(i) {
		const squares = this.state.squares.slice();
		if (calculateWinner(squares) || calculateTie(squares) || squares[i]) {
			return;
		}
		if (!this.state.vsBot) {
			squares[i] = this.state.xIsNext ? "X" : "O";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			});
		}
		else {
			console.log(this.state.botDifficulty)
			squares[i] = "X";
			this.setState({
				squares: squares,
				xIsNext: !this.state.xIsNext,
			});
			let board = []
			for (let i = 0; i < squares.length; i++)
				if (squares[i] !== null) board[i] = squares[i];
				else board[i] = i;
			setTimeout(() => {
				squares[minimax(board, 'O', this.state.botDifficulty).index] = 'O';
				this.setState({
					squares: squares,
					xIsNext: !this.state.xIsNext,
				});
			}, 250);
		}
	}

	restartGame() {
		let squares = this.state.squares.slice();
		squares = Array(9).fill(null)
		this.setState({
			xIsNext: true,
			squares: squares,
		});
	}

	render() {
		return (
			<div className="game">

				<BotSettings
					onClicks={(value) => this.handleClick(value)}
				/>
				<div className="left-panel">
					<div className="left-panel-element"><i className="far fa-user far-lg"></i><i className="far fa-user far-lg"></i></div>
					<div className="left-panel-element"><i className="far fa-user far-lg"></i><i className="fa fa-fw fa-desktop"></i></div>
					<div className="left-panel-element"><i className="fa fa-fw fa-desktop"></i><i className="fa fa-fw fa-desktop"></i></div>
					<div className="left-panel-element element-down"><i className="fa fa-palette"></i></div>
					<div className="left-panel-element element-down"><i className="far fa-fw fa-chart-bar"></i></div>

				</div>

				<div className="game-board">
					<Board
						botDifficulty={this.state.botDifficulty}
						squares={this.state.squares}
						handleSquareClick={(i) => this.handleSquareClick(i)}
						xIsNext={this.state.xIsNext}
						vsBot={this.state.vsBot}
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
			// moves.sort(function (a, b) { return a.score - b.score });
			// bestMoves = moves.filter(move => move.score === moves[0].score);

			else {
				moves.sort(function (a, b) { return b.score - a.score });
				bestMoves = moves.filter(move => move.score === moves[0].score);
			}
			//bestMoves = moves.filter(move => move.score === moves[0].score);
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





