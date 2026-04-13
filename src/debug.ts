import * as fs from './fs';
import {DebugProtocol} from '@vscode/debugprotocol';
import {Disposable, Uri, ExtensionContext, DebugSession, DebugAdapterTracker, EventEmitter, FileChangeType, FileType, FilePermission, TextDocumentContentProvider, workspace as vscodeWorkspace, debug as vscodeDebug} from 'vscode';

type Response<T extends DebugProtocol.Response> = Promise<T['body']>

export async function request(session: DebugSession, command: 'cancel',						args: DebugProtocol.CancelArguments):					Response<DebugProtocol.CancelResponse>;
export async function request(session: DebugSession, command: 'runInTerminal',				args: DebugProtocol.RunInTerminalRequestArguments):		Response<DebugProtocol.RunInTerminalResponse>;
export async function request(session: DebugSession, command: 'startDebugging',				args: DebugProtocol.StartDebuggingRequestArguments):	Response<DebugProtocol.StartDebuggingResponse>;
export async function request(session: DebugSession, command: 'initialize',					args: DebugProtocol.InitializeRequestArguments):		Response<DebugProtocol.InitializeResponse>;
export async function request(session: DebugSession, command: 'configurationDone',			args: DebugProtocol.ConfigurationDoneArguments):		Response<DebugProtocol.ConfigurationDoneResponse>;
export async function request(session: DebugSession, command: 'launch',						args: DebugProtocol.LaunchRequestArguments):			Response<DebugProtocol.LaunchResponse>;
export async function request(session: DebugSession, command: 'attach',						args: DebugProtocol.AttachRequestArguments):			Response<DebugProtocol.AttachResponse>;
export async function request(session: DebugSession, command: 'restart',					args: DebugProtocol.RestartArguments):					Response<DebugProtocol.RestartResponse>;
export async function request(session: DebugSession, command: 'disconnect',					args: DebugProtocol.DisconnectArguments):				Response<DebugProtocol.DisconnectResponse>;
export async function request(session: DebugSession, command: 'terminate',					args: DebugProtocol.TerminateArguments):				Response<DebugProtocol.TerminateResponse>;
export async function request(session: DebugSession, command: 'breakpointLocations',		args: DebugProtocol.BreakpointLocationsArguments):		Response<DebugProtocol.BreakpointLocationsResponse>;
export async function request(session: DebugSession, command: 'setBreakpoints',				args: DebugProtocol.SetBreakpointsArguments):			Response<DebugProtocol.SetBreakpointsResponse>;
export async function request(session: DebugSession, command: 'setFunctionBreakpoints',		args: DebugProtocol.SetFunctionBreakpointsArguments):	Response<DebugProtocol.SetFunctionBreakpointsResponse>;
export async function request(session: DebugSession, command: 'setExceptionBreakpoints',	args: DebugProtocol.SetExceptionBreakpointsArguments):	Response<DebugProtocol.SetExceptionBreakpointsResponse>;
export async function request(session: DebugSession, command: 'dataBreakpointInfo',			args: DebugProtocol.DataBreakpointInfoArguments):		Response<DebugProtocol.DataBreakpointInfoResponse>;
export async function request(session: DebugSession, command: 'setDataBreakpoints',			args: DebugProtocol.SetDataBreakpointsArguments):		Response<DebugProtocol.SetDataBreakpointsResponse>;
export async function request(session: DebugSession, command: 'setInstructionBreakpoints',	args: DebugProtocol.SetInstructionBreakpointsArguments):Response<DebugProtocol.SetInstructionBreakpointsResponse>;
export async function request(session: DebugSession, command: 'continue',					args: DebugProtocol.ContinueArguments):					Response<DebugProtocol.ContinueResponse>;
export async function request(session: DebugSession, command: 'next',						args: DebugProtocol.NextArguments):						Response<DebugProtocol.NextResponse>;
export async function request(session: DebugSession, command: 'stepIn',						args: DebugProtocol.StepInArguments):					Response<DebugProtocol.StepInResponse>;
export async function request(session: DebugSession, command: 'stepOut',					args: DebugProtocol.StepOutArguments):					Response<DebugProtocol.StepOutResponse>;
export async function request(session: DebugSession, command: 'stepBack',					args: DebugProtocol.StepBackArguments):					Response<DebugProtocol.StepBackResponse>;
export async function request(session: DebugSession, command: 'reverseContinue',			args: DebugProtocol.ReverseContinueArguments):			Response<DebugProtocol.ReverseContinueResponse>;
export async function request(session: DebugSession, command: 'restartFrame',				args: DebugProtocol.RestartFrameArguments):				Response<DebugProtocol.RestartFrameResponse>;
export async function request(session: DebugSession, command: 'goto',						args: DebugProtocol.GotoArguments):						Response<DebugProtocol.GotoResponse>;
export async function request(session: DebugSession, command: 'pause',						args: DebugProtocol.PauseArguments):					Response<DebugProtocol.PauseResponse>;
export async function request(session: DebugSession, command: 'stackTrace',					args: DebugProtocol.StackTraceArguments):				Response<DebugProtocol.StackTraceResponse>;
export async function request(session: DebugSession, command: 'scopes',						args: DebugProtocol.ScopesArguments):					Response<DebugProtocol.ScopesResponse>;
export async function request(session: DebugSession, command: 'variables',					args: DebugProtocol.VariablesArguments):				Response<DebugProtocol.VariablesResponse>;
export async function request(session: DebugSession, command: 'setVariable',				args: DebugProtocol.SetVariableArguments):				Response<DebugProtocol.SetVariableResponse>;
export async function request(session: DebugSession, command: 'source',						args: DebugProtocol.SourceArguments):					Response<DebugProtocol.SourceResponse>;
export async function request(session: DebugSession, command: 'threads'):																			Response<DebugProtocol.ThreadsResponse>;
export async function request(session: DebugSession, command: 'terminateThreads',			args: DebugProtocol.TerminateThreadsArguments):			Response<DebugProtocol.TerminateThreadsResponse>;
export async function request(session: DebugSession, command: 'modules',					args: DebugProtocol.ModulesArguments):					Response<DebugProtocol.ModulesResponse>;
export async function request(session: DebugSession, command: 'loadedSources',				args: DebugProtocol.LoadedSourcesArguments):			Response<DebugProtocol.LoadedSourcesResponse>;
export async function request(session: DebugSession, command: 'evaluate',					args: DebugProtocol.EvaluateArguments):					Response<DebugProtocol.EvaluateResponse>;
export async function request(session: DebugSession, command: 'setExpression',				args: DebugProtocol.SetExpressionArguments):			Response<DebugProtocol.SetExpressionResponse>;
export async function request(session: DebugSession, command: 'stepInTargets',				args: DebugProtocol.StepInTargetsArguments):			Response<DebugProtocol.StepInTargetsResponse>;
export async function request(session: DebugSession, command: 'gotoTargets',				args: DebugProtocol.GotoTargetsArguments):				Response<DebugProtocol.GotoTargetsResponse>;
export async function request(session: DebugSession, command: 'completions',				args: DebugProtocol.CompletionsArguments):				Response<DebugProtocol.CompletionsResponse>;
export async function request(session: DebugSession, command: 'exceptionInfo',				args: DebugProtocol.ExceptionInfoArguments):			Response<DebugProtocol.ExceptionInfoResponse>;
export async function request(session: DebugSession, command: 'readMemory',					args: DebugProtocol.ReadMemoryArguments):				Response<DebugProtocol.ReadMemoryResponse>;
export async function request(session: DebugSession, command: 'writeMemory',				args: DebugProtocol.WriteMemoryArguments):				Response<DebugProtocol.WriteMemoryResponse>;
export async function request(session: DebugSession, command: 'disassemble',				args: DebugProtocol.DisassembleArguments):				Response<DebugProtocol.DisassembleResponse>;
export async function request(session: DebugSession, command: 'locations',					args: DebugProtocol.LocationsArguments):				Response<DebugProtocol.LocationsResponse>;

