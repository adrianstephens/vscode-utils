import * as vscode from 'vscode';
export type * from './webview/shared';

interface Command    {command: string, [key: string]: any};
interface Request<M> {command: string, [key: string]: any, result: M};
interface Result<M>  {resultId: number, result: M};

export abstract class Panel<MessageIn extends Command, MessageOut, MessageRpc extends Request<any> = never> {
	private pending: ((message:any)=>void)[] = [];
    constructor(public readonly webviewPanel: vscode.WebviewPanel) {
		const webview = webviewPanel.webview;

        webview.onDidReceiveMessage(async (message: Result<any> | MessageIn) => {
            if ('resultId' in message) {
                const resolve = this.pending[message.resultId];
                if (resolve) {
                    delete this.pending[message.resultId];
                    resolve(message.result);
                }
                return;
			}
            this.command(message);
		});
    }
/*
	protected async rpc1<C extends MessageRpc['command']>(message: Omit<Extract<MessageRpc, {command: C}>, 'result' | 'requestId'>) {
		const requestId = this.pending.length;
		return new Promise<Extract<MessageRpc, {command: C}>['result']>(resolve => {
			this.pending[requestId] = resolve;
			this.webviewPanel.webview.postMessage({...message, requestId});
		});
	}
*/
//	protected async rpc<M extends Request<any>>(message: Omit<M, 'result' | 'requestId'>) {
	protected async rpc<M extends MessageRpc>(message: Omit<M, 'result' | 'requestId'>) {
		const requestId = this.pending.length;
		return new Promise<M['result']>(resolve => {
			this.pending[requestId] = resolve;
			this.webviewPanel.webview.postMessage({...message, requestId});
		});
	}

    protected postMessage(message: MessageOut) {
		this.webviewPanel.webview.postMessage(message);
	}

    abstract command(message: MessageIn): void;

}