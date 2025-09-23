import * as nodefs from 'fs';
import * as path from 'path';
import {Uri, Disposable, ExtensionContext, EventEmitter, FileType, FilePermission, FileStat, workspace as vscodeWorkspace, FileChangeEvent, FileSystemProvider, FileSystemWatcher, RelativePattern} from 'vscode';

export type Filename = string | Uri;
export interface FileRange { fromOffset: number; toOffset: number; }

function uri(value: Filename) : Uri {
	return value instanceof Uri ? value : Uri.file(value);
}

function file(value: Filename) : string {
	return value instanceof Uri ? value.fsPath : value;
}

function file_id(value: Filename) : string {
	return typeof(value) === 'string' ? value : value.scheme === 'file' ? value.fsPath : value.toString();
}

function basename(value: Filename) : string {
	return path.basename(file(value));
}
function ext(value: Filename) : string {
	return path.extname(file(value));
}
function dirname(value: Filename) : string {
	return path.dirname(file(value));
}

function pathComponents(value: Filename) {
	return path.parse(file(value));
}

function withPathComponents(value: Filename, ...comp: string[]) : Filename {
	const p = path.join(...comp);
	return value instanceof Uri ? value.with({path: p}) : p;
}

function join(directory: Filename, ...comp: string[]) : Filename {
	return withPathComponents(directory, file(directory), ...comp);
}

//-----------------------------------------------------------------------------
//	FileSystems
//-----------------------------------------------------------------------------

export interface File {
	dispose(): void;
	read(pos: number, length: number): Promise<Uint8Array>;
	write(pos: number, data: Uint8Array): Promise<number>;
}

export function isFile(obj: any): obj is File {
	return obj && typeof obj.dispose === 'function' && typeof obj.read === 'function' && typeof obj.write === 'function';
}

interface FileSystem extends FileSystemProvider {
	openFile(uri: Uri): File | Promise<File>;
}
const filesystems: Record<string,FileSystem> = {};

export abstract class BaseFileSystem implements FileSystem {
	protected _onDidChangeFile = new EventEmitter<FileChangeEvent[]>();

    constructor(context: ExtensionContext, scheme: string) {
        filesystems[scheme] = this;
		context.subscriptions.push(vscodeWorkspace.registerFileSystemProvider(scheme, this, { isCaseSensitive: true }));
    }

	get onDidChangeFile() { return this._onDidChangeFile.event; }
	
    // Abstract method that must be implemented
    abstract openFile(uri: Uri): File | Promise<File>;
    abstract readFile(uri: Uri): Uint8Array | Thenable<Uint8Array>;

	//stubs
	watch(_uri: Uri, _options: { readonly recursive: boolean; readonly excludes: readonly string[]; }): Disposable { throw 'not implemented'; }
	stat(_uri: Uri): FileStat | Thenable<FileStat> { throw 'not implemented'; }
	readDirectory(_uri: Uri): [string, FileType][] { throw 'not implemented'; }
	createDirectory(_uri: Uri)  { throw 'not implemented'; }
	writeFile(_uri: Uri, _content: Uint8Array, _options: { readonly create: boolean; readonly overwrite: boolean; })  { throw 'not implemented'; }
	delete(_uri: Uri, _options: { readonly recursive: boolean; }): void  { throw 'not implemented'; }
	rename(_oldUri: Uri, _newUri: Uri, _options: { readonly overwrite: boolean; })  { throw 'not implemented'; }
}

export function withOffset(file: File, offset: FileRange) : File;
export function withOffset(file: Uri, offset: FileRange): Uri;
export function withOffset(file: File|Uri, offset: FileRange) : File | Uri {
	if (file instanceof Uri)
		return SubfileFileSystem.makeUri(file, offset);

	return new class implements File {
		length = offset.toOffset - offset.fromOffset;
		dispose() { file.dispose(); }
		read(pos: number, length: number) {
			const start = pos + offset.fromOffset;
			const end	= Math.min(start + length, offset.toOffset);
			return file.read(start, end - start);
		}
		write(pos: number, data: Uint8Array) {
			const start = pos + offset.fromOffset;
			const end	= Math.min(start + data.length, offset.toOffset);
			return file.write(start, data.subarray(0, end - start));
		}
	};
}

export function openFile(uri: Uri) {
	switch (uri.scheme) {
		case 'file':
			return NormalFile.open(uri);
		default:
			return filesystems[uri.scheme]?.openFile(uri);
	}
}

export class NormalFile implements File {
	constructor(public fd:number) {}

