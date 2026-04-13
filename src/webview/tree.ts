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

export class Tree {
	cursor: HTMLElement | undefined;
	prev_stuck: HTMLElement | undefined;

	constructor(public root: HTMLElement, public notify:(caret:HTMLElement, down:boolean)=>void) {
		this.fixup(root);
	}

	fixup(element: HTMLElement) {
		querySelectorAll<HTMLElement>(element, '.caret').forEach(caret =>
			caret.addEventListener('click', event => {
				if (event.target === caret) {
					caret.classList.toggle('caret-down');
					this.notify(caret, caret.classList.contains('caret-down'));
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


	open(element: Element) {
		element?.classList.add('caret-down');
	}
	close(element: Element) {
		element?.classList.remove('caret-down');
	}

	close_all() {
		this.root.querySelectorAll('.caret-down').forEach(e => e.classList.remove('caret-down'));
	}
	
	all_open() {
		return Array.from(this.root.querySelectorAll<HTMLElement>('.caret-down'));
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
	
	//lastStuck() {
	//	return lastStuck(this.root);
	//}

	// Returns all currently visible row elements (.select) in DOM order
	visibleRows(): HTMLElement[] {
		return Array.from(this.root.querySelectorAll<HTMLElement>('.select')).filter(el => {
			for (let p: HTMLElement | null = el.parentElement; p && p !== this.root; p = p.parentElement) {
				if (p.classList.contains('children') && !p.parentElement?.classList.contains('caret-down'))
					return false;
			}
			return true;
		});
	}
	setCursor(next: HTMLElement | undefined, moveFocus = true) {
		if (this.cursor) {
			this.cursor.classList.remove('cursor');
			this.cursor.tabIndex = -1;
		}
		this.cursor = next;
		if (this.cursor) {
			this.cursor.classList.add('cursor');
			this.cursor.tabIndex = 0;
			if (moveFocus) {
				this.cursor.focus({ preventScroll: true });
				this.cursor.scrollIntoView({ block: 'nearest', inline: 'nearest' });
			}
		}
	}


	/**
	 * Enables full keyboard navigation on the tree (arrows, Enter, Space).
	 * Assigns tabIndex to rows so the tree is accessible via Tab key.
	 * Returns a handle to read/set the current (focused cursor) item.
	 *
	 * DOM conventions assumed:
	 *   - Tree rows have class `.select`
	 *   - Expandable rows are direct children of a `.caret` element
	 *   - Children container: `.children` (direct child of `.caret`)
	 */
	enableKeyboardNavigation(notify: (cursor: HTMLElement, shiftKey: boolean, modKey: boolean)=>void) {
		// Tab key lands on root → redirect to current or first visible row
		this.root.addEventListener('focus', event => {
			if (event.target === this.root) {
				const rows = this.visibleRows();
				this.setCursor(this.cursor && rows.includes(this.cursor) ? this.cursor : rows[0]);
			}
		});


		this.root.addEventListener('keydown', event => {
			const setCursor = (cursor: HTMLElement) => {
				notify(cursor, event.shiftKey, event[modKey]);
				this.setCursor(cursor);
			}
			if (!this.cursor)
				return;

			const rows	= this.visibleRows();
			const i		= rows.indexOf(this.cursor);
			const caret = this.cursor.parentElement?.classList.contains('caret') ? this.cursor.parentElement : null;
			const hasChildren = !!caret?.querySelector<HTMLElement>(':scope > .children');

			switch (event.key) {
				case 'ArrowDown': {
					event.preventDefault();
					if (i >= 0 && i < rows.length - 1)
						setCursor(rows[i + 1]);
					break;
				}
				case 'ArrowUp': {
					event.preventDefault();
					if (i > 0)
						setCursor(rows[i - 1]);
					break;
				}
				case 'ArrowRight': {
					// Open closed node, or move to the next visible row.
					event.preventDefault();
					if (caret && hasChildren && !caret.classList.contains('caret-down')) {
						caret.classList.add('caret-down');
						this.notify(caret, true);
						break;
					}
					if (i >= 0 && i < rows.length - 1)
						setCursor(rows[i + 1]);
					break;
				}
				case 'ArrowLeft': {
					// Close open node, or jump to parent row.
					event.preventDefault();
					if (caret && hasChildren && caret.classList.contains('caret-down')) {
						caret.classList.remove('caret-down');
						this.notify(caret, false);
					} else {
						// Navigate to the nearest ancestor row
						const parentRow = this.cursor.parentElement
							?.closest('.children')
							?.parentElement
							?.querySelector<HTMLElement>(':scope > .select');
						if (parentRow)
							setCursor(parentRow);
					}
					break;
				}
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
