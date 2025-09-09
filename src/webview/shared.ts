/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

//console.log("Hello from shared.ts!");

declare function acquireVsCodeApi(): {
    postMessage: (message: any) => void;
    getState: () => any;
    setState: (state: any) => void;
};

export const vscode		= acquireVsCodeApi();

export function fixupElements(root: ParentNode) {
	//fix up icons in attributes
	root.querySelectorAll('[icon]').forEach(element => {
		const value = element.getAttribute('icon');
		if (value && value.includes('/')) {
			element.removeAttribute('icon');
			element.classList.add('icon');
			(element as HTMLElement).style.setProperty('--icon', `url(${value})`);
		}
		const col = element.getAttribute('color');
		if (col) {
			element.removeAttribute('color');
			(element as HTMLElement).style.setProperty('--icon-color', col);
		}
	});

	//class 'select'
	root.querySelectorAll('.select').forEach(item => {
		item.addEventListener('click', event => {
			if (event.target === item) {
				vscode.postMessage({
					command: 'select',
					selector: generateSelector(item),
					text: item.textContent,
					...(item as HTMLElement).dataset
				});
				event.stopPropagation();
			}
		});
	});
}

fixupElements(document);

export function createElement<K extends keyof HTMLElementTagNameMap>(tag: K, options?: Record<string, unknown>): HTMLElementTagNameMap[K] {
	const e = document.createElement(tag);
	if (options) {
		for (const [k,v] of Object.entries(options))
			(e as any)[k] = v;
	}
	return e;
}

export function getFirstText(element: Element) {
	// eslint-disable-next-line @typescript-eslint/prefer-for-of
	for (let i = 0; i < element.childNodes.length; i++) {
        const node = element.childNodes[i];
		if (isText(node)) {
			const text = node.textContent?.trim();
			if (text)
				return text;
		}
	}
}

export function debounce(func: (...args: any[])=>void, wait: number) {
	let timeout: number | undefined;
	return (...args: any[]) => {
		window.clearTimeout(timeout);
		timeout = window.setTimeout(() => {
			timeout = undefined;
			func(...args);
		}, wait);
	};
}


//-------------------------------------
// Style
//-------------------------------------

interface Position<T> {
	x:				T;
	y:				T;
}

interface Size<T> {
	width:			T;
	height:			T;
}

interface Edges<T> {
	left: 			T;
	right: 			T;
	top: 			T;
	bottom: 		T;
}

interface Corners<T> {
	topLeft: 		T;
	topRight: 		T;
	bottomLeft: 	T;
	bottomRight: 	T;
}

interface WidthStyleColor<T> {
	width: 			T;
	style: 			T;
	color: 			T;
}

interface Animation {
    composition: 	string;
    delay: 			string;
    direction: 		string;
    duration: 		string;
    fillMode: 		string;
    iterationCount: string;
    name: 			string;
    playState: 		string;
    timingFunction: string;
}

interface Background {
	attachment: string;
	clip: 		string;
	color: 		string;
	image: 		string;
	origin: 	string;
	position: 	string;
	repeat: 	string;
	size: 		string;
	blendMode: 	string;
}

interface Border extends WidthStyleColor<Edges<string>> {
	radius: 	Corners<string>;

	collapse:	string;
	spacing:	string;

	image: {
		outset: string;
		repeat: string;
		slice: 	string;
		source: string;
		width: 	string;
	}
}

interface Font {
	family: 		string;
	size: 			string;
	style: 			string;
	weight: 		string;
	lineHeight: 	string;

	featureSettings: 	string;
	variationSettings: 	string;
	kerning: 			string;
	opticalSizing: 		string;
	palette: 			string;
	sizeAdjust: 		string;

	variant: {
		alternates: string;
		caps: 		string;
		eastAsian: 	string;
		ligatures: 	string;
		numeric: 	string;
		position: 	string;
	}

	synthesis: {
		weight: 	string;
		style: 		string;
		smallCaps: 	string;
	}
}

interface Grid {
	autoColumns: 		string;
	autoFlow: 			string;
	autoRows: 			string;
	templateAreas: 		string;
	templateColumns: 	string;
	templateRows: 		string;

	//area: string;
	rowStart: 			string;
	rowEnd: 			string;
	columnStart: 		string;
	columnEnd: 			string;
}
 
