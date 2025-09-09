/** @jsxImportSource . */

import * as vscode from 'vscode';

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
//globalThis.JSX = {render};

//-----------------------------------------------------------------------------
//	helpers
//-----------------------------------------------------------------------------

export function id_selector(id: string | number) {
	if (typeof id === 'number')
		return `[id="${id}"]`;

	id = id.replace(/[!"#$%&'()*+,./:;<=>?@[\\\]^`{|}~]/g, "\\$&");
	return id[0] >= '0' && id[0] <= '9' ? `[id="${id}"]` : `#${id}`;
}

export const codicons : Record<string, string> = {
	add:									 '\uea60',
	lightbulb:								 '\uea61',
	repo:									 '\uea62',
	fork:									 '\uea63',
	pullRequest:							 '\uea64',
	keyboard:								 '\uea65',
	tag:									 '\uea66',
	person:									 '\uea67',
	branch:									 '\uea68',
	mirror:									 '\uea69',
	star:									 '\uea6a',
	comment:								 '\uea6b',
	alert:									 '\uea6c',
	search:									 '\uea6d',
	logOut:									 '\uea6e',
	logIn:									 '\uea6f',
	eye:									 '\uea70',
	circleFilled:							 '\uea71',
	primitiveSquare:						 '\uea72',
	pencil:									 '\uea73',
	info:									 '\uea74',
	private:								 '\uea75',
	close:									 '\uea76',
	sync:									 '\uea77',
	clone:									 '\uea78',
	beaker:									 '\uea79',
	desktop:								 '\uea7a',
	file:									 '\uea7b',
	ellipsis:								 '\uea7c',
	reply:									 '\uea7d',
	organization:							 '\uea7e',
	newFile:								 '\uea7f',
	newFolder:								 '\uea80',
	trash:									 '\uea81',
	clock:									 '\uea82',
	folder:									 '\uea83',
	github:									 '\uea84',
	terminal:								 '\uea85',
	symbolEvent:							 '\uea86',
	error:									 '\uea87',
	variable:								 '\uea88',
	array:									 '\uea8a',
	symbolModule:							 '\uea8b',
	symbolFunction:							 '\uea8c',
	symbolBoolean:							 '\uea8f',
	symbolNumber:							 '\uea90',
	symbolStruct:							 '\uea91',
	symbolParameter:						 '\uea92',
	symbolKey:								 '\uea93',
	symbolReference:						 '\uea94',
	symbolValue:							 '\uea95',
	symbolUnit:								 '\uea96',
	activateBreakpoints:					 '\uea97',
	archive:								 '\uea98',
	arrowBoth:								 '\uea99',
	arrowDown:								 '\uea9a',
	arrowLeft:								 '\uea9b',
	arrowRight:								 '\uea9c',
	arrowSmallDown:							 '\uea9d',
	arrowSmallLeft:							 '\uea9e',
	arrowSmallRight:						 '\uea9f',
	arrowSmallUp:							 '\ueaa0',
	arrowUp:								 '\ueaa1',
	bell:									 '\ueaa2',
	bold:									 '\ueaa3',
	book:									 '\ueaa4',
	bookmark:								 '\ueaa5',
	debugBreakpointConditionalUnverified:	 '\ueaa6',
	debugBreakpointConditional:				 '\ueaa7',
	debugBreakpointDataUnverified:			 '\ueaa8',
	debugBreakpointData:					 '\ueaa9',
	debugBreakpointLogUnverified:			 '\ueaaa',
	debugBreakpointLog:						 '\ueaab',
	briefcase:								 '\ueaac',
	broadcast:								 '\ueaad',
	browser:								 '\ueaae',
	bug:									 '\ueaaf',
	calendar:								 '\ueab0',
	caseSensitive:							 '\ueab1',
	check:									 '\ueab2',
	checklist:								 '\ueab3',
	chevronDown:							 '\ueab4',
	chevronLeft:							 '\ueab5',
	chevronRight:							 '\ueab6',
	chevronUp:								 '\ueab7',
	chromeClose:							 '\ueab8',
	chromeMaximize:							 '\ueab9',
	chromeMinimize:							 '\ueaba',
	chromeRestore:							 '\ueabb',
	circle:									 '\ueabc',
	circleSlash:							 '\ueabd',
	circuitBoard:							 '\ueabe',
	clearAll:								 '\ueabf',
	clippy:									 '\ueac0',
	closeAll:								 '\ueac1',
	cloudDownload:							 '\ueac2',
	cloudUpload:							 '\ueac3',
	code:									 '\ueac4',
	collapseAll:							 '\ueac5',
	colorMode:								 '\ueac6',
	commentDiscussion:						 '\ueac7',
	creditCard:								 '\ueac9',
	dash:									 '\ueacc',
	dashboard:								 '\ueacd',
	database:								 '\ueace',
	debugContinue:							 '\ueacf',
	debugDisconnect:						 '\uead0',
	debugPause:								 '\uead1',
	debugRestart:							 '\uead2',
	debugStart:								 '\uead3',
	debugStepInto:							 '\uead4',
	debugStepOut:							 '\uead5',
	debugStepOver:							 '\uead6',
	debugStop:								 '\uead7',
	debug:									 '\uead8',
	deviceCameraVideo:						 '\uead9',
	deviceCamera:							 '\ueada',
	deviceMobile:							 '\ueadb',
	diffAdded:								 '\ueadc',
	diffIgnored:							 '\ueadd',
	diffModified:							 '\ueade',
	diffRemoved:							 '\ueadf',
	diffRenamed:							 '\ueae0',
	diff:									 '\ueae1',
	discard:								 '\ueae2',
	editorLayout:							 '\ueae3',
	emptyWindow:							 '\ueae4',
	exclude:								 '\ueae5',
	extensions:								 '\ueae6',
	eyeClosed:								 '\ueae7',
	fileBinary:								 '\ueae8',
	fileCode:								 '\ueae9',
	fileMedia:								 '\ueaea',
	filePdf:								 '\ueaeb',
	fileSubmodule:							 '\ueaec',
	fileSymlinkDirectory:					 '\ueaed',
	fileSymlinkFile:						 '\ueaee',
	fileZip:								 '\ueaef',
	files:									 '\ueaf0',
	filter:									 '\ueaf1',
	flame:									 '\ueaf2',
	foldDown:								 '\ueaf3',
	foldUp:									 '\ueaf4',
	fold:									 '\ueaf5',
	folderActive:							 '\ueaf6',
	folderOpened:							 '\ueaf7',
	gear:									 '\ueaf8',
	gift:									 '\ueaf9',
	gistSecret:								 '\ueafa',
	gist:									 '\ueafb',
	gitCommit:								 '\ueafc',
	compareChanges:							 '\ueafd',
	gitMerge:								 '\ueafe',
	githubAction:							 '\ueaff',
	githubAlt:								 '\ueb00',
	globe:									 '\ueb01',
	grabber:								 '\ueb02',
	graph:									 '\ueb03',
	gripper:								 '\ueb04',
	heart:									 '\ueb05',
	home:									 '\ueb06',
	horizontalRule:							 '\ueb07',
	hubot:									 '\ueb08',
	inbox:									 '\ueb09',
	issueReopened:							 '\ueb0b',
	issues:									 '\ueb0c',
	italic:									 '\ueb0d',
	jersey:									 '\ueb0e',
	bracket:								 '\ueb0f',
	kebabVertical:							 '\ueb10',
	key:									 '\ueb11',
	law:									 '\ueb12',
	lightbulbAutofix:						 '\ueb13',
	linkExternal:							 '\ueb14',
	link:									 '\ueb15',
	listOrdered:							 '\ueb16',
	listUnordered:							 '\ueb17',
	liveShare:								 '\ueb18',
	loading:								 '\ueb19',
	location:								 '\ueb1a',
	mailRead:								 '\ueb1b',
	mail:									 '\ueb1c',
	markdown:								 '\ueb1d',
	megaphone:								 '\ueb1e',
	mention:								 '\ueb1f',
	milestone:								 '\ueb20',
	mortarBoard:							 '\ueb21',
	move:									 '\ueb22',
	multipleWindows:						 '\ueb23',
	mute:									 '\ueb24',
	noNewline:								 '\ueb25',
	note:									 '\ueb26',
	octoface:								 '\ueb27',
	openPreview:							 '\ueb28',
	package:								 '\ueb29',
	paintcan:								 '\ueb2a',
	pin:									 '\ueb2b',
	play:									 '\ueb2c',
	plug:									 '\ueb2d',
	preserveCase:							 '\ueb2e',
	preview:								 '\ueb2f',
	project:								 '\ueb30',
	pulse:									 '\ueb31',
	question:								 '\ueb32',
	quote:									 '\ueb33',
	radioTower:								 '\ueb34',
	reactions:								 '\ueb35',
	references:								 '\ueb36',
	refresh:								 '\ueb37',
	regex:									 '\ueb38',
	remoteExplorer:							 '\ueb39',
	remote:									 '\ueb3a',
	remove:									 '\ueb3b',
	replaceAll:								 '\ueb3c',
	replace:								 '\ueb3d',
	repoClone:								 '\ueb3e',
	repoForcePush:							 '\ueb3f',
	repoPull:								 '\ueb40',
	repoPush:								 '\ueb41',
	report:									 '\ueb42',
	requestChanges:							 '\ueb43',
	rocket:									 '\ueb44',
	rootFolderOpened:						 '\ueb45',
	rootFolder:								 '\ueb46',
	rss:									 '\ueb47',
	ruby:									 '\ueb48',
	saveAll:								 '\ueb49',
	saveAs:									 '\ueb4a',
	save:									 '\ueb4b',
	screenFull:								 '\ueb4c',
	screenNormal:							 '\ueb4d',
	searchStop:								 '\ueb4e',
	server:									 '\ueb50',
	settingsGear:							 '\ueb51',
	settings:								 '\ueb52',
	shield:									 '\ueb53',
	smiley:									 '\ueb54',
	sortPrecedence:							 '\ueb55',
	splitHorizontal:						 '\ueb56',
	splitVertical:							 '\ueb57',
	squirrel:								 '\ueb58',
	starFull:								 '\ueb59',
	starHalf:								 '\ueb5a',
	symbolClass:							 '\ueb5b',
	symbolColor:							 '\ueb5c',
	symbolConstant:							 '\ueb5d',
	symbolEnumMember:						 '\ueb5e',
	symbolField:							 '\ueb5f',
	symbolFile:								 '\ueb60',
	symbolInterface:						 '\ueb61',
	symbolKeyword:							 '\ueb62',
	symbolMisc:								 '\ueb63',
	symbolOperator:							 '\ueb64',
	symbolProperty:							 '\ueb65',
	symbolSnippet:							 '\ueb66',
	tasklist:								 '\ueb67',
	telescope:								 '\ueb68',
	textSize:								 '\ueb69',
	threeBars:								 '\ueb6a',
	thumbsdown:								 '\ueb6b',
	thumbsup:								 '\ueb6c',
	tools:									 '\ueb6d',
	triangleDown:							 '\ueb6e',
	triangleLeft:							 '\ueb6f',
	triangleRight:							 '\ueb70',
	triangleUp:								 '\ueb71',
	twitter:								 '\ueb72',
	unfold:									 '\ueb73',
	unlock:									 '\ueb74',
	unmute:									 '\ueb75',
	unverified:								 '\ueb76',
	verified:								 '\ueb77',
	versions:								 '\ueb78',
	vmActive:								 '\ueb79',
	vmOutline:								 '\ueb7a',
	vmRunning:								 '\ueb7b',
	watch:									 '\ueb7c',
	whitespace:								 '\ueb7d',
	wholeWord:								 '\ueb7e',
	window:									 '\ueb7f',
	wordWrap:								 '\ueb80',
	zoomIn:									 '\ueb81',
	zoomOut:								 '\ueb82',
	listFilter:								 '\ueb83',
	listFlat:								 '\ueb84',
	listSelection:							 '\ueb85',
	listTree:								 '\ueb86',
	debugBreakpointFunctionUnverified:		 '\ueb87',
	debugBreakpointFunction:				 '\ueb88',
	debugStackframeActive:					 '\ueb89',
	circleSmallFilled:						 '\ueb8a',
	debugStackframe:						 '\ueb8b',
	debugBreakpointUnsupported:				 '\ueb8c',
	symbolString:							 '\ueb8d',
	debugReverseContinue:					 '\ueb8e',
	debugStepBack:							 '\ueb8f',
	debugRestartFrame:						 '\ueb90',
	debugAlt:								 '\ueb91',
	callIncoming:							 '\ueb92',
	callOutgoing:							 '\ueb93',
	menu:									 '\ueb94',
	expandAll:								 '\ueb95',
	feedback:								 '\ueb96',
	groupByRefType:							 '\ueb97',
	ungroupByRefType:						 '\ueb98',
	account:								 '\ueb99',
	bellDot:								 '\ueb9a',
	debugConsole:							 '\ueb9b',
	library:								 '\ueb9c',
	output:									 '\ueb9d',
	runAll:									 '\ueb9e',
	syncIgnored:							 '\ueb9f',
	pinned:									 '\ueba0',
	githubInverted:							 '\ueba1',
	serverProcess:							 '\ueba2',
	serverEnvironment:						 '\ueba3',
	pass:									 '\ueba4',
	stopCircle:								 '\ueba5',
	playCircle:								 '\ueba6',
	record:									 '\ueba7',
	debugAltSmall:							 '\ueba8',
	vmConnect:								 '\ueba9',
	cloud:									 '\uebaa',
	merge:									 '\uebab',
	export:									 '\uebac',
	graphLeft:								 '\uebad',
	magnet:									 '\uebae',
	notebook:								 '\uebaf',
	redo:									 '\uebb0',
	checkAll:								 '\uebb1',
	pinnedDirty:							 '\uebb2',
	passFilled:								 '\uebb3',
	circleLargeFilled:						 '\uebb4',
	circleLarge:							 '\uebb5',
	combine:								 '\uebb6',
	table:									 '\uebb7',
	variableGroup:							 '\uebb8',
	typeHierarchy:							 '\uebb9',
	typeHierarchySub:						 '\uebba',
	typeHierarchySuper:						 '\uebbb',
	gitPullRequestCreate:					 '\uebbc',
	runAbove:								 '\uebbd',
	runBelow:								 '\uebbe',
	notebookTemplate:						 '\uebbf',
	debugRerun:								 '\uebc0',
	workspaceTrusted:						 '\uebc1',
	workspaceUntrusted:						 '\uebc2',
	workspaceUnknown:						 '\uebc3',
	terminalCmd:							 '\uebc4',
	terminalDebian:							 '\uebc5',
	terminalLinux:							 '\uebc6',
	terminalPowershell:						 '\uebc7',
	terminalTmux:							 '\uebc8',
	terminalUbuntu:							 '\uebc9',
	terminalBash:							 '\uebca',
	arrowSwap:								 '\uebcb',
	copy:									 '\uebcc',
	personAdd:								 '\uebcd',
	filterFilled:							 '\uebce',
	wand:									 '\uebcf',
	debugLineByLine:						 '\uebd0',
	inspect:								 '\uebd1',
	layers:									 '\uebd2',
	layersDot:								 '\uebd3',
	layersActive:							 '\uebd4',
	compass:								 '\uebd5',
	compassDot:								 '\uebd6',
	compassActive:							 '\uebd7',
	azure:									 '\uebd8',
	issueDraft:								 '\uebd9',
	gitPullRequestClosed:					 '\uebda',
	gitPullRequestDraft:					 '\uebdb',
	debugAll:								 '\uebdc',
	debugCoverage:							 '\uebdd',
	runErrors:								 '\uebde',
	folderLibrary:							 '\uebdf',
	debugContinueSmall:						 '\uebe0',
	beakerStop:								 '\uebe1',
	graphLine:								 '\uebe2',
	graphScatter:							 '\uebe3',
	pieChart:								 '\uebe4',
	bracketDot:								 '\uebe5',
	bracketError:							 '\uebe6',
	lockSmall:								 '\uebe7',
	azureDevops:							 '\uebe8',
	verifiedFilled:							 '\uebe9',
	newline:								 '\uebea',
	layout:									 '\uebeb',
	layoutActivitybarLeft:					 '\uebec',
	layoutActivitybarRight:					 '\uebed',
	layoutPanelLeft:						 '\uebee',
	layoutPanelCenter:						 '\uebef',
	layoutPanelJustify:						 '\uebf0',
	layoutPanelRight:						 '\uebf1',
	layoutPanel:							 '\uebf2',
	layoutSidebarLeft:						 '\uebf3',
	layoutSidebarRight:						 '\uebf4',
	layoutStatusbar:						 '\uebf5',
	layoutMenubar:							 '\uebf6',
	layoutCentered:							 '\uebf7',
	target:									 '\uebf8',
	indent:									 '\uebf9',
	recordSmall:							 '\uebfa',
	errorSmall:								 '\uebfb',
	arrowCircleDown:						 '\uebfc',
	arrowCircleLeft:						 '\uebfd',
	arrowCircleRight:						 '\uebfe',
	arrowCircleUp:							 '\uebff',
	layoutSidebarRightOff:					 '\uec00',
	layoutPanelOff:							 '\uec01',
	layoutSidebarLeftOff:					 '\uec02',
	blank:									 '\uec03',
	heartFilled:							 '\uec04',
	foldHorizontal:							 '\uec05',
	foldHorizontalFilled:					 '\uec06',
	circleSmall:							 '\uec07',
	bellSlash:								 '\uec08',
	bellSlashDot:							 '\uec09',
	commentUnresolved:						 '\uec0a',
	gitPullRequestGoToChanges:				 '\uec0b',
	gitPullRequestNewChanges:				 '\uec0c',
	searchFuzzy:							 '\uec0d',
	commentDraft:							 '\uec0e',
	send:									 '\uec0f',
	sparkle:								 '\uec10',
	insert:									 '\uec11',
	mic:									 '\uec12',
	thumbsdownFilled:						 '\uec13',
	thumbsupFilled:							 '\uec14',
	coffee:									 '\uec15',
	snake:									 '\uec16',
	game:									 '\uec17',
	vr:										 '\uec18',
	chip:									 '\uec19',
	piano:									 '\uec1a',
	music:									 '\uec1b',
	micFilled:								 '\uec1c',
	repoFetch:								 '\uec1d',
	copilot:								 '\uec1e',
	lightbulbSparkle:						 '\uec1f',
	robot:									 '\uec20',
	sparkleFilled:							 '\uec21',
	diffSingle:								 '\uec22',
	diffMultiple:							 '\uec23',
	surroundWith:							 '\uec24',
	share:									 '\uec25',
	gitStash:								 '\uec26',
	gitStashApply:							 '\uec27',
	gitStashPop:							 '\uec28',
	vscode:									 '\uec29',
	vscodeInsiders:							 '\uec2a',
	codeOss:								 '\uec2b',
	runCoverage:							 '\uec2c',
	runAllCoverage:							 '\uec2d',
	coverage:								 '\uec2e',
	githubProject:							 '\uec2f',
	foldVertical:							 '\uec30',
	foldVerticalFilled:						 '\uec31',
	goToSearch:								 '\uec32',
	percentage:								 '\uec33',
	attach:									 '\uec34',
} as const;

type IconType0	= string | vscode.Uri;
type ColorType0	= string | vscode.ThemeColor;

export type IconType	= IconType0 | vscode.ThemeIcon | {
	light:	IconType0;
	dark:	IconType0;
};

function currentlyLight() {
	return vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Light || vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrastLight;
}

export function iconAttribute(icon: IconType0) {
	return typeof icon === 'string' ? codicons[icon] : icon.toString();
}

function getColor(col: ColorType0) {
	const id	= col instanceof vscode.ThemeColor ? (col as any).id : col;
	return `var(--vscode-${id.replace('.', '-')})`;
}

export function iconAttributes(icon?: IconType) {
	if (icon) {
		if (typeof icon === 'string' || icon instanceof vscode.Uri)
			return {icon: iconAttribute(icon)};

		if (icon instanceof vscode.ThemeIcon)
			return icon.color ? {icon: codicons[icon.id], color: getColor(icon.color)} : {icon: codicons[icon.id]};

		return {icon: iconAttribute(currentlyLight() ? icon.light : icon.dark)};
	}
}

export function Label({id, display}: {id: string, display: string}) {
	return <label for={id}>{display}</label>;
}

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

type CSPSource = Hash
	|vscode.Uri
	|(typeof CSPkeywords)[keyof typeof CSPkeywords]
	|CSPSource[];

export function CSPdefault(extension: vscode.Uri): CSPSource {
	const result: CSPSource[] = [CSP.self, vscode.Uri.parse('https://*.vscode-cdn.net')];
	if (extension.scheme === 'https' || extension.scheme === 'http')
		result.push(extension);	// if the extension is being served up from a CDN also include the CDN in the default csp
	return result;
}

function CSPFunction({csp, ...others}: {csp: string, script?: CSPSource, script_elem?: CSPSource, script_attr?: CSPSource, style?: CSPSource, stype_elem?: CSPSource, style_attr?: CSPSource, font?: CSPSource, img?: CSPSource, media?: CSPSource}) {
	const key = (k: string): string => k.indexOf('_') >= 0
		? k.replaceAll('_', '-src-')
		: k + "-src";
	const val = (v: CSPSource): string => 
		  v instanceof Array ? v.map(v => val(v)).join(' ')
		: v instanceof vscode.Uri ? v.toString(true)
		: v instanceof Hash ? v.toValue()
		: /*typeof v === 'string' ? `'${v}` :*/ v.toString();

	return <meta http-equiv="Content-Security-Policy" content={
		`default-src ${csp}; ${Object.entries(others).map(([k, v]) => `${key(k)} ${val(v)};`).join('')}`
	}/>;
}

export const CSP = Object.assign(CSPFunction, CSPkeywords);

export function ImportMap(props: {map: Record<string, vscode.Uri>, webview: vscode.Webview, nonce?: Hash}) {
	return <script type="importmap" nonce={props.nonce?.value}>{
		`{ "imports": { ${Object.entries(props.map).map(([k, v]) => `"${k}": "${props.webview.asWebviewUri(v)}"`).join(',')} } }`
	}</script>;
}
