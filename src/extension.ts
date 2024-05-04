import * as vscode from 'vscode';
import { CharCode, isAsciiDigit, isLowerAsciiLetter, isUpperAsciiLetter } from './utils';

export function activate(context: vscode.ExtensionContext) {
	const outputChannel = vscode.window.createOutputChannel('Respect');
	let respectCaseLeft = vscode.commands.registerCommand('respect-casings.left', factoryOfCursorsHandlers('left', { stopOnPunctuation: false }));
	let respectCaseRight = vscode.commands.registerCommand('respect-casings.right', factoryOfCursorsHandlers('right', { stopOnPunctuation: false }));
	let respectCaseLeftStops = vscode.commands.registerCommand('respect-casings.leftStopsOnPunctuation', factoryOfCursorsHandlers('left', { stopOnPunctuation: true }));
	let respectCaseRightStops = vscode.commands.registerCommand('respect-casings.rightStopsOnPunctuation', factoryOfCursorsHandlers('right', { stopOnPunctuation: true }));

	context.subscriptions.push(respectCaseLeft);
	context.subscriptions.push(respectCaseRight);
	context.subscriptions.push(respectCaseLeftStops);
	context.subscriptions.push(respectCaseRightStops);
}
export function deactivate() { }

interface FactoryOpts {
	stopOnPunctuation : boolean
}

function factoryOfCursorsHandlers(rightOrfLeft: 'right' | 'left', { stopOnPunctuation } : FactoryOpts) {
	if (rightOrfLeft === 'right') {
		return function goRight() {
			const editor = vscode.window.activeTextEditor;
			if (!editor) { return; };

			const document = editor.document;
			const cursorPosition = editor.selection.active;

			const line = cursorPosition.line;
			const lineContent = document.lineAt(line).text;

			const lastLine = document.lineCount - 1
			let column = cursorPosition.character;

			const lineLeftPadding = lineContent.length - lineContent.trimStart().length
			if (column < lineLeftPadding) {
				const newPosition = new vscode.Position(line, lineLeftPadding);
				editor.selection = new vscode.Selection(newPosition, newPosition);
				return;
			}

			if (line === lastLine && column === lineContent.length) { return }

			if (lineContent.slice(column + 1).replace(/\s/g, '').length === 0) {
				const newPosition = new vscode.Position(line + 1, 0);
				editor.selection = new vscode.Selection(newPosition, newPosition);
				return;
			}

			let left = lineContent.charCodeAt(column - 1);
			let right = lineContent.charCodeAt(column);

			if (right === CharCode.Underline && left !== CharCode.Dash ||
				right === CharCode.Dash && left !== CharCode.Dash
			) {
				const newPosition = new vscode.Position(line, column + 1);
				editor.selection = new vscode.Selection(newPosition, newPosition);
				return
			}
			if ((isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right) ||
				String.fromCharCode(left).match(/\s/)) {
				column += 1
			}

			for (let i = column; i < lineContent.length - 1; i++) {
				left = lineContent.charCodeAt(i - 1);
				right = lineContent.charCodeAt(i);

				if ((right === CharCode.Underline && left !== CharCode.Underline) || // snake_case_variables
					(right === CharCode.Dash && left !== CharCode.Dash) || // kebab-case-variables  
					((isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right)) || // camelCaseVariables
					String.fromCharCode(left).match(/\s/) ||
					(stopOnPunctuation && (
						right === CharCode.Period && left !== CharCode.Period || 
						right === CharCode.Colon && left !== CharCode.Colon ||
						right === CharCode.Slash && left !== CharCode.Slash ||
						right === CharCode.Comma && left !== CharCode.Comma
					))
				) {
					const newPosition = new vscode.Position(line, i);
					editor.selection = new vscode.Selection(newPosition, newPosition);
					return;
				}
			}
			const newPosition = new vscode.Position(line, lineContent.length - 1);
			editor.selection = new vscode.Selection(newPosition, newPosition);
		}
	} else {
		return function goLeft() {
			const editor = vscode.window.activeTextEditor;
			if (!editor) { return; };

			const document = editor.document;
			const cursorPosition = editor.selection.active;

			const line = cursorPosition.line;
			const lineContent = document.lineAt(line).text;
			let column = cursorPosition.character;

			if (line === 0 && column === 0) { return }

			if (lineContent.slice(0, column).replace(/\s/g, '').length === 0) {
				const newPosition = new vscode.Position(line - 1, document.lineAt(line - 1).text.length);
				editor.selection = new vscode.Selection(newPosition, newPosition);
				return;
			}


			let left = lineContent.charCodeAt(column - 1);
			let right = lineContent.charCodeAt(column);

			if (left === CharCode.Underline && right !== CharCode.Underline ||
				left === CharCode.Dash && right !== CharCode.Dash
			) {
				const newPosition = new vscode.Position(line, column - 1);
				editor.selection = new vscode.Selection(newPosition, newPosition);
				return
			}
			if ((isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right) ||
				String.fromCharCode(left).match(/\s/)) {
				column -= 1
			}

			for (let i = column; i > 1; i--) {
				left = lineContent.charCodeAt(i - 1);
				right = lineContent.charCodeAt(i);

				if ((left === CharCode.Underline && right !== CharCode.Underline) ||  // snake_case_variables
					(left === CharCode.Dash && right !== CharCode.Dash) || // kebab-case-variables
					(isLowerAsciiLetter(left) || isAsciiDigit(left)) && isUpperAsciiLetter(right) || // camelCaseVariables
					String.fromCharCode(left).match(/\s/) ||
					(stopOnPunctuation && (
						right === CharCode.Period && left !== CharCode.Period || 
						right === CharCode.Colon && left !== CharCode.Colon ||
						right === CharCode.Slash && left !== CharCode.Slash || 
						right === CharCode.Comma && left !== CharCode.Comma
					))
				) {
					const newPosition = new vscode.Position(line, i);
					editor.selection = new vscode.Selection(newPosition, newPosition);
					return;
				}
			}
			const newPosition = new vscode.Position(line, 0);
			editor.selection = new vscode.Selection(newPosition, newPosition);
		}
	}
}


