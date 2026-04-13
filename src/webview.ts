import * as vscode from 'vscode';
export type * from './webview/shared';

interface Command    {command: string, [key: string]: any};
interface Request<M> {command: string, [key: string]: any, result: M};
interface Result<M>  {resultId: number, result: M};

type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;
export type RpcRequest<T extends Request<any>> = DistributiveOmit<T, 'result'>;
export type RpcResult<A extends Request<any>, M extends RpcRequest<A>> = Extract<A, { command: M['command'] }>['result'];

export abstract class Panel<
	MessageIn extends Command,
	MessageOut extends Command,
	RpcOut extends Request<any> = never
> {
	private pending: ((message:any)=>void)[] = [];
    constructor(public readonly webviewPanel: vscode.WebviewPanel) {
		const webview = webviewPanel.webview;

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
				this.webviewPanel.webview.postMessage({ resultId: message.requestId, result });
				return;
			}
			this.command(message);
		});
    }

	protected async RPC<M extends RpcRequest<RpcOut>>(message: M): Promise<RpcResult<RpcOut, M>> {
		const requestId = this.pending.length;
		return new Promise<RpcResult<RpcOut, M>>(resolve => {
			this.pending[requestId] = resolve;
			this.webviewPanel.webview.postMessage({ ...message, requestId });
		});
	}

    protected postMessage(message: MessageOut) {
		this.webviewPanel.webview.postMessage(message);
	}

	abstract command(message: MessageIn): any;

}