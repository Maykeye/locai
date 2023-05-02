/* eslint-disable @typescript-eslint/naming-convention */
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WebSocket } from 'ws';

function ask_ai(prompt_key: string, channel: vscode.OutputChannel) {
	const config = vscode.workspace.getConfiguration('locai');
	const uri = config.get("locai.uri", "ws://localhost:5005/api/v1/stream");
	const prompt_format = config.get(prompt_key, ["{{SEL}}\n### Response:"]).join("\n");
	const editor = vscode.window.activeTextEditor;
	const document = editor?.document;
	const codeSelection = editor?.selection;
	const code = document?.getText(codeSelection?.isEmpty ? undefined : codeSelection);
	const context = code || "";
	const prompt = prompt_format
		.replace("{{SEL}}", context)
		.replace("{{LANG}}", document?.languageId.toString() || "");

	const request = {
		prompt: prompt,
		max_new_tokens: config.get("locai.max_new_tokens", 250),
		do_sample: config.get("locai.do_sample", true),
		temperature: config.get("locai.temperature", 1.3),
		top_p: config.get("locai.top_p", 0.1),
		typical_p: config.get("locai.typical_p", 1),
		repetition_penalty: config.get("locai.repetition_penalty", 1.18),
		top_k: config.get("locai.top_k", 40),
		min_length: config.get("locai.min_length", 0),
		no_repeat_ngram_size: config.get("locai.no_repeat_ngram_size", 0),
		num_beams: config.get("locai.num_beams", 1),
		penalty_alpha: config.get("locai.penalty_alpha", 0),
		length_penalty: config.get("locai.length_penalty", 1),
		early_stopping: config.get("locai.early_stopping", false),
		seed: config.get("locai.seed", -1),
		add_bos_token: config.get("locai.add_bos_token", true),
		truncation_length: config.get("locai.truncation_length", 2048),
		ban_eos_token: config.get("locai.ban_eos_token", false),
		skip_special_tokens: config.get("locai.skip_special_tokens", true),
		stopping_strings: config.get("locai.stopping_strings", [])
	};
	const socket = new WebSocket(uri);
	socket.on("open", () => {
		channel.clear();
		channel.append(prompt);
		socket.send(JSON.stringify(request));
	});
	socket.on("message", (data, isBinary) => {
		if (isBinary) { socket.close(); console.error("Binary"); return; }
		const json = JSON.parse(data.toString());
		if (json.event === "stream_end") {
			socket.close();
			channel.appendLine("");
			channel.appendLine("");
			return;
		}
		if (json.event === "text_stream") {
			channel.append(json.text);
			return;
		}
		console.error("Unknown data: " + json);
	});
}

export function activate(context: vscode.ExtensionContext) {
	const channel = vscode.window.createOutputChannel("Locai");
	channel.show();

	let config = vscode.workspace.getConfiguration('locai');
	let ask = vscode.commands.registerCommand('locai.ask.ai', () => {
		ask_ai("locai.prompt.default", channel);
	});

	let explain = vscode.commands.registerCommand('locai.ask.explain', () => {
		ask_ai("locai.prompt.explain", channel);
	});



	context.subscriptions.push(ask, explain);
}

// This method is called when your extension is deactivated
export function deactivate() { }
