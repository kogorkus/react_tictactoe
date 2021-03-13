import React from "react";
import ReactDOM from "react-dom";
import "./index.css";

function Square(props) {
	return (
		<button className="square" onClick={props.onClick}>
			{props.value}
		</button>
	);

}

class Board extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			squares: this.props.squares,
			xIsNext: true,
			vsBot: true,
		};
	}

	renderSquare(i) {
		return (
			<Square
				value={this.state.squares[i]}
				onClick={() => this.handleClick(i)}
			/>
		);
	}

	handleClick(i) {
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
			console.log(this.props.botDifficulty)
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
				squares[minimax(board, 'O', this.props.botDifficulty).index] = 'O';
				this.setState({
					squares: squares,
					xIsNext: !this.state.xIsNext,
				});
			}, 250);
		}
	}

	render() {
		const winer = calculateWinner(this.state.squares);
		let status;
		let newGame;
		if (winer) {
			status = `${winer} win!`;
			newGame = 'New game'
		}
		else if (calculateTie(this.state.squares)) {
			status = 'Tie!'
			newGame = 'New game'
		}
		else status = `Next player: ${this.state.xIsNext ? 'X' : 'O'}`;

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
					let squares = this.state.squares.slice();
					squares = Array(9).fill(null)
					this.setState({
						squares: squares,
						xIsNext: true,
					});
				}}>{newGame}</div>
			</div>
		);
	}
}

class BotSettings extends React.Component {
	render() {
		return (
			<div className="bot-settings">
				<div className="button" onClick={this.props.onClicks[0]}>{'Easy'}</div>
				<div className="button" onClick={this.props.onClicks[1]}>{'Medium'}</div>
				<div className="button" onClick={this.props.onClicks[2]}>{'Hard'}</div>
			</div>
		);
	}
}

class Game extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			squares: Array(9).fill(null),
			botDifficulty: 75,
		};
	}

	handleClick(difficulty) {
		let squares = this.state.squares.slice();
		squares = Array(9).fill(null)
		this.setState({
			squares: squares,
			botDifficulty: difficulty,
		});
		console.log(squares)
	};

	render() {
		return (
			<div className="game">
				<BotSettings
					onClicks={[() => this.handleClick(60), () => this.handleClick(75), () => this.handleClick(90)]}
				/>
				<div className="game-board">
					<Board
						botDifficulty={this.state.botDifficulty}
						squares={this.state.squares}
					/>
				</div>
				<div className="game-info">
					<div>{/* status */}</div>
					<ol>{/* TODO */}</ol>
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
			if (probabilityOfMistake >= init) moves.sort(function (a, b) { return a.score - b.score });
			else moves.sort(function (a, b) { return b.score - a.score });
			bestMoves = moves.filter(move => move.score === moves[0].score);
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