	static open(uri: Uri) {
		return new Promise<NormalFile>((resolve, reject) => {
			nodefs.open(uri.fsPath, 'r', (err, fd) => {
				if (err)
					reject(err);
				else
					resolve(new NormalFile(fd));
			});
		});
	}
	dispose()	{
		nodefs.close(this.fd);
	}
	read(pos: number, length: number) {
		return new Promise<Uint8Array>((resolve, reject) => {
			const buffer = Buffer.alloc(length);
			nodefs.read(this.fd, buffer, 0, length, pos, (err, bytesRead, buffer) => {
				if (err)
					reject(err);
				else
					resolve(new Uint8Array(buffer));
			});
		});
	}
	write(pos: number, data: Uint8Array): Promise<number> {
		return new Promise<number>((resolve, reject) => {
			nodefs.write(this.fd, data, 0, data.length, pos, (err, bytesWritten) => {
				if (err)
					reject(err);
				else
					resolve(bytesWritten);
			});
		});
	}
}

function getEncapsulatedUri(uri: Uri) {
	return uri.with({
		scheme: uri.authority,
		authority: '',
	});
//	return Uri.parse(uri.fsPath);
}

export class ReadOnlyFilesystem extends BaseFileSystem {
	static SCHEME = 'readonly';

	constructor(context: ExtensionContext) {
		super(context, ReadOnlyFilesystem.SCHEME);
	}
	async stat(uri: Uri) {
		return {...await vscodeWorkspace.fs.stat(getEncapsulatedUri(uri)), permissions: FilePermission.Readonly};
	}
	openFile(uri: Uri) {
		return openFile(getEncapsulatedUri(uri));
	}
	readFile(uri: Uri) {
		return vscodeWorkspace.fs.readFile(getEncapsulatedUri(uri));
	}
}

export class SubfileFileSystem extends BaseFileSystem {
	static SCHEME = 'subfile';

	static makeUri(uri: Uri, offset: FileRange) {
		return uri.with({
			scheme: 'subfile',
			authority: uri.scheme,
			fragment: `${offset.fromOffset};${offset.toOffset}`
		});
	}
	static parseUri(uri: Uri) {
		const parts = uri.fragment.split(';');
		return {
			uri:	getEncapsulatedUri(uri),
			offset: {fromOffset: +parts[0], toOffset: +parts[1]}
		};
	}
	
	constructor(context: ExtensionContext) {
		super(context, SubfileFileSystem.SCHEME);
	}

	async stat(uri: Uri) {
		const { uri: uri2, offset } = SubfileFileSystem.parseUri(uri);
		return {...await vscodeWorkspace.fs.stat(uri2), size: offset.toOffset - offset.fromOffset};
	}

	async readFile(uri: Uri) {
		const { uri: uri2, offset } = SubfileFileSystem.parseUri(uri);
		const file = await openFile(uri2);
		if (file) {
			try {
				return file.read(offset.fromOffset, offset.toOffset - offset.fromOffset);
			} finally {
				file.dispose();
			}
		} else {
			const data = await vscodeWorkspace.fs.readFile(uri2);
			return data.subarray(offset.fromOffset, offset.toOffset);
		}
	}
	async openFile(uri: Uri) {
		const { uri: uri2, offset } = SubfileFileSystem.parseUri(uri);
		return withOffset(await openFile(uri2), offset);
	}
}

//-----------------------------------------------------------------------------
//	Glob
//-----------------------------------------------------------------------------

export class Glob {
	private readonly regexp: RegExp;

	constructor(pattern: string | string[]) {
		if (typeof pattern === 'string' && pattern.includes(';'))
			pattern = pattern.split(';');
		const re = Array.isArray(pattern)
			? '(' + pattern.map(s => toRegExp(s)).join('|') + ')'
			: toRegExp(pattern);
		this.regexp = new RegExp(re + '$');
	}
	public test(input: string): boolean {
		return this.regexp?.test(input) ?? false;
	}
}

export function toOSPath(input: string | undefined): string {
	if (!input)
		return '';
	return input
		.replace(/\\/g, path.sep)
		.trim();
		//.replace(new RegExp(`${path.sep}$`), '');
}
function toRegExp(pattern: string) {
	let re = "", range = false, block = false;
	for (let i = 0; i < pattern.length; i++) {
		const c = pattern[i];
		switch (c) {
			default:	re += c; break;
			case ".":
			case "/":
			case "\\":
			case "$":
			case "^":	re += "\\" + c; break;
			case "?":	re += "."; break;
			case "[":	re += "["; range = true; break;
			case "]":	re += "]"; range = false; break;
			case "!":	re += range ? "^" : "!"; break;
			case "{":	re += "("; block = true; break;
			case "}":	re += ")"; block = false; break;
			case ",":	re += block ? "|" : "\\,"; break;
			case "*":
				if (pattern[i + 1] === "*") {
					re += ".*";
					i++;
					if (pattern[i + 1] === "/" || pattern[i + 1] === "\\")
						i++;
				} else {
					re += "[^/\\\\]*";
				}
				break;
		}
	}
	return re;
}

