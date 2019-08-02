/* global d3 */
'use strict';

const idify = str => 'i-' + str.toLowerCase().replace(/[^a-z0-9]+/, '-');

// const kludges = [ // used to manually change horizontal position of drivers within each year
// 	[2019, 'alpharomeo', 'RAI', 'GIO'],
// 	[2018, 'alpharomeo', 'LEC', 'ERI'],
	
// 	[2017, 'sauber', 'GIO', 'ERI'],
// 	[2016, 'sauber', 'NAS', 'ERI'],
// 	[2015, 'sauber', 'NAS', 'ERI'],
// 	[2012, 'sauber', 'PER', 'KOB'],
// 	[2011, 'sauber', 'PER', 'KOB'],	
// 	[2004, 'sauber', 'MAS', 'FIS'],
// 	[2002, 'sauber', 'MAS', 'FRE'],
// 	[2001, 'sauber', 'RAI', 'HEI'],
// 	[2000, 'sauber', 'SAL', 'DIN'],
// 	[1999, 'sauber', 'DIN', 'ALE'],
// 	[1998, 'sauber', 'HER', 'ALE'],
// 	[1994, 'sauber', 'FRE', 'CES'],
// 	[1994, 'sauber', 'WEN', 'CES'],
// 	[1994, 'sauber', 'LEH', 'CES'],
// 	[1993, 'sauber', 'WEN', 'LEH'],

// 	[2010, 'bmwsauber', 'KOB', 'HEI'],
// 	[2010, 'bmwsauber', 'DLR', 'HEI'],

// 	[2003, 'sauber', 'HEI', 'FRE'],

// 	[2019, 'racingpoint', 'STR', 'PER'],
// 	[2013, 'forceindia', 'SUT', 'DIR'],
// 	[2012, 'forceindia', 'HUL', 'DIR'],
// 	[2011, 'forceindia', 'HUL', 'DIR'],
// 	[2011, 'forceindia', 'SUT', 'DIR'],
// 	[2010, 'forceindia', 'SUT', 'LIU'],
// 	[2009, 'forceindia', 'SUT', 'LIU'],

// 	[2013, 'caterham', 'VDG', 'PIC'],
// 	[2012, 'caterham', 'PET', 'KOV'],

// 	[2012, 'marussia', 'PIC', 'GLO'],
// 	[2010, 'marussia', 'DIG', 'GLO'],

// 	[2012, 'hrt', 'DLR', 'KAR'],
// 	[2011, 'hrt', 'RIC', 'KAR'],
// 	[2010, 'hrt', 'SEN', 'KLI'],
// 	[2010, 'hrt', 'SEN', 'CHA'],
// 	[2010, 'hrt', 'YAM', 'KLI'],

// 	[1996, 'footwork', 'VER', 'ROS'],

// 	[1995, 'simtek', 'VER', 'SCH'],

// 	[2016, 'manorracing', 'WEH', 'HAR'],
// 	[2015, 'manorracing', 'STE', 'MER'],

// 	[2006, 'superaguri', 'YAM', 'IDE'],

// 	[2009, 'toyota', 'KOB', 'GLO'],
// 	[2009, 'toyota', 'TRU', 'GLO'],
// 	[2008, 'toyota', 'TRU', 'GLO'],
// 	[2004, 'toyota', 'TRU', 'MAT'],
// 	[2004, 'toyota', 'ZON', 'MAT'],
// 	[2004, 'toyota', 'ZON', 'PAN'],
// 	[2003, 'toyota', 'PAN', 'MAT'],
// 	[2002, 'toyota', 'SAL', 'MCN'],

// 	[2019, 'redbull', 'VER', 'GAS'],
// 	[2016, 'redbull', 'RIC', 'KVY'],
// 	[2015, 'redbull', 'RIC', 'KVY'],
// 	[2014, 'redbull', 'VET', 'RIC'],
// 	[2006, 'redbull', 'KLI', 'DOO'],
// 	[2013, 'redbull', 'WEB', 'VET'],
// 	[2012, 'redbull', 'WEB', 'VET'],
// 	[2011, 'redbull', 'WEB', 'VET'],
// 	[2010, 'redbull', 'WEB', 'VET'],
// 	[2009, 'redbull', 'WEB', 'VET'],
// 	[2008, 'redbull', 'WEB', 'COU'],
// 	[2007, 'redbull', 'WEB', 'COU'],


