/** @jsxImportSource . */

//import * as vscode from 'vscode';
import {Uri, Webview} from 'vscode';

export function jsx(type: any, props: any) {
	return typeof type === 'function'
        ? type(props)
		: {type, props};
}
export function jsxs(type: any, props: any) {
	return typeof type === 'function'
        ? type(props)
		: {type, props};
}

export function jsxFrag(props: any) {
	return {props};
}

//-----------------------------------------------------------------------------
//	render
//-----------------------------------------------------------------------------

function renderProps(props: any): string {
    return Object.entries(props)
        .filter(([key, value]) => key !== 'children' && value !== undefined)
        .map(([key, value]) => ` ${key}="${escape(String(value))}"`)
        .join('');
}

const escaped: Record<string, string> = {
	'\\': '\\\\',
	'&': '&amp;',
	'<': '&lt;',
	'>': '&gt;',
	'"': '&quot;',
};

function escape(v: string) {
	return v.replace(/[\\&<>"]/g, match => escaped[match]);
}


// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace JSX {
	export interface Element {
        type:	string;
        props:	any;
    }
	export interface IntrinsicElements {
		[elemName: string]: any;
	}
	export function render(element: any): string {
		if (typeof element === 'string')
			return element.replace(/[\\&<>]/g, match => escaped[match]);
	
		if (typeof element === 'number')
			return element.toString();
		
		if (!element)
			return '';
	
		const { type, props } = element;
		const children = props.children;
		const renderedChildren = Array.isArray(children)
			? children.flat().map(child => render(child)).join('')
			: render(children);
		
		return type
			? `<${type}${renderProps(props)}>${renderedChildren}</${type}>`
			: renderedChildren;
	}
}

//-----------------------------------------------------------------------------
//	helpers
//-----------------------------------------------------------------------------

export function id_selector(id: string | number) {
	if (typeof id === 'number')
		return `[id="${id}"]`;

	id = id.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	return id[0] >= '0' && id[0] <= '9' ? `[id="${id}"]` : `#${id}`;
}

export function Label({id, display, title}: {id: string, display: string, title?: string}) {
	return <label for={id} title={title}>{display}</label>;
}

//-----------------------------------------------------------------------------
//	CSP
//-----------------------------------------------------------------------------

export class Hash {
	constructor(public algorithm: string, public value: string) {}
	toString() { return this.value; }
	toValue() { return `'${this.algorithm}-${this.value}'`; }
}

export function Nonce() {
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	return new Hash('nonce', Array.from({length: 32}, () => possible.charAt(Math.floor(Math.random() * possible.length))).join(''));
}

const CSPkeywords = {
	self:						"'self'",
	unsafe_inline:				"'unsafe-inline'",
	unsafe_eval:				"'unsafe-eval'",
	wasm_unsafe_eval:			"'wasm-unsafe-eval'",
	unsafe_hashes:				"'unsafe-hashes'",
	inline_speculation_rules:	"'inline-speculation-rules'",
	strict_dynamic:				"'strict-dynamic'",
} as const;

type CSPSource1 = Hash
	|Uri
	|(typeof CSPkeywords)[keyof typeof CSPkeywords]
	|CSPSource1[];

interface plus<T> 	{source: T, plus: boolean};
function plus(source: CSPSource1): plus<CSPSource1>		{ return {source, plus: true}; }
type CSPSource = CSPSource1 | plus<CSPSource1>;

interface CSPSources {
	main:	CSPSource,
	attr?:	CSPSource,
	elem?:	CSPSource
};

export function CSPdefault(extension: Uri): CSPSource1 {
	const result: CSPSource1[] = [CSP.self, Uri.parse('https://*.vscode-cdn.net')];
	if (extension.scheme === 'https' || extension.scheme === 'http')
		result.push(extension);	// if the extension is being served up from a CDN also include the CDN in the default csp
	return result;
}

function CSPFunction({csp, ...others}: {csp: CSPSource1, script?: CSPSource | CSPSources, style?: CSPSource | CSPSources, font?: CSPSource, img?: CSPSource, media?: CSPSource}) {
	const val = (v: CSPSource1): string => 
		  v instanceof Array ? v.map(v => val(v)).join(' ')
		: v instanceof Uri ? v.toString(true)
		: v instanceof Hash ? v.toValue()
		: /*typeof v === 'string' ? `'${v}` :*/ v.toString();

	const resolve = (v: CSPSource, parent: CSPSource1): CSPSource1 => {
		if (typeof v === 'object' && ('plus' in v))
			return parent instanceof Array ? [...parent, v.source] : [parent, v.source];
		return v;
	};

	const sources = (k: string, v: CSPSource | CSPSources, parent: CSPSource1): string => {
		if (typeof v === 'object' && 'main' in v) {
			parent = resolve(v.main, parent);
			return `${k}-src ${val(parent)};`
				+ (v.attr ? `${k}-src-attr ${val(resolve(v.attr, parent))};` : '')
				+ (v.elem ? `${k}-src-elem ${val(resolve(v.elem, parent))};` : '');
		} else {
			return `${k}-src ${val(resolve(v, parent))};`;
		}
	};

	return <meta http-equiv="Content-Security-Policy" content={
		`default-src ${val(csp)}; ${Object.entries(others).map(([k, v]) => sources(k, v, csp)).join('')}`
	}/>;
}

export const CSP = Object.assign(CSPFunction, CSPkeywords);

export function ImportMap(props: {map: Record<string, Uri>, webview: Webview, nonce?: Hash}) {
	return <script type="importmap" nonce={props.nonce?.value}>{
		`{ "imports": { ${Object.entries(props.map).map(([k, v]) => `"${k}": "${props.webview.asWebviewUri(v)}"`).join(',')} } }`
	}</script>;
}
