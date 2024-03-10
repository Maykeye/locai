/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { start } from 'repl';
import * as vscode from 'vscode';

const axios = require('axios');


async function ask_ai_smart(document: vscode.TextDocument, pos: vscode.Position) {
	// A function that sends whole document and position to local server and lets it process data

	let documentText = document.getText(); // TODO: handle empty doc? or leave to server-side locai?

	// TODO: config me
	const context: any = {
		"code": documentText,
		"line": pos.line,
		"col": pos.character,
		"n_tokens": 32
	};

	// TODO: config me
	let post_result = await axios.post("http://127.0.0.1:13333/gen", context);
	let response = post_result.data;
	let text = response.generation;
	return text;
}

async function ask_ai(document: vscode.TextDocument, pos: vscode.Position) {

	const stringLengthLimit = 1024; // TODO: trim me

	let documentText = document.getText(); // TODO: handle empty doc? or edge case -- return?
	let prefix = documentText.split("\n");
	let tail = prefix.splice(pos.line);
	let line = tail[0];
	let prefix_line = line.substring(0, pos.character);
	prefix.push(prefix_line);
	let str_prefix = prefix.join("\n");

	// TODO: config me
	const context: any = {
		"prompt": str_prefix,
		"max_tokens": 100,
		"seed": 10
	};

	// TODO: config me
	let post_result = await axios.post("http://127.0.0.1:5000/v1/completions", context);
	let response = post_result.data;
	let choices = response.choices;
	let choice = choices[0];
	let text = choice.text;
	// TODO: loop on the timer if possible?
	return text;
}

export function activate(context: vscode.ExtensionContext) {
	// TODO: use me
	const config = vscode.workspace.getConfiguration('locai');
	const channel = vscode.window.createOutputChannel("Locai");
	channel.show();

	const abort = vscode.commands.registerCommand('locai.abort', () => {
		// TODO: use me
	});

	const ask = vscode.commands.registerCommand('locai.ask.ai', () => {
		// TODO: use me
	});

	context.subscriptions.push(abort, ask);


	const provider: vscode.InlineCompletionItemProvider = {
		provideInlineCompletionItems: async (
			document: vscode.TextDocument,
			position: vscode.Position,
			context: vscode.InlineCompletionContext,
			token: vscode.CancellationToken
		) => {
			let items: any[] = [];
			// TODO: query after N seconds for 5..10 tokens in context ~128 tokens?
			// TODO: cache (pos, current-line to not rerun query in case user was busy fighting with intellinsense)
			if (context.triggerKind === vscode.InlineCompletionTriggerKind.Invoke) {
				const use_locai_server = true; // TODO: CONFIG
				const result = use_locai_server
					? await ask_ai_smart(document, position)
					: await ask_ai(document, position);
				items.push(new vscode.InlineCompletionItem(result, new vscode.Range(position, position)));

				// Split by lines
				const lines = result.split("\n");
				let prefix = "";
				for (let i = 0; i < lines.length; i++) {
					if (prefix.length) {
						prefix = prefix + "\n";
					}
					prefix = prefix + lines[i];
					if (prefix.length < result.length) {
						items.push(new vscode.InlineCompletionItem(prefix, new vscode.Range(position, position)));
					}
				}

				// Split by words (TODO: config me)
				const first_line = lines[0];
				const words = first_line.split(/(?= |[-()\[\]{},.!@#$%^&*])/g);
				console.log(words);
				prefix = "";
				for (let i = 0; i < words.length; i++) {
					prefix += words[i];
					if (prefix.length < result.length) {
						items.push(new vscode.InlineCompletionItem(prefix, new vscode.Range(position, position)));
					}
				}
			}
			return items;
		}
	};

	vscode.languages.registerInlineCompletionItemProvider({ pattern: '**' }, provider);

}

// This method is called when your extension is deactivated
export function deactivate() { }