// 	[2019, 'ferrari', 'VET', 'LEC'],
// 	[2018, 'ferrari', 'VET', 'RAI'],
// 	[2017, 'ferrari', 'VET', 'RAI'],
// 	[2016, 'ferrari', 'VET', 'RAI'],
// 	[2015, 'ferrari', 'VET', 'RAI'],

// 	[2013, 'ferrari', 'MAS', 'ALO'],
// 	[2012, 'ferrari', 'MAS', 'ALO'],
// 	[2011, 'ferrari', 'MAS', 'ALO'],
// 	[2010, 'ferrari', 'MAS', 'ALO'],
// 	[2009, 'ferrari', 'MAS', 'BAD'],
// 	[2009, 'ferrari', 'RAI', 'FIS'],
// 	[2006, 'ferrari', 'MSC', 'MAS'],
// 	[2005, 'ferrari', 'MSC', 'BAR'],
// 	[2004, 'ferrari', 'MSC', 'BAR'],
// 	[2003, 'ferrari', 'MSC', 'BAR'],
// 	[2002, 'ferrari', 'MSC', 'BAR'],
// 	[2001, 'ferrari', 'MSC', 'BAR'],
// 	[2000, 'ferrari', 'MSC', 'BAR'],
// 	[1999, 'ferrari', 'MSC', 'IRV'],
// 	[1998, 'ferrari', 'MSC', 'IRV'],
// 	[1997, 'ferrari', 'MSC', 'IRV'],
// 	[1996, 'ferrari', 'MSC', 'IRV'],
// 	[1991, 'ferrari', 'PRO', 'ALE'],
// 	[1991, 'ferrari', 'ALE', 'MOR'],
// 	[1990, 'ferrari', 'PRO', 'MAN'],

// 	[2000, 'benetton', 'WUR', 'FIS'],
// 	[1999, 'benetton', 'WUR', 'FIS'],
// 	[1998, 'benetton', 'WUR', 'FIS'],
// 	[1995, 'benetton', 'MSC', 'HER'],
// 	[1994, 'benetton', 'MSC', 'HER'],
// 	[1994, 'benetton', 'LEH', 'MSC'],
// 	[1994, 'benetton', 'VER', 'HER'],
// 	[1993, 'benetton', 'PAT', 'MSC'],
// 	[1991, 'benetton', 'PIQ', 'MSC'],
// 	[1991, 'benetton', 'PIQ', 'MOR'],
// 	[1990, 'benetton', 'PIQ', 'MOR'],

// 	[1990, 'eurobrun', 'MOR', 'LAN'],
	
// 	[2017, 'renault', 'PAL', 'HUL'],
// 	[2016, 'renault', 'PAL', 'MAG'],
// 	[2007, 'renault', 'KOV', 'FIS'],
// 	// [2018, 'renault', 'SAI', 'HUL'],
// 	// [2017, 'renault', 'SAI', 'HUL'],


// 	[2019, 'haas', 'MAG', 'GRO'],
// 	[2018, 'haas', 'MAG', 'GRO'],
// 	[2017, 'haas', 'MAG', 'GRO'],
// 	[2016, 'haas', 'GUT', 'GRO'],

// 	[2009, 'brawn', 'BUT', 'BAR'],
// 	[2008, 'honda', 'BUT', 'BAR'],
// 	[2007, 'honda', 'BUT', 'BAR'],
// 	[2006, 'honda', 'BUT', 'BAR'],

// 	[2007, 'mclaren', 'HAM', 'ALO'],
// 	[2006, 'mclaren', 'RAI', 'MOY'],
// 	[2005, 'mclaren', 'RAI', 'MOY'],
// 	[2004, 'mclaren', 'RAI', 'COU'],
// 	[2003, 'mclaren', 'RAI', 'COU'],
// 	[2002, 'mclaren', 'RAI', 'COU'],
// 	[1994, 'mclaren', 'HAK', 'ALL'],

