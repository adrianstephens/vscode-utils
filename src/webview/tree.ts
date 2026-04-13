/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { querySelectorAll, modKey } from './shared.js';

export interface DragDropInterface {
	start(entry: HTMLElement, data: DataTransfer | null): any;
	end?(ctx: any, event: DragEvent): void;
	over(ctx: any, target: HTMLElement, data: DataTransfer, modifierKey: boolean): HTMLElement | undefined;
	drop(ctx: any, target: HTMLElement, data: DataTransfer, effect?: string): void;
	changeTarget(from: HTMLElement|undefined, to: HTMLElement|undefined): void;
}

export interface TreeItem {
	nextSibling(): TreeItem | null;			// Next sibling at the same level, or null
	prevSibling(): TreeItem | null;			// Previous sibling at the same level, or null
	parent(): ExpandableTreeItem | null;	// Parent item, or null if at root level
	isExpandable(): this is ExpandableTreeItem;
}

export interface ExpandableTreeItem extends TreeItem {
	firstChild(): TreeItem | null;			// First child item when expanded, or null
	children(): DOMTreeItem[];				// All child items when expanded, or empty array
}

class DOMTreeItem implements TreeItem {
	static create(el: HTMLElement): DOMTreeItem {
		return el.classList.contains('caret')
			? new DOMExpandableTreeItem(el)
			: el.parentElement?.classList.contains('caret')
			? new DOMExpandableTreeItem(el.parentElement)
			: new DOMTreeItem(el);
	}

	constructor(readonly el: HTMLElement) {}

	get element() {
		return this.el;
	}

	isExpandable(): this is DOMExpandableTreeItem {
		return false;
	}
	nextSibling(): DOMTreeItem | null {
		const next = this.el.nextElementSibling as HTMLElement | null;
		return next ? DOMTreeItem.create(next) : null;
	}
	prevSibling(): DOMTreeItem | null {
		const prev = this.el.previousElementSibling as HTMLElement | null;
		return prev ? DOMTreeItem.create(prev) : null;
	}
	parent(): DOMExpandableTreeItem | null {
		const p = this.el?.closest<HTMLElement>('.caret');
		return p ? new DOMExpandableTreeItem(p) : null;
	}
}

class DOMExpandableTreeItem extends DOMTreeItem implements ExpandableTreeItem {
	override get element() {
		return this.el.querySelector<HTMLElement>(':scope > .select')!;
	}
	override isExpandable(): this is DOMExpandableTreeItem {
		return true;
	}
	parent(): DOMExpandableTreeItem | null {
		const p = this.el.parentElement?.closest<HTMLElement>('.caret');
		return p ? new DOMExpandableTreeItem(p) : null;
	}
	children(): DOMTreeItem[] {
		const children = this.el.querySelectorAll<HTMLElement>(':scope > .children > .select, :scope > .children > .caret > .select') ?? null;
		return children ? Array.from(children).map(el => DOMTreeItem.create(el)) : [];
	}

	firstChild(): DOMTreeItem | null {
		const child = this.el.querySelector<HTMLElement>(':scope > .children > .select, :scope > .children > .caret > .select') ?? null;
		return child ? DOMTreeItem.create(child) : null;
	}
}

export class Tree {
	cursor:		HTMLElement | null = null;
	prev_stuck:	HTMLElement | undefined;

	constructor(public root: HTMLElement, public notify:(caret:HTMLElement, down:boolean)=>void) {
		this.fixup(root);
	}

	fixup(element: HTMLElement) {
		querySelectorAll<HTMLElement>(element, '.caret').forEach(caret =>
			caret.addEventListener('click', event => {
				if (event.target === caret) {
					this.toggle(caret);
					event.stopPropagation();
				}
			})
		);
		querySelectorAll<HTMLElement>(element, '.select').forEach(row => { row.tabIndex = -1; });
	}

	updateStuck() {
		const last_stuck = lastStuck(this.root);
		if (last_stuck !== this.prev_stuck) {
			if (this.prev_stuck)
				this.prev_stuck.classList.remove('stuck');

			if (last_stuck)
				last_stuck.classList.add('stuck');

			this.prev_stuck = last_stuck;
		}
	}

	is_open(caret: HTMLElement) {
		return caret.classList.contains('caret-down');
	}
	all_open() {
		return Array.from(this.root.querySelectorAll<HTMLElement>('.caret-down'));
	}

	toggle(caret: HTMLElement) {
		caret.classList.toggle('caret-down');
		this.notify(caret, this.is_open(caret));
	}

	// open, close and close_all do not notify
	open(caret: HTMLElement) {
		caret.classList.add('caret-down');
	}
	close(caret: HTMLElement) {
		caret.classList.remove('caret-down');
	}
	close_all() {
		this.root.querySelectorAll<HTMLElement>('.caret-down').forEach(e => this.close(e));
	}


	reveal(element: Element | null) {
		if (element) {
			for (let parent = element.parentNode; parent; parent = parent.parentNode) {
				const p = parent as HTMLElement;
				if (p.classList?.contains('caret'))
					p.classList.add('caret-down');
			}
			element.scrollIntoView({behavior: 'smooth', block: 'center'});
		}
	}
	