interface Style extends Position<string>, Size<string>, Edges<string> {
	color: string;

	accentColor: string;

	align: {
		content: 	string;
		items: 		string;
		self: 		string;
	}
	justify: {
		content: 	string;
		items: 		string;
		self: 		string;
	}


	animation: Animation;

	appearance: string;
	aspectRatio: string;
	backdropFilter: string;
	backfaceVisibility: string;

	background: Background;

	baseline: {
		align:	string;
		shift:	string;
		source:	string;
	}

	border: Border;

	boxDecorationBreak: string;
	boxShadow: string;
	boxSizing: string;

	break: {
		after: string;
		before: string;
		inside: string;
	}

	captionSide: string;
	caretColor: string;
	clear: string;

	colorScheme: string;

	columns: {
		width: string;
		count: string;
		fill: string;
		gap: string;
		span: string;
		rule: {
			color: string;
			style: string;
			width: string;
		}
	}

	contain: string;
	containIntrinsicBlockSize: string;
	containIntrinsicHeight: string;
	containIntrinsicInlineSize: string;
	containIntrinsicWidth: string;

	container: string;
	containerName: string;
	containerType: string;

	content: string;
	contentVisibility: string;

	counter: {
		increment: string;
		reset: string;
		set: string;
	}

	cursor: string;
	direction: string;
	display: string;
	dominantBaseline: string;
	emptyCells: string;
	filter: string;

	flex: {
		grow: string;
		shrink: string;
		basis: string;
		//flow: string;
		direction: string;
		wrap: string;
	}

	float: string;
	floodColor: string;
	floodOpacity: string;

	font: Font;

	forcedColorAdjust: string;
	gap:			string;

	grid: 			Grid;

	hyphenateCharacter: string;
	hyphens:		string;
	imageRendering: string;

	inset:			Edges<string>;
	isolation:		string;
	letterSpacing:	string;
	lightingColor:	string;
	lineBreak:		string;
	lineHeight:		string;

	list: {
		style: 		string;
		image: 		string;
		position: 	string;
		type: 		string;
	}

	margin: Edges<string>;

	mask: {
		clip: 		string;
		composite: 	string;
		image: 		string;
		mode: 		string;
		origin: 	string;
		position: 	string;
		repeat: 	string;
		size: 		string;
	}

	mathDepth: string;
	mathStyle: string;
	maxBlockSize: string;

	max: Size<string>;
	min: Size<string>;

	mixBlendMode: string;
	objectFit: string;
	objectPosition: string;

	offset: {
		anchor: 	string;
		distance: 	string;
		path: 		string;
		position: 	string;
		rotate: 	string;
	}

	opacity: string;
	order: string;
	orphans: string;

	outline: WidthStyleColor<string> & {
		offset: string
	}

	overflow: Position<string> & {
		anchor: 	string;
		clipMargin: string;
		wrap: 		string;
	}
	overscrollBehavior:	Position<string>;

	padding: Edges<string>;

	page: 		string;
	paintOrder: string;

	perspective: string;
	perspectiveOrigin: string;

	//placeContent: string;	align/justify content
	//placeItems: string;	align/justify items
	//placeSelf: string;	align/justify self

	pointerEvents: string;
	position: string;

	printColorAdjust: string;
	quotes: string;
	resize: string;
	//rotate: string;
	rowGap: string;

	rubyAlign: string;
	rubyPosition: string;
	//scale: string;

	scroll: {
		behavior: string;
		margin: Edges<string>;
		padding: Edges<string>;
		snapAlign: string;
		snapStop: string;
		snapType: string;
		barColor: string;
		barGutter: string;
		barWidth: string;
	}

	shape: {
		imageThreshold: string;
		margin: 		string;
		outside: 		string;
		rendering: 		string;
	}

	stopColor:		string;
	stopOpacity:	string;

	stroke: {
		dasharray: 	string;
		dashoffset: string;
		linecap: 	string;
		linejoin: 	string;
		miterlimit: string;
		opacity: 	string;
		width: 		string;
	}

	tabSize:		string;
	tableLayout:	string;