export async function request(session: DebugSession, command:string, args?: any): Promise<any> {
	return session.customRequest(command, args);
}

//-----------------------------------------------------------------------------
//	DebugSession(s)
//-----------------------------------------------------------------------------

export const enum State {
	Inactive		= 0,
	Initializing	= 1,
	Stopped			= 2,
	Running			= 3
}

export class Session implements DebugAdapterTracker {
	static sessions: Record<string, Session> = {};

	private static _onCreate		= new EventEmitter<Session>();
	private static bpchange			= vscodeDebug.onDidChangeBreakpoints(event => {
		console.log(event);
	});

	static get onCreate()			{ return this._onCreate.event; }
	static get_wrapper(id: string)	{ return this.sessions[id]; }
	static get(id: string)			{ return this.sessions[id]?.session; }
	static get_caps(id: string)		{ return this.sessions[id]?.capabilities; }

	private _onMessage 				= new EventEmitter<any>();
	private _onDidChangeState		= new EventEmitter<number>();
	private _onDidInvalidateMemory	= new EventEmitter<DebugProtocol.MemoryEvent>();
	
	_state:		number = State.Inactive;
	threadId?:	number;
	frameId?:	Promise<number>;
	capabilities?: DebugProtocol.Capabilities;

	static register(context: ExtensionContext) {
		context.subscriptions.push(vscodeDebug.registerDebugAdapterTrackerFactory('*', {
			createDebugAdapterTracker: (session: DebugSession) => new Session(session)
		}));
	}