	setCursor(cursor: HTMLElement | null, moveFocus = true) {
		if (this.cursor) {
			this.cursor.classList.remove('cursor');
			this.cursor.tabIndex = -1;
		}
		this.cursor = cursor;
		if (cursor) {
			cursor.classList.add('cursor');
			cursor.tabIndex = 0;
			if (moveFocus)
				cursor.focus();
		}
	}

	enableKeyboardNavigation(notify: (cursor: HTMLElement, shiftKey: boolean, modKey: boolean) => void) {
		// Tab key lands on root → redirect to current or first visible row
		this.root.addEventListener('focus', event => {
			if (event.target === this.root) {
				if (!this.cursor) {
					const el = this.root.querySelector<HTMLElement>('.select');
					if (el)
						this.setCursor(el);
				}
			}
		});

		this.root.addEventListener('keydown', event => {
			// Skip navigation if an input field is focused (e.g. during rename)
			if (event.target instanceof HTMLInputElement || !this.cursor)
				return;

			const setCursor = (item: DOMTreeItem) => {
				const cursor = item.element;
				notify(cursor, event.shiftKey, event[modKey]);
				this.setCursor(cursor);
			};

			const cur = DOMTreeItem.create(this.cursor);

			switch (event.key) {
				case 'ArrowDown':
					event.preventDefault();
					if (cur.isExpandable() && this.is_open(cur.el)) {
						const child = cur.firstChild();
						if (child) {
							setCursor(child);
							break;
						}
					}
					for (let c: DOMTreeItem | null = cur; c; c = c.parent()) {
						const next = c.nextSibling();
						if (next) {
							setCursor(next);
							break;
						}
					}
					break;

				case 'ArrowUp': {
					event.preventDefault();
					let node = cur.prevSibling();
					if (node) {
						while (node.isExpandable() && this.is_open(node.el)) {
							const children = node.children();
							if (children.length === 0)
								break;
							node = children[children.length - 1];
						}
						setCursor(node);
					} else {
						const p = cur.parent();
						if (p)
							setCursor(p);
					}
					break;
				}
				case 'ArrowRight':
					event.preventDefault();
					if (cur.isExpandable() && !this.is_open(cur.el))	
						this.toggle(cur.el);
					break;

				case 'ArrowLeft':
					event.preventDefault();
					if (cur.isExpandable() && this.is_open(cur.el)) {
						this.toggle(cur.el);
					} else {
						const p = cur.parent();
						if (p)
							setCursor(p);
					}
					break;
			}
		});
	}

	dragAndDrop(int: DragDropInterface) {
		let ctx: any;
		let dropTarget: HTMLElement | undefined;
		let lastEffect: string | undefined;
		
		function setTarget(target?: HTMLElement) {
			if (dropTarget === target)
				return;
			int.changeTarget(dropTarget, target);
			dropTarget = target;
		}

		this.root.addEventListener('dragstart', event => {
			ctx = int.start(event.target as HTMLElement, event.dataTransfer);
		});

		this.root.addEventListener('dragend', event => {
			int.end?.(ctx, event);
			ctx = undefined;
			setTarget(undefined);
		});

		this.root.addEventListener('dragover', event => {
			if (event.dataTransfer) {
				const drop = int.over(ctx, event.target as HTMLElement, event.dataTransfer, event[modKey]);
				if (drop) {
					event.preventDefault();
					lastEffect = event.dataTransfer.dropEffect;
				}
				setTarget(drop);
			}
		});

		this.root.addEventListener('dragleave', event => {
			if (event.target === this.root)
				setTarget(undefined);
		});

		this.root.addEventListener('drop', event => {
			if (event.dataTransfer && dropTarget) {
				event.preventDefault();
				int.drop(ctx, dropTarget, event.dataTransfer, lastEffect);
			}
			setTarget(undefined);
		});
	}
}

export function lastStuck(tree?: HTMLElement): HTMLElement | undefined {
	let last_stuck: HTMLElement | undefined;
	if (tree) {
		const rect = tree.getBoundingClientRect();
		const x = rect.right - 5; // 5px inside the tree from the left edge
		let y = rect.top + 5;   // 5px inside the tree from the top edge

		for (let i = 0; i < 100; i++) {
			let e = document.elementFromPoint(x, y) as HTMLElement;
			if (!e)
				break;

			// If e is a .caret, check its firstElementChild (the span)
			if (e.classList.contains('caret') && e.firstElementChild instanceof HTMLElement)
				e = e.firstElementChild as HTMLElement;

			if (getComputedStyle(e).getPropertyValue('position') !== 'sticky')
				break;

			const bottom = e.getBoundingClientRect().bottom;
			const next = e.nextElementSibling as HTMLElement;
			if (next?.getBoundingClientRect().top >= bottom)
				break;

			last_stuck = e;
			y = bottom + 5;
		}
	}
	return last_stuck;
}
