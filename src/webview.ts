import * as vscode from 'vscode';
export type * from './webview/shared';

// The extension's asset root, and the operations that need it.
export class Assets {
	constructor(readonly root: vscode.Uri) {}

	uri(rel: string) { return vscode.Uri.joinPath(this.root, rel); }

	resolver(webview: vscode.Webview) {
		const root = this.root;
		return (rel: string) => webview.asWebviewUri(vscode.Uri.joinPath(root, rel));
	}

	localRoots(...extra: vscode.Uri[]) { return [this.root, ...extra]; }
}

interface Command    {command: string, [key: string]: any};
interface Request<M> {command: string, [key: string]: any, result: M};
interface Result<M>  {resultId: number, result: M};

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type RpcRequest<T extends Request<any>> = DistributiveOmit<T, 'result'>;
export type RpcResult<A extends Request<any>, M extends RpcRequest<A>> = Extract<A, { command: M['command'] }>['result'];

// Common message/RPC plumbing for anything that hosts a vscode.Webview.
abstract class WebviewBase<
	MessageIn extends Command,
	MessageOut extends Command,
	RpcOut extends Request<any> = never
> {
	private pending: ((message:any)=>void)[] = [];

	constructor(protected readonly webview: vscode.Webview, public readonly assets: Assets) {

		webview.onDidReceiveMessage(async (message: MessageIn | Result<any>) => {
			if ('resultId' in message) {
				const resolve = this.pending[message.resultId];
				if (resolve) {
					delete this.pending[message.resultId];
					resolve(message.result);
				}
				return;
			}
			if ('requestId' in message) {
				const result = await this.command(message);
				this.webview.postMessage({ resultId: message.requestId, result });
				return;
			}
			this.command(message);
		});
	}

	async RPC<M extends RpcRequest<RpcOut>>(message: M): Promise<RpcResult<RpcOut, M>> {
		const requestId = this.pending.length;
		return new Promise<RpcResult<RpcOut, M>>(resolve => {
			this.pending[requestId] = resolve;
			this.webview.postMessage({ ...message, requestId });
		});
	}

	postMessage(message: MessageOut) {
		this.webview.postMessage(message);
	}

	localUri(rel: string) {
		return this.assets.uri(rel);
	}
	webviewUri(rel: string) {
		return this.webview.asWebviewUri(this.assets.uri(rel));
	}

	abstract command(message: MessageIn): any;
}

export abstract class Panel<
	MessageIn extends Command,
	MessageOut extends Command,
	RpcOut extends Request<any> = never
> extends WebviewBase<MessageIn, MessageOut, RpcOut> {
	constructor(public readonly webviewPanel: vscode.WebviewPanel, assets: Assets) {
		super(webviewPanel.webview, assets);
	}
	reveal() {
		this.webviewPanel.reveal();
	}
}

export abstract class View<
	MessageIn extends Command,
	MessageOut extends Command,
	RpcOut extends Request<any> = never
> extends WebviewBase<MessageIn, MessageOut, RpcOut> {
	constructor(public readonly webviewView: vscode.WebviewView, assets: Assets) {
		super(webviewView.webview, assets);
	}
	show(): void {
		this.webviewView.show();
	}

}