//-----------------------------------------------------------------------------
//	directory
//-----------------------------------------------------------------------------

export type Entry = [string, FileType];

export function readDirectory(dir: Filename) : Thenable<Entry[]> {
	return vscodeWorkspace.fs.stat(uri(dir)).then(stat => {
		if (stat.type == FileType.Directory) {
			return vscodeWorkspace.fs.readDirectory(uri(dir)).then(
				items => items,
				error => {
					console.log(`readDirectory failed with ${error}`);
					return [];
				}
			);
		} else {
			console.log(`readDirectory ${dir} is not a directory`);
			return Promise.resolve([]);
		}
	}, error => {
		console.log(`readDirectory failed with ${error}`);
		return Promise.resolve([]);
	});
}

export function directories(entries: Entry[]) {
	return entries.filter(e => e[1] == FileType.Directory).map(e => e[0]);
}
export function files(entries: Entry[], glob?: string|Glob) {
	if (glob) {
		const include = typeof glob === 'string' ? new Glob(glob) : glob;
		return entries.filter(e => e[1] == FileType.File && include.test(e[0])).map(e => e[0]);
	} else {
		return entries.filter(e => e[1] == FileType.File).map(e => e[0]);
	}
}

export async function search(pattern: string, _exclude?:string | string[], want = FileType.Unknown): Promise<string[]> {
	const m = /[*?[{}]/.exec(pattern);
	if (!m)
		return [pattern];

	const sep 		= pattern.lastIndexOf('\\', m.index);
	const basePath	= pattern.substring(0, sep);
	const include	= new Glob(pattern.substring(sep + 1));
	const exclude	= _exclude ? new Glob(_exclude) : undefined;
	const keep		= want || FileType.File;

	const recurse = async (basePath: string) => {
		const items = await readDirectory(basePath);
		const result: string[] = [];
		for (const i of items) {
			if (want && i[1] !== want)
				continue;

			const filename = path.join(basePath, i[0]);
			if (exclude && exclude.test(filename))
				continue;

			if (i[1] === keep && include.test(filename))
				result.push(filename);

			if (i[1] == FileType.Directory)
				result.push(...await recurse(filename));

		}
		return result;
	};
	return recurse(basePath);
}

export async function mapDirs<T>(root: string, glob: string|Glob, onFile:(filename:string)=>T, combine:(...results:T[])=>T) : Promise<T> {
	const glob2 = typeof glob === 'string' ? new Glob(glob) : glob;
	return readDirectory(root).then(async dir => combine(
		...await Promise.all(files(dir, glob).map(i => onFile(path.join(root, i)))),
		...await Promise.all(directories(dir).map(async i => mapDirs<T>(path.join(root, i), glob2, onFile, combine)))
	
	));
}

//-----------------------------------------------------------------------------
//	helpers
//-----------------------------------------------------------------------------

export function stat_reject(value: Filename) {
	return vscodeWorkspace.fs.stat(uri(value));
}

export function exists(value: Filename): Thenable<boolean> {
	return vscodeWorkspace.fs.stat(uri(value)).then(
		() => true,
		() => false
	);
}

export function getStat(value: Filename): Thenable<FileStat | undefined> {
	return vscodeWorkspace.fs.stat(uri(value)).then(stat => stat, () => undefined);
}

export function isDirectory(value: Filename): Thenable<boolean> {
	return vscodeWorkspace.fs.stat(uri(value)).then(stat => stat.type == FileType.Directory, () => ext(value) === "");
}

export async function loadFile(file: Filename): Promise<Uint8Array|void> {
	return vscodeWorkspace.fs.readFile(uri(file)).then(
		bytes	=> bytes,
		error	=> console.log(`Failed to load ${file} : ${error}`)
	);
}

export function writeFile(file: Filename, bytes: Uint8Array) {
	return vscodeWorkspace.fs.writeFile(uri(file), bytes).then(
		()		=> true,
		error	=> (console.log(`Failed to save ${file} : ${error}`), false)
	);
}

export function deleteFile(file: Filename) {
	return vscodeWorkspace.fs.delete(uri(file)).then(
		()		=> true,
		error	=> (console.log(`Failed to delete ${file} : ${error}`), false)
	);
}
export function createDirectory(path: Filename) {
	return vscodeWorkspace.fs.createDirectory(uri(path)).then(
		()		=> true,
		error	=> (console.log(`Failed to create ${path} : ${error}`), false)
	);
}

//-----------------------------------------------------------------------------
//	copy file/dir
//-----------------------------------------------------------------------------

export async function createNewName(filepath: string): Promise<string>;
export async function createNewName(filepath: Uri): Promise<Uri>;
export async function createNewName(filepath: Filename): Promise<Filename> {
	const parsed = pathComponents(filepath);
	let counter = 0;
	const m = /\d+$/.exec(parsed.name);
	if (m) {
		counter = parseInt(m[0]);
		parsed.name = parsed.name.substring(0, m.index);
	}

	while (await exists(filepath))
		filepath = withPathComponents(filepath, parsed.dir, `${parsed.name}${++counter}${parsed.ext}`);
	return filepath;
}

async function createCopyName(filepath: Filename): Promise<Filename> {
	const parsed = pathComponents(filepath);
	let counter = 1;
	while (await exists(filepath)) {
		filepath = withPathComponents(filepath, parsed.dir, `${parsed.name} copy${(counter > 1 ? ' ' + counter : '')}${parsed.ext}`);
		counter++;
	}
	return filepath;
}

export async function copyFile(sourcepath: string, destpath: string): Promise<void> {
	return vscodeWorkspace.fs.readFile(uri(sourcepath)).then(async bytes => vscodeWorkspace.fs.writeFile(uri(destpath), bytes));
}

export async function copyFileToDir(sourcepath: Filename, destdir: Filename): Promise<Filename> {
	const dest		= createCopyName(join(destdir, basename(sourcepath)));
	const bytes 	= await vscodeWorkspace.fs.readFile(uri(sourcepath));
	const destpath	= await dest;
	vscodeWorkspace.fs.writeFile(uri(destpath), bytes);
	return destpath;
}

export async function copyDirectory(sourcepath: Filename, targetpath: Filename): Promise<Filename[]> {
	const dest = createCopyName(join(targetpath, basename(sourcepath)));
	const dir = await readDirectory(sourcepath);

	let result: Filename[] = [];
	for (const i of dir) {
		const sourcepath2 = join(sourcepath, i[0]);
		if (i[1] === FileType.Directory)
			result = [...result, ...await copyDirectory(sourcepath2, await dest)];
		else
			result.push(await copyFileToDir(sourcepath2, await dest));
	}
	return result;
}

//-----------------------------------------------------------------------------
//	watchers
//-----------------------------------------------------------------------------

export const Change = {
	changed:	0,
	created:	1,
	deleted:	2,
	renamed:	3,
} as const;

type Callback		= (path: string, mode: number)=>void;
type GlobCallback	= [Glob, Callback];

const recWatchers:		Record<string, FileSystemWatcher> = {};
const dirWatchers:		Record<string, FileSystemWatcher> = {};
const fileModTimes:		Record<number, string> = {};
const recCallbacks:		Record<string, Callback[]> = {};
const dirCallbacks:		Record<string, GlobCallback[]> = {};
const fileCallbacks:	Record<string, Callback[]> = {};

let wait_create: Thenable<void> = Promise.resolve();


function runCallbacks(callbacks: Callback[]|undefined, id: string, mode:number) {
	if (callbacks)
		callbacks.forEach(func => func(id, mode));
}

function runGlobCallbacks(callbacks: GlobCallback[]|undefined, id: string, mode:number) {
	if (callbacks) {
		const base = path.basename(id);
		callbacks.forEach(func => func[0].test(base) && func[1](id, mode));
	}
}

async function dirCallback(uri: Uri, mode:number) {
	const id = file_id(uri);
	switch (mode) {
		case Change.changed:
			if (fileCallbacks[id] && await stat_reject(uri).then(
				stat => {
					if (fileModTimes[stat.mtime] === id)
						return false;
					fileModTimes[stat.mtime] = id;
					return true;
				},
				_ => true
			)) {
				console.log(`Changed: ${uri}`);
				runCallbacks(fileCallbacks[id], id, mode);
			}
			break;

		case Change.created:
			console.log(`Created: ${uri}`);
			wait_create = wait_create.then(() => stat_reject(uri).then(
				stat => {
					const _renamed = fileModTimes[stat.mtime];
					if (_renamed) {
						const renamed = file_id(_renamed);
						console.log(`Rename: ${renamed} to ${uri}`);
						fileModTimes[stat.mtime] = id;
						fileCallbacks[id] = fileCallbacks[renamed];
						delete fileCallbacks[renamed];
						runCallbacks(fileCallbacks[id], id, 3);
					}
				},
				_ => {}
			));
			break;

		case Change.deleted:
			console.log(`Deleted: ${uri}`);
			wait_create.then(() => runCallbacks(fileCallbacks[id], id, mode));
			break;
	}
	runGlobCallbacks(dirCallbacks[dirname(uri)], id, mode);
}

function recCallback(uri: Uri, mode:number) {
	const id = file_id(uri);
	fileCallbacks[id]?.forEach(func => func(id, mode));
	runGlobCallbacks(dirCallbacks[dirname(uri)], id, mode);
	for (const i in recCallbacks) {
		if (id.startsWith(i))
			runCallbacks(recCallbacks[i], id, mode);
	}
}

export function onChange(filename: Filename, func: (path: string, mode: number)=>void) {
	const	fulluri	= uri(filename);
	let		dir 	= dirname(filename);
	const 	rec		= dir.indexOf('*');

	if (rec !== -1)
		dir = dir.substring(0, rec - 1);

	let		watcher	= rec === -1 ? dirWatchers[dir] : recWatchers[dir];
	if (!watcher && !Object.keys(recWatchers).some(i => dir.startsWith(i))) {
		if (rec >= 0) {
			for (const i in dirWatchers) {
				if (i.startsWith(dir)) {
					dirWatchers[i].dispose();
					delete dirWatchers[i];
				}
			}
			watcher 	= vscodeWorkspace.createFileSystemWatcher(new RelativePattern(withPathComponents(fulluri, dir), "**/*.*"));
			watcher.onDidChange((uri: Uri) => recCallback(uri, Change.changed));
			watcher.onDidCreate((uri: Uri) => recCallback(uri, Change.created));
			watcher.onDidDelete((uri: Uri) => recCallback(uri, Change.deleted));
			recWatchers[dir] = watcher;
		} else {
			watcher	= vscodeWorkspace.createFileSystemWatcher(new RelativePattern(withPathComponents(fulluri, dir), "*.*"));
			watcher.onDidChange((uri: Uri) => dirCallback(uri, Change.changed));
			watcher.onDidCreate((uri: Uri) => dirCallback(uri, Change.created));
			watcher.onDidDelete((uri: Uri) => dirCallback(uri, Change.deleted));
			dirWatchers[dir] = watcher;
		}
	}

	if (rec >= 0) {
		//recursive
		(recCallbacks[dir] ??= []).push(func);
	} else if (basename(filename).indexOf('*') >= 0) {
		//directory
		(dirCallbacks[dir] ??= []).push([new Glob(basename(filename)), func]);
	} else {
		//file
		stat_reject(filename).then(
			stat => fileModTimes[stat.mtime] = file_id(filename),
			_ => {}
		);
		(fileCallbacks[filename.toString()] ??= []).push(func);

	}
}

export function array.remove<T>(array: T[], item: T) {
	const index = array.indexOf(item);
	if (index === -1)
		return false;
	array.splice(index, 1);
	return true;
}

export function removeOnChange(filename: Filename, func: (path: string)=>void) {
	const dir = dirname(filename);
	if (dir.indexOf('*') >= 0) {
		//recursive
		const callbacks = recCallbacks[dir];
		if (callbacks) {
			array.remove(callbacks, func);
			if (callbacks.length === 0) {
				delete recCallbacks[dir];
				const watcher = recWatchers[dir];
				if (watcher) {
					watcher.dispose();
					delete recWatchers[dir];
				}
			}
		}
	} else {
		if (basename(filename).indexOf('*') === -1) {
			//file
			const callbacks = fileCallbacks[filename.toString()];
			if (callbacks) {
				array.remove(callbacks, func);
				if (callbacks.length)
					return;
				delete fileCallbacks[filename.toString()];
			}
		}
		//directory
		const callbacks = dirCallbacks[dir];
		if (callbacks) {
			const i = callbacks.findIndex(i => i[1] === func);
			if (i !== -1) {
				callbacks.splice(i, 1);
				if (callbacks.length)
					return;
				delete dirCallbacks[dir];
				const watcher = dirWatchers[dir];
				if (watcher) {
					watcher.dispose();
					delete dirWatchers[dir];
				}
			}
		}
	}
}