// 	[1995, 'ligier', 'SUZ', 'PAN'],
// 	[1993, 'ligier', 'BRU', 'BLU'],

// 	[2002, 'bar', 'VIL', 'PAN'],
// 	[2001, 'bar', 'VIL', 'PAN'],

// 	[2017, 'torrorosso', 'SAI', 'GAS'],
// 	[2017, 'torrorosso', 'GAS', 'KVY'],
// 	[2017, 'torrorosso', 'GAS', 'HAR'],
// 	[2015, 'torrorosso', 'VER', 'SAI'],
// 	[2008, 'torrorosso', 'VET', 'BOU'],
// 	[2007, 'torrorosso', 'VET', 'LIU'],
// 	[2007, 'torrorosso', 'LIU', 'SPE'],

// 	[2016, 'torrorosso', 'SAI', 'KVY'],
// 	[2016, 'torrorosso', 'VER', 'SAI'],
// 	[2016, 'torrorosso', 'SAI', 'KVY'],

// 	[2019, 'williams', 'RUS', 'KUB'],
// 	[2017, 'williams', 'MAS', 'DIR'],
// 	[2017, 'williams', 'STR', 'DIR'],
// 	[2016, 'williams', 'MAS', 'BOT'],
// 	[2015, 'williams', 'MAS', 'BOT'],
// 	[2014, 'williams', 'MAS', 'BOT'],
// 	[2007, 'williams', 'WUR', 'ROS'],
// 	[2005, 'williams', 'PIZ', 'HEI'],
// 	[2004, 'williams', 'MOY', 'GEN'],
// 	[2003, 'williams', 'MOY', 'GEN'],
// 	[2000, 'williams', 'RSC', 'BUT'],
// 	[1999, 'williams', 'ZAN', 'RSC'],
// 	[1998, 'williams', 'VIL', 'FRE'],
// 	[1997, 'williams', 'VIL', 'FRE'],
// 	[1996, 'williams', 'VIL', 'HIL'],
// 	[1994, 'williams', 'SEN', 'COU'],
// 	[1994, 'williams', 'COU', 'HIL'],
// 	[1994, 'williams', 'MAN', 'COU'],
// 	[1993, 'williams', 'PRO', 'HIL'],
// 	[1990, 'williams', 'PAT', 'BOU'],

// 	[1992, 'brabham', 'HIL', 'AMA'],
// 	[1991, 'brabham', 'BRU', 'BLU'],
// 	[1990, 'brabham', 'MOD', 'FOI'],
// 	[1990, 'brabham', 'MOD', 'BRA'],

// 	[1992, 'venturi', 'KAT', 'GAC'],

// 	[1990, 'dallara', 'MOR', 'CES'],
// 	[1991, 'dallara', 'PIR', 'LEH'],

// 	[1996, 'forti', 'MON', 'BAD'],

// 	[1994, 'larrousse', 'DEL', 'BER'],
// 	[1994, 'larrousse', 'NOD', 'DAL'],

// 	[2004, 'jaguar', 'WEB', 'KLI'],
// 	[2001, 'jaguar', 'IRV', 'BUR'],
// 	[2000, 'jaguar', 'IRV', 'BUR'],

// 	[2006, 'midland', 'MON', 'ALB'],
// 	[2005, 'jordan', 'MON', 'KAR'],
// 	[2003, 'jordan', 'FIS', 'BAU'],
// 	[2002, 'jordan', 'SAT', 'FIS'],
// 	[2001, 'jordan', 'ZON', 'ALE'],
// 	[1998, 'jordan', 'RSC', 'HIL'],
// 	[1995, 'jordan', 'IRV', 'BAR'],
// 	[1994, 'jordan', 'CES', 'BAR'],
// 	[1994, 'jordan', 'IRV', 'BAR'],
	
// 	[1993, 'jordan', 'CAP', 'BAR'],
// 	[1993, 'jordan', 'CAP', 'API'],
// 	[1993, 'jordan', 'IRV', 'BOU'],
// 	[1993, 'jordan', 'NAS', 'BOU'],
// 	[1992, 'jordan', 'MOD', 'GUG'],

