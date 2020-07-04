/* global d3 */
'use strict';

const MARGIN = { top: 50, right: 48, bottom: 30, left: 74 };
const WIDTH = 1660 - MARGIN.left - MARGIN.right;
const HEIGHT = 3000 - MARGIN.top - MARGIN.bottom;
const ENTRY_SPACE = 16;

const makeID = (str) => 'i-' + str.toLowerCase().replace(/[^a-z0-9]+/, '-');
const uniq = (arr) => [...new Set(arr)];

const init = async () => {
	const constructors = await d3.csv('data/constructors.csv');
	const drivers = await d3.csv('data/drivers.csv');
	const formations = await d3.csv('data/formations.csv');

	const lineages = [];
	const years = Object.keys(drivers[0])
		.map(Number)
		.filter((n) => !isNaN(n))
		.sort();
	const entries = [];
	const links = [];

	for (const constructor of constructors) {
		if (!constructor.lineage) {
			constructor.lineage = constructor.name;
		}
		let lineage = lineages.find((d) => d.name === constructor.lineage);
		if (!lineage) {
			lineage = {
				id: makeID(constructor.lineage),
				name: constructor.lineage,
				years: new Set(),
				constructors: [],
			};
			lineages.push(lineage);
		}
		constructor.lineage = lineage;
		constructor.years = new Set();
		lineage.constructors.push(constructor);
	}

	for (const driver of drivers) {
		let prev = null,
			skippedSeasons = false;
		for (const year of years) {
			const constructorIDs = driver[String(year)]
				.split('+')
				.map((s) => s.trim());

			if (constructorIDs[0] === '') {
				skippedSeasons = true;
				continue;
			}

			for (const constructorID of constructorIDs) {
				const constructor = constructors.find((d) => d.id === constructorID);
				if (!constructor) {
					throw new Error(`cannot find constructor ${constructorID}`);
				}
				constructor.years.add(year);
				constructor.lineage.years.add(year);
				const existing = entries.filter(
					(d) =>
						d.constructor.lineage.id === constructor.lineage.id &&
						d.year === year
				);
				const entry = {
					constructor,
					year,
					driver,
					car: existing.length,
					totalCars: existing.length + 1,
					name: constructor.name,
				};
				entries.push(entry);
				for (let e of existing) {
					e.totalCars = existing.length + 1;
				}
				if (prev) {
					links.push({ from: prev, to: entry, skippedSeasons });
				}
				prev = entry;
				skippedSeasons = false;
			}
		}
	}

	for (let { constructor, year, ...cars } of formations) {
		year = Number(year);
		const teamEntries = entries.filter(
			(e) => e.year === year && e.constructor.id === constructor
		);
		const drivers = teamEntries.map((e) => e.driver.id);
		const wantedOrder = Object.keys(cars)
			.sort()
			.map((k) => cars[k])
			.filter((v) => v);
		const valid = drivers.every((a) => wantedOrder.includes(a));
		if (!valid || drivers.length !== wantedOrder.length) {
			console.error(
				'formation is invalid:',
				constructor,
				year,
				wantedOrder,
				'expected',
				drivers
			);
			continue;
		}
		for (let i = 0; i < wantedOrder.length; i++) {
			const driver = wantedOrder[i];
			const entry = teamEntries.find((e) => e.driver.id === driver);
			entry.car = i;
		}
	}

	const rows = [];
	for (const lineage of lineages) {
		let row = rows.findIndex((years) => {
			return ![...years].find((year) => lineage.years.has(year));
		});
		if (row === -1) {
			row = rows.length;
			rows[row] = new Set();
		}
		const start = Math.min(...lineage.years);
		const end = Math.max(...lineage.years);
		for (let year = start; year <= end; year++) {
			rows[row].add(year);
		}
		lineage.row = row;
	}

	const swapEntries = (a, b) => {
		let [carA, carB] = [a.car, b.car];
		a.car = carB;
		b.car = carA;
		render();
	};

	const render = () => {
		document.querySelector('svg');

		const x = d3
			.scaleBand()
			.domain(lineages.map((c) => c.row))
			.range([0, WIDTH]);

		const y = d3.scaleLinear().domain(d3.extent(years)).range([HEIGHT, 0]);

		let lastSelected;
		let selected = null; // selected entry
		const update = () => {
			if (selected === lastSelected) {
				return;
			}
			path.attr('opacity', (d) =>
				!selected || selected.driver === d.from.driver ? 1 : 0.2
			);
			entry.attr('opacity', (d) =>
				!selected || selected.driver === d.driver ? 1 : 0.2
			);
			if (selected) {
				tooltip
					.attr('display', 'block')
					.attr(
						'transform',
						`translate(${carPos(selected)},${y(selected.year)})`
					)
					.select('text')
					.text(selected.driver.name);
			} else {
				tooltip.attr('display', 'none');
			}
			if (swap) {
				entry
					.filter((d) => d === swap)
					.select('circle')
					.attr('fill', 'black');
			}
			lastSelected = selected;
		};

		d3.select('.container svg').remove();

		const svg = d3
			.select('.container')
			.append('svg')
			.attr('width', WIDTH + MARGIN.left + MARGIN.right)
			.attr('height', HEIGHT + MARGIN.top + MARGIN.bottom)
			.on('mousemove', () => {
				selected = null;
				update();
			});

		const defs = svg.append('defs');

		let gradientCount = 0;
		const generateGradient = (...stops) => {
			// reverse is used when the link is vertical (when driver switches constructor within season)
			if (uniq(stops.map((s) => s[1])).length === 1) {
				return stops[0][1];
			}
			stops.sort((a, b) => a[0] - b[0]);
			const id = 'grad-' + gradientCount++;
			const gradient = defs
				.append('linearGradient')
				.attr('id', id)
				.attr('x1', '0%')
				.attr('y1', '0%')
				.attr('x2', '0%')
				.attr('y2', '100%');

			for (const [offset, color] of stops) {
				gradient
					.append('stop')
					.attr('offset', offset * 100 + '%')
					.attr('stop-color', color);
			}
			return `url(#${id})`;
		};

		const container = svg
			.append('g')
			.attr('transform', `translate(${MARGIN.left},${MARGIN.top})`);

		const lineageGroup = container
			.selectAll('.lineage')
			.data(lineages)
			.enter()
			.append('g')
			.attr(
				'transform',
				(d) => `translate(${x(d.row)},${y(Math.max(...d.years))})`
			);

		lineageGroup
			.append('rect')
			.attr('fill', (d) => {
				const stops = [];
				const startYear = Math.min(...d.years);
				const totalYears = Math.max(...d.years) - startYear;
				for (const constructor of d.constructors) {
					for (const year of constructor.years.values()) {
						let color = constructor.color;
						//if (constructor.id === 'jordan') { color = '#000000'; }
						stops.push([
							1 - (year - startYear) / totalYears + 0.2 / totalYears,
							color,
						]);
					}
				}
				return generateGradient(...stops);
			})
			.attr('rx', 5)
			.attr('ry', 5)
			.attr('x', -x.bandwidth() / 2 + 2)
			.attr('y', -50)
			.attr('opacity', '0.2')
			.attr('width', () => x.bandwidth() - 4)
			.attr(
				'height',
				(d) => y(Math.min(...d.years)) - y(Math.max(...d.years)) + 70
			);

		let title = lineageGroup
			.selectAll('.constructor-title')
			.data((d) => {
				let titles = [];
				for (const constructor of d.constructors) {
					let last;
					const years = [...constructor.years].sort().reverse();
					for (const year of years) {
						if (!last || year < last - 1) {
							titles.push({
								yearEnd: year,
								yearStart: year - 1,
								...constructor,
							});
						} else {
							titles[titles.length - 1].yearStart--;
							if (
								titles[titles.length - 1].yearStart ===
								Math.min(...constructor.lineage.years)
							) {
								titles[titles.length - 1].yearStart = 0; // hide action labels for first year of constructor lineage (fixes sauber)
							}
						}
						last = year;
					}
				}
				return titles;
			})
			.enter()
			.append('g')
			.attr('class', 'constructor-title');

		title
			.append('text')
			.attr('class', 'title')
			.attr('text-anchor', 'middle')
			.attr('fill', (d) => d.color)
			.attr('y', (d) => y(d.yearEnd) - y(Math.max(...d.lineage.years)) - 26)
			.text((d) => d.name);

		title
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('fill', '#000')
			.attr('opacity', 0.4)
			.attr('y', (d) => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 68)
			.text((d) => (d.action ? `${d.action}` : ''));

		title
			.append('text')
			.attr('text-anchor', 'middle')
			.attr('fill', '#000')
			.attr('opacity', 0.4)
			.attr('y', (d) => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 58)
			.text((d) => (d.action ? `${d.name}` : ''));

		container
			.selectAll('.year')
			.data(years)
			.enter()
			.append('text')
			.text((d) => d)
			.attr('text-anchor', 'start')
			.attr('x', -MARGIN.left)
			.attr('y', (d) => y(d));

		const carPos = (entry) => {
			const space =
				(entry.totalCars === 2 ? 2 : entry.totalCars === 3 ? 1.0 : 1.0) *
				ENTRY_SPACE;
			return (
				x(entry.constructor.lineage.row) +
				(entry.car - (entry.totalCars - 1) / 2) * space
			);
		};

		const path = container
			.selectAll('.path')
			.data(links)
			.enter()
			.append('path')
			.attr('class', (d) => `path n-${makeID(d.from.name)}`)
			.attr('d', (d) => {
				let y1 = Math.round(y(d.from.year)),
					x1 = Math.round(carPos(d.from)),
					y2 = Math.round(y(d.to.year)),
					x2 = Math.round(carPos(d.to)) + 0.001, // add tiny about to avoid straight lines (gradients don't work) https://stackoverflow.com/questions/21638169/svg-line-with-gradient-stroke-wont-display-straight/34687362
					yc = Math.round(y1 + (y2 - y1) / 2),
					xc = Math.round(x1 + (x2 - x1) / 2); //,
				//offset = curveOffsets(d.from.constructor.lineage.id);
				//console.log(offset)
				return [
					['M', x1, y1], // move to start coordinate
					['L', x1, y1 - 10],
					['Q', x1, y1 - 36, xc, yc], // quadratic curve, with control point and the end point half-way
					['T', x2, y2 + 10], // infer second quadratic curve to the end
					['L', x2, y2],
				]
					.flat()
					.join(' ');
			})
			.attr('stroke-dasharray', (d) => (d.skippedSeasons ? '2 3' : 'none'))
			.attr('fill', 'none')
			.attr('stroke', (d) =>
				generateGradient(
					[d.from.year === d.to.year ? 0.2 : 0.8, d.from.constructor.color],
					[d.from.year === d.to.year ? 0.8 : 0.2, d.to.constructor.color]
				)
			)
			.attr('stroke-width', '2')
			.on('mousemove', (d) => {
				selected = d.from;
				update();
				d3.event.stopPropagation();
			});

		let swap;

		let entry = container
			.selectAll('.entry')
			.data(entries)
			.enter()
			.append('g')
			.attr('class', (d) => 'entry ' + d.constructor.id)
			.attr('transform', (d) => `translate(${carPos(d)},${y(d.year)})`)
			.on('mousemove', (d) => {
				selected = d;
				update();
				d3.event.stopPropagation();
			})
			.on('click', (d) => {
				if (swap) {
					swapEntries(swap, d);
				} else {
					swap = d;
					update();
				}
			});

		entry
			.append('circle')
			.attr('r', 9)
			.attr('fill', (d) => d.constructor.color);

		entry
			.append('text')
			.attr('dy', 2)
			.text((d) => d.driver.id);

		const tooltip = svg.append('g').attr('display', 'none');

		tooltip
			.append('rect')
			.attr('width', 140)
			.attr('height', 26)
			.attr('fill', '#000');

		tooltip
			.append('text')
			.attr('fill', '#fff')
			.attr('x', 70)
			.attr('y', 16)
			.attr('text-anchor', 'middle');
	};

	render();
};

init();