	constructor(public session: DebugSession) {
		Session.sessions[session.id] = this;
		Session._onCreate.fire(this);
	}

	set state(value: number) {
		//if (this._state !== value)
			this._onDidChangeState.fire((this._state = value));
	}

	get onMessage()				{ return this._onMessage.event; }
	get onDidChangeState()		{ return this._onDidChangeState.event; }
	get onDidInvalidateMemory() { return this._onDidInvalidateMemory.event; }

	onExit(_code: number | undefined, _signal: string | undefined) {
		delete Session.sessions[this.session.id];
	}
	onWillStartSession() {
		this.state = State.Initializing;
	}
	onWillStopSession?() {
		this.state = State.Inactive;
	}

	//	onWillReceiveMessage?(message: any): void;

	onDidSendMessage(message: DebugProtocol.ProtocolMessage): void {
		this._onMessage.fire(message);
		
		switch (message.type) {
			case "response": {
				const response = message as DebugProtocol.Response;
				switch (response.command) {
					case "initialize":
						this.capabilities = (response as DebugProtocol.InitializeResponse).body;
						break;
					//case "stackTrace":
					//	this.frameId = ((response as DebugProtocol.StackTraceResponse).body).stackFrames[0].id;
					//	break;
				}
				break;
			}

			case "event":{
				const event = message as DebugProtocol.Event;
				switch (event.event) {
					case "initialized":
						//this.state = State.Inactive;
						break;
					case "stopped":
						this.threadId = (event as DebugProtocol.StoppedEvent).body.threadId;
						this.frameId = request(this.session, 'stackTrace', { threadId: this.threadId ?? 0 }).then(resp => resp.stackFrames[0].id);
						this.state = State.Stopped;
						break;
					case "continued":
						this.state = State.Running;
						break;
					case "memory":
						this._onDidInvalidateMemory.fire(event as DebugProtocol.MemoryEvent);
						break;
				}
				break;
			}
		}
	}
}

export function getTopStackFrameId(session: DebugSession) {
	return Session.get_wrapper(session.id).frameId;
//	const resp = await request(session, 'stackTrace', { threadId: 0 });
//	return resp.stackFrames[0].id;
}

//-----------------------------------------------------------------------------
//	FileSystems
//-----------------------------------------------------------------------------

class MemoryFile implements fs.File {
	constructor(public session: DebugSession, public memoryReference: string) {}

	public dispose() {}

	public async read(pos: number, length: number): Promise<Uint8Array> {
		const resp = await request(this.session, 'readMemory', {
			memoryReference: this.memoryReference,
			offset: pos,
			count: length,
		});
		return resp?.data
			? new Uint8Array(Buffer.from(resp.data, 'base64'))
			: new Uint8Array(0);
	}

	public async write(pos: number, data: Uint8Array): Promise<number> {
		const resp = await request(this.session, 'writeMemory', {
			memoryReference: this.memoryReference,
			offset: pos,
			data: Buffer.from(data).toString('base64')
		});
		return resp?.bytesWritten ?? 0;
	}
}

export class MemoryFileSystem extends fs.BaseFileSystem {
	static SCHEME = 'modules-debug-memory';

	static makeUri(session: DebugSession, memoryReference: string, range?: fs.FileRange, displayName = 'memory') {
		return Uri.from({
			scheme: this.SCHEME,
			authority: session.id,
			path: `/${encodeURIComponent(memoryReference)}/${encodeURIComponent(displayName)}`,
			query: range ? `?range=${range.fromOffset}:${range.toOffset}` : undefined,
		});
	}

	static getSessionWrapper(uri: Uri) {
		const session = Session.get_wrapper(uri.authority);
		if (!session)
			throw 'Debug session not found';
		return session;
	}
	static getSession(uri: Uri) {
		const session = Session.get_wrapper(uri.authority)?.session ?? vscodeDebug.activeDebugSession;
		if (!session)
			throw 'Debug session not found';
		return session;
	}

