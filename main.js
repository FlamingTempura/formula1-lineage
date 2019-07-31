/* global d3 */
'use strict';

const idify = str => str.toLowerCase().replace(/[^a-z]+/, '-');

const init = async () => {
	const constructors = await d3.csv('data/constructors.csv');
	const drivers = await d3.csv('data/drivers.csv');
	const lineages = [];
	const years = Object.keys(drivers[0]).map(Number).filter(n => !isNaN(n)).sort();

	const entries = [];
	const links = [];

	for (const constructor of constructors) {
		let lineage = lineages.find(d => d.name === constructor.lineage);
		if (!lineage) {
			lineage = { id: idify(constructor.lineage), name: constructor.lineage };
			lineages.push(lineage);
		}
		constructor.lineage = lineage;
	}

	for (const driver of drivers) {
		let prev = null,
			skippedSeasons = false;
		for (const year of years) {
			let constructorids = driver[String(year)].split('+').map(s => s.trim());
			if (constructorids[0] === '') {
				//prev = null;
				skippedSeasons = true;
				continue;
			}
			
			for (const constructorid of constructorids) {
				const constructor = constructors.find(d => d.id === constructorid);
				const existing = entries.filter(d => d.constructor.lineage.id === constructor.lineage.id && d.year === year);
				const entry = {
					constructor,
					year,
					driver,
					car: existing.length,
					totalcars: existing.length + 1,
					name: constructor.name
				};
				entries.push(entry);
				for (let e of existing) {
					e.totalcars = existing.length + 1;
				}
				if (prev) {
					links.push({ from: prev, to: entry, skippedSeasons });
				}
				prev = entry;
				skippedSeasons = false;
			}

		}
	}

	const margin = { top: 70, right: 20, bottom: 40, left: 90 };
	const width = 960 - margin.left - margin.right;
	const height = 1000 - margin.top - margin.bottom;

	let selected = null;

	const x = d3.scaleLinear()
		.domain(d3.extent(years))
		.range([0, width]);

	const y = d3.scaleBand()
		.domain(lineages.map(c => c.id))
		.range([0, height]);

	const update = () => {
		path.attr('opacity', d => selected === d.from.driver.name || !selected ? 1 : 0.2);
		entry.attr('opacity', d => selected === d.driver.name || !selected ? 1 : 0.2);
	};

	const svg = d3.select('.container').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.on('mousemove', () => {
			selected = null;
			update();
		});

	const defs = svg.append('defs');

	const generateGradient = (from, to, reverse) => { // reverse is used when the link is vertical (when driver switches constructor within season)
		if (from === to) { return from; }
		const id = 'grad' + Math.ceil(Math.random() * 100000);
		const gradient = defs.append('linearGradient')
			.attr('id', id)
			.attr('x1', reverse ? '100%' : '0%')
			.attr('y1', '0%')
			.attr('x2', reverse ? '0%' : '100%')
			.attr('y2', '0%');
		gradient.append('stop')
			.attr('offset', '10%')
			.attr('stop-color', from);
		gradient.append('stop')
			.attr('offset', '90%')
			.attr('stop-color', to);
		return `url(#${id})`;
	};

	const container = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	container.selectAll('.lineage')
		.data(lineages)
		.enter().append('text')
			.text(d => d.name)
			.attr('transform', d => `translate(-80, ${y(d.id) - 4})`);

	container.selectAll('.year')
		.data(years)
		.enter().append('text')
			.text(d => d)
			.attr('text-anchor', 'middle')
			.attr('transform', d => `translate(${x(d)}, -50)`);

	const path = container.selectAll('.path')
		.data(links)
		.enter().append('path')
			.attr('class', d => `path n-${idify(d.from.name)}`)
			.attr('d', d => {
				let x1 = Math.round(x(d.from.year)),
					y1 = Math.round(y(d.from.constructor.lineage.id) + (d.from.car - d.from.totalcars / 2) * 15),
					x2 = Math.round(x(d.to.year)),
					y2 = Math.round(y(d.to.constructor.lineage.id) + (d.to.car - d.to.totalcars / 2) * 15) + 0.001, // add tiny about to avoid straight lines (gradients don't work) https://stackoverflow.com/questions/21638169/svg-line-with-gradient-stroke-wont-display-straight/34687362
					xc = Math.round(x1 + (x2 - x1) / 2),
					yc = Math.round(y1 + (y2 - y1) / 2);
				return `M${x1} ${y1} Q ${x1 + 22} ${y1}, ${xc} ${yc} T ${x2} ${y2}`;
			})
			.attr('stroke-dasharray', d => d.skippedSeasons ? '2 5' : 'none')
			.attr('fill', 'none')
			.attr('stroke', d => generateGradient(d.from.constructor.color, d.to.constructor.color, d.from.year === d.to.year))
			.attr('stroke-width', '2')
			.on('mousemove', d => {
				selected = d.from.driver.name;
				update();
				d3.event.stopPropagation();
			});

	let entry = container.selectAll('.entry')
		.data(entries)
		.enter().append('g')
			.attr('class', 'entry')
			.attr('transform', d => `translate(${x(d.year)},${y(d.constructor.lineage.id) + (d.car - d.totalcars / 2) * 15})`)
			.on('mousemove', d => {
				selected = d.driver.name;
				update();
				d3.event.stopPropagation();
			});

	entry.append('circle')
		.attr('r', 10)
		.attr('fill', d => d.constructor.color);

	entry.append('text')
		.attr('dy', 2)
		.text(d => d.driver.id);

	return;
	/*let constructorLookup = {};

	for (let constructor of constructors) {
		constructorLookup[constructor.id] = constructor;
		for (let year = 1900; year < 2050; year++) {
			let entry = constructor[String(year)];
			if (entry) {
				constructor[String(year)] = {
					year,
					name: entry.split(':')[0],
					color: entry.split(':')[1]
				};
			}
		}
	}


	





*/
};

init();