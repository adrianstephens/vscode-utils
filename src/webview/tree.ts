/// <reference lib="dom" />
/// <reference lib="dom.iterable" />

import { generateSelector } from './shared.js';

export class Tree {
	constructor(public root: HTMLElement, public notify:(caret:Element, down:boolean)=>void) {
		this.root = root;

		root.querySelectorAll('.caret').forEach(caret => {
			caret.addEventListener('click', event => {
				if (event.target === caret) {
					caret.classList.toggle('caret-down');
					notify(caret, caret.classList.contains('caret-down'));
					event.stopPropagation();
				}
			});
		});
	}

	fixup(element: Element) {
		element.querySelectorAll('.caret').forEach(caret => {
			caret.addEventListener('click', event => {
				if (event.target === caret) {
					caret.classList.toggle('caret-down');
					this.notify(caret, caret.classList.contains('caret-down'));
					event.stopPropagation();
				}
			});
		});

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
		return Array.from(this.root.querySelectorAll('.caret-down'), element => generateSelector(element));
	}
	
	reveal(element: Element) {
		if (element) {
			for (let parent = element.parentNode; parent; parent = parent.parentNode) {
				const p = parent as HTMLElement;
				if (p.classList?.contains('caret'))
					p.classList.add('caret-down');
			}
			element.scrollIntoView({behavior: 'smooth', block: 'center'});
		}
	}
	
	lastStuck() {
		return lastStuck(this.root);
	}	
}

export function lastStuck(tree?: HTMLElement): HTMLElement | undefined {
	let last_stuck: HTMLElement | undefined;
	if (tree) {
		const	x = tree.clientWidth - 20;
		let		y = 5;

		for(;;) {
			const e = document.elementFromPoint(x, y) as HTMLElement;
			if (!e || getComputedStyle(e).getPropertyValue('position') != 'sticky')
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

let prev_stuck: HTMLElement | undefined;
export function updateStuck() {
	const last_stuck = lastStuck(document.querySelector('.tree') as HTMLElement);
	if (last_stuck !== prev_stuck) {
		if (prev_stuck)
			prev_stuck.classList.remove('stuck');

		if (last_stuck)
			last_stuck.classList.add('stuck');

		prev_stuck = last_stuck;
	}
}