	text: {
		align: 					string;
		alignLast: 				string;
		anchor: 				string;
		box: 					string;
		boxEdge: 				string;
		boxTrim: 				string;
		combineUpright: 		string;
		decoration: 			string;
		decorationColor: 		string;
		decorationLine: 		string;
		decorationSkipInk: 		string;
		decorationStyle: 		string;
		decorationThickness: 	string;
		emphasis: 				string;
		emphasisColor: 			string;
		emphasisPosition: 		string;
		emphasisStyle: 			string;
		indent: 				string;
		orientation: 			string;
		overflow: 				string;
		rendering: 				string;
		shadow: 				string;
		transform: 				string;
		underlineOffset: 		string;
		underlinePosition: 		string;
		wrap: 					string;
		wrapMode: 				string;
		wrapStyle: 				string;
	}

	touchAction: string;

	transform: 			string;
	transformBox:		string;
	transformOrigin: 	string;
	transformStyle: 	string;

	transition: {
		behavior: 		string;
		delay: 			string;
		duration: 		string;
		property: 		string;
		timingFunction: string;
	}

	unicodeBidi: string;
	userSelect: string;
	verticalAlign: string;
	viewTransitionClass: string;
	viewTransitionName: string;
	visibility: string;

	whiteSpace: string;
	whiteSpaceCollapse: string;
	widows: string;
	willChange: string;
	wordBreak: string;
	wordSpacing: string;
	writingMode: string;
	zIndex: string;
	zoom: string;

	svgOverride: {
		cx: string;
		cy: string;
		rx: string;
		ry: string;
		r: string;
		fill: string;
		fillOpacity: string;
		fillRule: string;
		colorInterpolation: string;
		colorInterpolationFilters: string;
		d: string;
		maskType: 		string;
		clipPath: string;
		clipRule: string;

		marker: string;
		markerEnd: string;
		markerMid: string;
		markerStart: string;
		vectorEffect: string;

	}
}

function getEdges(sleft: string, sright: string, stop: string, sbottom: string) {
	const [left, right, top, bottom] = [sleft, sright, stop, sbottom].map(f => parseFloat(f) || 0);
	return {left, right, top, bottom};
}

export function getPadding(style: CSSStyleDeclaration) {
	return getEdges(
		style.paddingLeft,
		style.paddingRight,
		style.paddingTop,
		style.paddingBottom
	);
}
export function getMargin(style: CSSStyleDeclaration) {
	return getEdges(
		style.marginLeft,
		style.marginRight,
		style.marginTop,
		style.marginBottom
	);
}
export function getBorder(style: CSSStyleDeclaration) {
	return getEdges(
		style.borderLeftWidth,
		style.borderRightWidth,
		style.borderTopWidth,
		style.borderBottomWidth
	);
}

export function getMarginAndBorder(element: Element) {
	const style = window.getComputedStyle(element);
	return {
		margin: getMargin(style),
		border: getBorder(style)
	};
}


//-------------------------------------
// Pool
//-------------------------------------

export class Pool<T extends Element> {
	private pool: T[]	= [];
	constructor(private make: ()=>T) {}

	get(): T {
		if (this.pool.length === 0)
			this.pool.push(this.make());

		return this.pool.length === 1
			? this.pool[0].cloneNode(true) as T
			: this.pool.pop()!;
	}
	
	discard(item: T) {
		this.pool.push(item);
	}
	discardElement(item: T) {
		this.discard(item);
		item.remove();
	}

}

//-------------------------------------
// splitter
//-------------------------------------

export class Splitter {
	constructor(private readonly splitter: HTMLElement, notify: (split: number)=>void) {
		splitter.addEventListener('pointerdown', (e: PointerEvent) => {
			e.preventDefault();
			splitter.setPointerCapture(e.pointerId);
	
			const left		= splitter.previousSibling as HTMLElement;
			const style		= getComputedStyle(left);
			let split		= left.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
			const offset	= split - e.clientX;
	
			const min		= parseFloat(style.minWidth);
			const max		= Math.min(parseFloat(style.maxWidth), splitter.parentElement?.clientWidth ?? 0 - 300);
	
			left.style.width	= `${split}px`;
			left.style.flex		= 'none';
	
			function resizePanels(e: PointerEvent) {
				split = Math.min(Math.max(e.clientX + offset, min), max);
				left.style.width = `${split}px`;
			}
			
			function stopResizing(e: PointerEvent) {
				notify(split);
				//state.split = split;
				//vscode.setState(state);
	
				splitter.releasePointerCapture(e.pointerId);
				document.removeEventListener('pointermove', resizePanels);
				document.removeEventListener('pointerup', stopResizing);
			}
			
			document.addEventListener('pointermove', resizePanels);
			document.addEventListener('pointerup', stopResizing);
		});
	}