// 	[1991, 'jordan', 'ZAN', 'GAC'],
// 	[1991, 'jordan', 'MSC', 'ZAN'],
// 	[1991, 'jordan', 'MSC', 'CES'],

// 	[1993, 'march', 'LAM', 'GOU'],
// 	[1992, 'march', 'WEN', 'BEL'],
// 	[1992, 'march', 'NAS', 'LAM'],

// 	[1993, 'minardi', 'GOU', 'BAR'],

// 	[2007, 'spyker', 'WIN', 'ALB'],

// 	[2015, 'lotusf1', 'MAL', 'GRO'],
// 	[2014, 'lotusf1', 'MAL', 'GRO'],
// 	[2013, 'lotusf1', 'RAI', 'KOV'],
// 	[2013, 'lotusf1', 'RAI', 'GRO'],
// 	[2012, 'lotusf1', 'RAI', 'DAM'],

// 	[2001, 'arrows', 'VER', 'BER'],
// 	[1997, 'arrows', 'HIL', 'DIN'],

// 	[2011, 'teamlotus', 'KOV', 'CHA'],
// 	[2011, 'teamlotus', 'TRU', 'CHA'],

// 	[2000, 'prost', 'HEI', 'ALE'],
// 	[1999, 'prost', 'TRU', 'PAN'],
// 	[1998, 'prost', 'TRU', 'PAN'],
// 	[1997, 'prost', 'TRU', 'PAN'],

// 	[2003, 'minardi', 'WIL', 'KIE'],
// 	[2003, 'minardi', 'KIE', 'VER'],
// 	[1998, 'minardi', 'TUE', 'NAK'],
// 	[1996, 'minardi', 'LAV', 'LAM'],
// 	[1995, 'minardi', 'MAR', 'BAD'],
// 	[1995, 'minardi', 'LAM', 'BAD'],

// 	[1998, 'stewart', 'VER', 'MAG'],
// ];

