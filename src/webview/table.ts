export class Table {
	cols?: NodeListOf<HTMLTableCellElement>;

	constructor(public table: HTMLTableElement | null) {
		if (table)
    		this.cols = table.querySelectorAll<HTMLTableCellElement>('th');
	}
	updateSort(column: number, dir: number) {
		if (!this.table || !this.cols)
			return;

		this.cols.forEach((col, i) => col.classList.toggle("sort", i === column));
		this.cols[column].classList.toggle("up", dir < 0);

		const type	= this.cols[column].dataset.type;
		const compare: (a: string, b: string)=>number	= type === 'number'
			? (a, b) => parseInt(a) - parseInt(b)
			: (a, b) => a.localeCompare(b);

		const rows	= Array.from(this.table.querySelectorAll<HTMLTableRowElement>('tbody tr'));
		rows.sort((a, b) => compare(a.childNodes[column].textContent ?? '', b.childNodes[column].textContent ?? '') * dir);

		const tbody	= this.table.querySelector('tbody');
		if (tbody) {
			tbody.innerHTML = '';
			rows.forEach(row => tbody.appendChild(row));
		}
	}
}