	set(x: number) {
		const left = this.splitter.previousSibling as HTMLElement;
		left.style.width	= `${x}px`;
		left.style.flex	 	= 'none';
	}
	
}

//-------------------------------------
// Scrollbar
//-------------------------------------

export interface Container {
	clientOffset:	number;			//pixel offset for top of track
	clientPixels:	number;			//pixel size of track
	clientSize:		number;			//unit size of visible region
	scrollOffset:	number;			//scroll position in units
	scrollSize:		number;			//size of overall region in units
//	setScroll(x: 	number): void;	//set scroll position in units
}

export function VScrollContainer(container: HTMLElement, offset = 0): Container {
	return {
		clientOffset: 		Math.max(container.clientTop, 0) + offset,
		get clientPixels() 	{ return container.clientHeight - offset; },
		get clientSize()	{ return container.clientHeight - offset; },
		get scrollOffset()	{ return container.scrollTop; },
		get scrollSize() 	{ return container.scrollHeight; },
		set scrollOffset(x)	{ container.scrollTop = x; },
	};
}

export function HScrollContainer(container: HTMLElement, offset = 0): Container {
	return {
		clientOffset: 		Math.max(container.clientLeft, 0) + offset,
		get clientPixels() 	{ return container.clientWidth - offset; },
		get clientSize() 	{ return container.clientWidth - offset; },
		get scrollOffset() 	{ return container.scrollLeft; },
		get scrollSize() 	{ return container.scrollWidth; },
		set scrollOffset(x)	{ container.scrollLeft = x; },
	};
}

export class ScrollBar {
	container:	any;
	thumb:		HTMLElement;
	thumbSize	 = 0;

	constructor(parent: HTMLElement, container: Container|HTMLElement, public horizontal: boolean) {
		const thumb 	= this.thumb = createElement('div', {className: horizontal ? 'hscrollbar' : 'vscrollbar'});
		parent.appendChild(thumb);

		this.container	= container instanceof HTMLElement
			? horizontal ? HScrollContainer(container) : VScrollContainer(container)
			: container;
		this.update();

		thumb.addEventListener("lostpointercapture", (e: PointerEvent) => thumb.dispatchEvent(new MouseEvent('mouseup', e)));

		thumb.addEventListener('pointerdown', event => {
			console.log('down');
			const pointerOffset 	= horizontal ? thumb.offsetLeft - event.clientX : thumb.offsetTop - event.clientY;
			thumb.classList.add('active');

			const onPointerMove = (event: PointerEvent) => {
				this.setThumbPixel(pointerOffset + (horizontal ? event.clientX : event.clientY));
			};
	
			const onPointerUp = () => {
				console.log('up');
				thumb.classList.remove('active');
				window.removeEventListener('pointermove',	onPointerMove);
				window.removeEventListener('pointerup',		onPointerUp);
			};

			if (thumb.setPointerCapture)
				thumb.setPointerCapture(event.pointerId);

			window.addEventListener('pointermove',	onPointerMove);
			window.addEventListener('pointerup', 	onPointerUp);
		});
	}

	update() {
		this.setThumb(this.container.scrollOffset);
	}

	setScroll(scroll: number) {
		this.container.scrollOffset = scroll;
		this.setThumb(scroll);
	}

	setThumbSize(size: number) {
		if (size != this.thumbSize) {
			this.thumbSize = size;
			if (this.horizontal)
				this.thumb.style.width 	= `${size}px`;
			else
				this.thumb.style.height = `${size}px`;
		}
	}
	
	setThumb(scroll: number) {
		const clientPixels	= this.container.clientPixels;
		const clientSize	= this.container.clientSize;
		const scrollSize	= this.container.scrollSize;
		const clientOffset	= this.container.clientOffset;
		let thumbPos: number, thumbSize: number;
	
		if (clientSize >= scrollSize) {
			this.thumb.classList.add('invisible');
			thumbSize	= scrollSize;
			thumbPos	= clientOffset;
		} else {
			this.thumb.classList.remove('invisible');
			thumbSize	= Math.max(clientPixels * clientSize / scrollSize, 20);
			thumbPos	= clientOffset + scroll * (clientPixels - thumbSize) / (scrollSize - clientSize);
		}

		this.setThumbSize(thumbSize);

		if (this.horizontal)
			this.thumb.style.left 	= `${thumbPos}px`;
		else
			this.thumb.style.top 	= `${thumbPos}px`;
	}
	