	static parseUri(uri: Uri) {
		const rangeMatch		= /range=([0-9]+):([0-9]+)/.exec(uri.query);
		const offset 			= rangeMatch ? { fromOffset: Number(rangeMatch[1]), toOffset: Number(rangeMatch[2]) } : undefined;
		const memoryReference	= decodeURIComponent(uri.path.split('/')[1]);

		return {
			offset,
			readOnly: Session.get_caps(uri.authority)?.supportsWriteMemoryRequest,
			memoryReference,
		};
	}

	constructor(context: ExtensionContext) {
		super(context, MemoryFileSystem.SCHEME);
	}

	openFile(uri: Uri): MemoryFile {
		const session = MemoryFileSystem.getSession(uri);
		const { memoryReference } = MemoryFileSystem.parseUri(uri);
		return new MemoryFile(session, memoryReference);
	}
	
	watch(uri: Uri, options: { readonly recursive: boolean; readonly excludes: readonly string[]; }) {
		if (options.recursive)
			return new Disposable(()=>{});

		const session = MemoryFileSystem.getSessionWrapper(uri);
		const { memoryReference, offset } = MemoryFileSystem.parseUri(uri);

		return Disposable.from(
			session.onDidChangeState(state => {
				if (state === State.Running || state === State.Inactive)
					this._onDidChangeFile.fire([{ type: FileChangeType.Deleted, uri}]);
			}),
			session.onDidInvalidateMemory(e => {
				if (e.body.memoryReference === memoryReference && (!offset || (e.body.offset < offset.toOffset && e.body.offset + e.body.count >= offset.fromOffset)))
					this._onDidChangeFile.fire([{type: FileChangeType.Changed, uri}]);
			})
		);
	}

	stat(uri: Uri) {
		const { readOnly, offset } = MemoryFileSystem.parseUri(uri);
		return Promise.resolve({
			type: FileType.File,
			mtime: 0,
			ctime: 0,
			size: offset ? offset.toOffset - offset.fromOffset : 0x10000,
			permissions: readOnly ? FilePermission.Readonly : undefined,
		});
	}

	async readFile(uri: Uri) {
		const session = MemoryFileSystem.getSession(uri);
		const { memoryReference, offset } = MemoryFileSystem.parseUri(uri);
		if (!offset)
			throw `Range must be present to read a file`;

		const file = new MemoryFile(session, memoryReference);
		try {
			return await file.read(offset.fromOffset, offset.toOffset - offset.fromOffset);
		} finally {
			file.dispose();
		}
	}

	async writeFile(uri: Uri, content: Uint8Array) {
		const session = MemoryFileSystem.getSession(uri);
		const { memoryReference, offset } = MemoryFileSystem.parseUri(uri);
		if (!offset)
			throw `Range must be present to read a file`;

		const file = new MemoryFile(session, memoryReference);
		try {
			await file.write(offset.fromOffset, content);
		} finally {
			file.dispose();
		}
	}
}

//-----------------------------------------------------------------------------
//	uri schema
//-----------------------------------------------------------------------------

export class MemorySchema {
	static SCHEME = 'vscode-debug-memory';

	static makeUri(session: DebugSession, memoryReference: string, range?: fs.FileRange, displayName = 'memory') {
		return Uri.from({
			scheme: MemorySchema.SCHEME,
			authority: session.id,
			path: `/${encodeURIComponent(memoryReference)}/${encodeURIComponent(displayName)}`,
			query: range ? `?range=${range.fromOffset}:${range.toOffset}` : undefined,
		});
	}
}

export class SourceProvider implements TextDocumentContentProvider {
	static SCHEME = 'vscode-debug-source';

	static makeUri(session: DebugSession, sourceReference: number, displayName = 'memory') {
		return Uri.from({
			scheme: this.SCHEME,
			authority: session.id,
			path: `/${sourceReference}/${encodeURIComponent(displayName)}`,
		});
	}

	constructor(context: ExtensionContext) {
		context.subscriptions.push(vscodeWorkspace.registerTextDocumentContentProvider(SourceProvider.SCHEME, this));
	}

	async provideTextDocumentContent(uri: Uri) {
		const parts		= uri.path.split('/');
		const sourceReference = +parts[1];
		const session	= Session.get(uri.authority);
		return session && (await request(session, 'source', {sourceReference})).content;
	}
}