const init = async () => {
	const constructors = await d3.csv('data/constructors.csv');
	const drivers = await d3.csv('data/drivers.csv');
	const formations = await d3.csv('data/formations.csv');
	const lineages = [];
	const years = Object.keys(drivers[0]).map(Number).filter(n => !isNaN(n)).sort();

	const entries = [];
	const links = [];

	for (const constructor of constructors) {
		if (!constructor.lineage) { constructor.lineage = constructor.name; }
		let lineage = lineages.find(d => d.name === constructor.lineage);
		if (!lineage) {
			lineage = { id: idify(constructor.lineage), name: constructor.lineage, years: new Set(), constructors: [] };
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
			let constructorids = driver[String(year)].split('+').map(s => s.trim());
			if (constructorids[0] === '') {
				//prev = null;
				skippedSeasons = true;
				continue;
			}
			
			for (const constructorid of constructorids) {
				const constructor = constructors.find(d => d.id === constructorid);
				if (!constructor) {
					throw new Error(`cannot find constructor ${constructorid}`);
				}
				constructor.years.add(year);
				constructor.lineage.years.add(year);
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

	// for (const [year, constructor, driverIdA, driverIdB] of kludges) {
	// 	const driverA = entries.find(e => e.year === year && e.constructor.id === constructor && e.driver.id === driverIdA);
	// 	const driverB = entries.find(e => e.year === year && e.constructor.id === constructor && e.driver.id === driverIdB);
	// 	if (!driverA || !driverB) { continue; }
	// 	if (driverA.car > driverB.car) {
	// 		const [carA, carB] = [driverA.car, driverB.car];
	// 		driverA.car = carB;
	// 		driverB.car = carA;
	// 	}
	// }

	for (let { constructor, year, ...cars } of formations) {
		year = Number(year);
		const teamentries = entries.filter(e => e.year === year && e.constructor.id === constructor);
		const drivers = teamentries.map(e => e.driver.id);
		const wantedOrder = Object.keys(cars).sort().map(k => cars[k]).filter(v => v);
		const valid = drivers.every(a => wantedOrder.includes(a));
		if (!valid || drivers.length !== wantedOrder.length) {
			console.error('formation is invalid:', constructor, year, wantedOrder, 'expected', drivers);
			continue;
		}
		for (let i = 0; i < wantedOrder.length; i++) {
			const driver = wantedOrder[i];
			const entry = teamentries.find(e => e.driver.id === driver);
			entry.car = i;
		}
	}

	const rows = [];
	for (const lineage of lineages) {
		let row = rows.findIndex(years => {
			return ![...years].find(year => lineage.years.has(year));
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

	const margin = { top: 50, right: 48, bottom: 30, left: 74 };
	const width = 1660 - margin.left - margin.right;
	const height = 3000 - margin.top - margin.bottom;
	const ENTRY_SPACE = 16;

	let selected = null; // selected entry

	const x = d3.scaleBand()
		.domain(lineages.map(c => c.row))
		.range([0, width]);

	const y = d3.scaleLinear()
		.domain(d3.extent(years))
		.range([height, 0]);

	const curveOffsets = d3.scaleBand()
		.domain(lineages.map(c => c.id))
		.range([0, 20]);

	let lastSelected;
	const update = () => {
		if (selected === lastSelected) { return; }
		path.attr('opacity', d => !selected || selected.driver === d.from.driver ? 1 : 0.2);
		entry.attr('opacity', d => !selected || selected.driver === d.driver ? 1 : 0.2);
		if (selected) {
			tooltip
				.attr('display', 'block')
				.attr('transform', `translate(${carPos(selected)},${y(selected.year)})`)
				.select('text')
					.text(selected.driver.name);
		} else {
			tooltip
				.attr('display', 'none');
		}
		lastSelected = selected;
	};

	const svg = d3.select('.container').append('svg')
		.attr('width', width + margin.left + margin.right)
		.attr('height', height + margin.top + margin.bottom)
		.on('mousemove', () => {
			selected = null;
			update();
		});


	const defs = svg.append('defs');

	const uniq = arr => [...new Set(arr)];

	let gradientCount = 0;
	const generateGradient = (...stops) => { // reverse is used when the link is vertical (when driver switches constructor within season)
		if (uniq(stops.map(s => s[1])).length === 1) { return stops[0][1]; }
		stops.sort((a, b) => a[0] - b[0]);
		const id = 'grad-' + gradientCount++;
		const gradient = defs.append('linearGradient')
			.attr('id', id)
			.attr('x1', '0%')
			.attr('y1', '0%')
			.attr('x2', '0%')
			.attr('y2', '100%');

		for (const [offset, color] of stops) {
			gradient.append('stop')
				.attr('offset', offset * 100 + '%')
				.attr('stop-color', color);
		}
		return `url(#${id})`;
	};

	const container = svg.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	const lineageg = container.selectAll('.lineage')
		.data(lineages)
		.enter().append('g')
			.attr('transform', d => `translate(${x(d.row)},${y(Math.max(...d.years))})`);

	lineageg.append('rect')
		.attr('fill', d => {
			const stops = [];
			const startYear = Math.min(...d.years);
			const totalYears = Math.max(...d.years) - startYear;
			for (const constructor of d.constructors) {
				for (const year of constructor.years.values()) {
					let color = constructor.color;
					//if (constructor.id === 'jordan') { color = '#000000'; }
					stops.push([1 - ((year - startYear) / totalYears) + 0.2 / totalYears, color]);
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
		.attr('height', d => y(Math.min(...d.years)) - y(Math.max(...d.years)) + 92);

	let title = lineageg.selectAll('.constructor-title')
		.data(d => {
			let titles = [];
			for (const constructor of d.constructors) {
				let last;
				const years = [...constructor.years].sort().reverse();
				for (const year of years) {
					if (!last || year < last - 1) {
						titles.push({ yearEnd: year, yearStart: year - 1, ...constructor });
					} else {
						titles[titles.length - 1].yearStart--;
						if (titles[titles.length - 1].yearStart === Math.min(...constructor.lineage.years)) {
							titles[titles.length - 1].yearStart = 0; // hide action labels for first year of constructor lineage (fixes sauber)
						}
					}
					last = year;
				}
			}
			return titles;
		})
		.enter().append('g')
			.attr('class', 'constructor-title');

	// title.append('rect')
	// 	.attr('fill', 'white')
	// 	.attr('x', 1)
	// 	.attr('y', d => y(d.yearEnd) - y(Math.max(...d.lineage.years)) - 37)
	// 	.attr('rx', 3)
	// 	.attr('ry', 3)
	// 	.attr('height', 15)
	// 	.attr('width', x.bandwidth() - 15)
	// 	.text(d => d.name);

	title.append('text')
		.attr('class', 'title')
		.attr('text-anchor', 'middle')
		.attr('fill', d => d.color)
		.attr('y', d => y(d.yearEnd) - y(Math.max(...d.lineage.years)) - 26)
		.text(d => d.name);

	title.append('text')
		.attr('text-anchor', 'middle')
		.attr('fill', '#000')
		.attr('opacity', 0.4)
		.attr('y', d => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 68)
		.text(d => d.action ? `${d.action}` : '');

	title.append('text')
		.attr('text-anchor', 'middle')
		.attr('fill', '#000')
		.attr('opacity', 0.4)
		.attr('y', d => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 58)
		.text(d => d.action ? `${d.name}` : '');

	container.selectAll('.year')
		.data(years)
		.enter().append('text')
			.text(d => d)
			.attr('text-anchor', 'start')
			.attr('x', -margin.left)
			.attr('y', d => y(d));

	const carPos = entry => {
		const space = (entry.totalcars === 2 ? 1.7 : entry.totalcars === 3 ? 1.2 : 1.0) * ENTRY_SPACE;
		return x(entry.constructor.lineage.row) + (entry.car - (entry.totalcars - 1) / 2) * space;
	};

	const path = container.selectAll('.path')
		.data(links)
		.enter().append('path')
			.attr('class', d => `path n-${idify(d.from.name)}`)
			.attr('d', d => {
				let y1 = Math.round(y(d.from.year)),
					x1 = Math.round(carPos(d.from)),
					y2 = Math.round(y(d.to.year)),
					x2 = Math.round(carPos(d.to)) + 0.001, // add tiny about to avoid straight lines (gradients don't work) https://stackoverflow.com/questions/21638169/svg-line-with-gradient-stroke-wont-display-straight/34687362
					yc = Math.round(y1 + (y2 - y1) / 2),
					xc = Math.round(x1 + (x2 - x1) / 2);//,
					//offset = curveOffsets(d.from.constructor.lineage.id);
				//console.log(offset)
				return [
					'M', x1, y1, // move to start coordinate
					'L', x1, y1 - 10,
					'Q', x1, y1 - 36, xc, yc, // quadratic curve, with control point and the end point half-way
					'T', x2, y2 + 10, // infer second quadrative curve to the end
					'L', x2, y2
				].join(' ');
			})
			.attr('stroke-dasharray', d => d.skippedSeasons ? '2 3' : 'none')
			.attr('fill', 'none')
			.attr('stroke', d => generateGradient(
					[d.from.year === d.to.year ? 0.2 : 0.8, d.from.constructor.color],
					[d.from.year === d.to.year ? 0.8 : 0.2, d.to.constructor.color]
			))
			.attr('stroke-width', '2')
			.on('mousemove', d => {
				selected = d.from;
				update();
				d3.event.stopPropagation();
			});

	let entry = container.selectAll('.entry')
		.data(entries)
		.enter().append('g')
			.attr('class', d => 'entry ' + d.constructor.id)
			.attr('transform', d => `translate(${carPos(d)},${y(d.year)})`)
			.on('mousemove', d => {
				selected = d;
				update();
				d3.event.stopPropagation();
			});

	entry.append('circle')
		.attr('r', 9)
		.attr('fill', d => d.constructor.color);

	entry.append('text')
		.attr('dy', 2)
		.text(d => d.driver.id);

	const tooltip = svg.append('g')
		.attr('display', 'none');

	tooltip.append('rect')
		.attr('width', 140)
		.attr('height', 26)
		.attr('fill', '#000');

	tooltip.append('text')
		.attr('fill', '#fff')
		.attr('x', 70)
		.attr('y', 16)
		.attr('text-anchor', 'middle');

};

init();