	setThumbPixel(pos: number) {
		const clientPixels	= this.container.clientPixels;
		const clientSize	= this.container.clientSize;
		const scrollSize	= this.container.scrollSize;
		const clientOffset	= this.container.clientOffset;
		const thumbPos		= Math.min(Math.max(pos, clientOffset), clientOffset + clientPixels - this.thumbSize);
		const scroll		= (thumbPos - clientOffset) * (scrollSize - clientSize) / (clientPixels - this.thumbSize);

		this.container.scrollOffset = scroll;
		if (this.horizontal) {
			this.thumb.style.left		= `${thumbPos}px`;
		} else {
			this.thumb.style.top 		= `${thumbPos}px`;
		}
	}
}

let resizeTimeout: number;

window.addEventListener('resize', () => {
	document.documentElement.classList.add('resizing');
	clearTimeout(resizeTimeout);
	resizeTimeout = window.setTimeout(() => document.documentElement.classList.remove('resizing'), 500);
});

//-------------------------------------
// Tooltip
//-------------------------------------
export class Tooltip {
	private element: HTMLDivElement;

	constructor() {
		this.element = document.createElement('div');
		this.element.className = 'tooltip';
		document.body.appendChild(this.element);
	}

	show(text: string, x: number, y: number) {
		this.element.textContent = text;
		const rect				= this.element.getBoundingClientRect();
		const viewportWidth		= window.innerWidth;
		const viewportHeight	= window.innerHeight;
		
		if (x + rect.width > viewportWidth)
			x = viewportWidth - rect.width - 10;
		
		if (y + rect.height > viewportHeight)
			y = y - rect.height - 10;
		
		this.element.style.left	= `${x}px`;
		this.element.style.top	= `${y}px`;
		this.element.classList.add('visible');
	}

	hide() {
		this.element.classList.remove('visible');
	}
}

//-------------------------------------
// template
//-------------------------------------

function replace(text: string, re: RegExp, process: (m:RegExpExecArray) => string) {
	let i = 0;
	let result = '';
	for (let m: RegExpExecArray|null; (m = re.exec(text)); i = re.lastIndex)
		result += text.substring(i, m.index) + process(m);
	return result + text.substring(i);
}

function isElement(n: Node):	n is HTMLElement	{ return n.nodeType === window.Node.ELEMENT_NODE; }
function isText(n: Node):		n is Text			{ return n.nodeType === window.Node.TEXT_NODE; } 

function replace_in_element(e: HTMLElement, re: RegExp, process: (m:RegExpExecArray) => string) {
	if (e.id)
		e.id = replace(e.id, re, process);
	const name = e.attributes.getNamedItem('name');
	if (name)
		name.value = replace(name.value, re, process);
	const childNodes = e.childNodes;
	for (const node of childNodes) {
		if (isText(node) && node.textContent)
			node.textContent = replace(node.textContent, re, process);
		else if (isElement(node))
			replace_in_element(node, re, process);
	}
}

export function template(template: HTMLElement, parent: HTMLElement, values: Record<string, string>[]) {
	const newnodes = values.map(i => {
		const child = template.cloneNode(true) as HTMLElement;
		child.hidden = false;
		replace_in_element(child, /\$\((.*)\)/g, m => i[m[1]]);
		return child;
	});

//	const parent = after.parentNode;
//	const before = after.nextSibling;
	const before = null;
	for (const i of newnodes)
		parent.insertBefore(i, before);
}

export function generateSelector(e: Node|null) {
	const path: string[] = [];
	while (e && isElement(e)) {
		let index = 1;
		for (let s: Element|null = e; (s = s.previousElementSibling);) {
			if (s.tagName === e.tagName)
				index++;
		}
		//const selector = e.tagName.toLowerCase() + (index > 1 ? `:nth-of-type(${index})` : '');
		const selector = `${e.tagName.toLowerCase()}:nth-of-type(${index})`;
		path.unshift(selector);
		e = e.parentNode;
	}
	return path.join(' > ');
}
