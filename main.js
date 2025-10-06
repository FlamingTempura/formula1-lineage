/* global d3 */
"use strict";

const MARGIN = { top: 50, right: 48, bottom: 30, left: 74 };
const WIDTH = 1660 - MARGIN.left - MARGIN.right;
const HEIGHT = 3000 - MARGIN.top - MARGIN.bottom;
const ENTRY_SPACE = 16;
/**
 * Set to true to allow modifying driver orders
 */
const DEBUG = false;

/**
 * Generate a DOM safe ID
 */
const makeID = (str) => "i-" + str.toLowerCase().replace(/[^a-z0-9]+/, "-");

const uniq = (arr) => [...new Set(arr)];

let gradientCount = 0;
const generateGradient = (defs, ...stops) => {
  // reverse is used when the link is vertical (when driver switches constructor within season)
  if (uniq(stops.map((s) => s[1])).length === 1) {
    return stops[0][1];
  }
  stops.sort((a, b) => a[0] - b[0]);
  const id = "grad-" + gradientCount++;
  const gradient = defs
    .append("linearGradient")
    .attr("id", id)
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "0%")
    .attr("y2", "100%");

  for (const [offset, color] of stops) {
    gradient
      .append("stop")
      .attr("offset", offset * 100 + "%")
      .attr("stop-color", color);
  }
  return `url(#${id})`;
};

const swapEntries = (a, b) => {
  const [carA, carB] = [a.car, b.car];
  a.car = carB;
  b.car = carA;
};

const init = async () => {
  const constructors = new Map(
    (await d3.csv("data/constructors.csv")).map((constructor) => [
      constructor.id,
      constructor,
    ])
  );
  const drivers = await d3.csv("data/drivers.csv");
  const formations = await d3.csv("data/formations.csv");
  console.log(drivers);

  const lineages = new Map();
  const years = Object.keys(drivers[0])
    .map(Number)
    .filter((n) => !isNaN(n))
    .sort((a, b) => a - b);
  const entries = [];
  const links = [];

  for (const constructor of constructors.values()) {
    if (!constructor.lineage) {
      constructor.lineage = constructor.name;
    }
    let lineage = lineages.get(constructor.lineage);
    if (!lineage) {
      lineage = {
        id: makeID(constructor.lineage),
        name: constructor.lineage,
        years: new Set(),
        constructors: [],
      };
      lineages.set(constructor.lineage, lineage);
    }
    constructor.lineage = lineage;
    constructor.years = new Set();
    lineage.constructors.push(constructor);
  }

  for (const driver of drivers) {
    let prev = null;
    let skippedSeasons = false;
    for (const year of years) {
      const constructorIDs = driver[String(year)]
        .split("+")
        .map((s) => s.trim());

      if (constructorIDs[0] === "") {
        skippedSeasons = true;
        continue;
      }

      for (const constructorID of constructorIDs) {
        const constructor = constructors.get(constructorID);
        if (!constructor) {
          throw new Error(`cannot find constructor ${constructorID}`);
        }
        constructor.years.add(year);
        constructor.lineage.years.add(year);
        const existingConstructorYearEntries = entries.filter(
          (d) =>
            d.constructor.lineage.id === constructor.lineage.id &&
            d.year === year
        );
        let entry = entries.find(
          (e) =>
            e.constructor === constructor &&
            e.year === year &&
            e.driver === driver
        );
        if (!entry) {
          entry = {
            constructor,
            year,
            driver,
            car: existingConstructorYearEntries.length,
            totalCars: existingConstructorYearEntries.length + 1,
            name: constructor.name,
          };
          entries.push(entry);
          for (const e of existingConstructorYearEntries) {
            e.totalCars = existingConstructorYearEntries.length + 1;
          }
        }
        if (prev) {
          links.push({ from: prev, to: entry, skippedSeasons });
        }
        prev = entry;
        skippedSeasons = false;
      }
    }
  }

  // Identify the latest year
  const latestYear = Math.max(...years);

  // Map to store the last team for each driver in the latest year
  const driverLastTeamInLatestYear = new Map();

  // Iterate through entries to find the last team for each driver in the latest year
  for (const entry of entries) {
    if (entry.year === latestYear) {
      driverLastTeamInLatestYear.set(entry.driver.id, entry.constructor.id);
    }
  }

  // Map to store the two most recent drivers for each team in the latest year
  const teamLatestDrivers = new Map();

  // Populate teamLatestDrivers
  for (const entry of entries) {
    if (entry.year === latestYear) {
      const teamId = entry.constructor.id;
      const driverId = entry.driver.id;

      // Only consider drivers whose last team in the latest year is the current team
      if (driverLastTeamInLatestYear.get(driverId) === teamId) {
        if (!teamLatestDrivers.has(teamId)) {
          teamLatestDrivers.set(teamId, []);
        }
        const driversForTeam = teamLatestDrivers.get(teamId);
        if (!driversForTeam.includes(driverId)) {
          driversForTeam.push(driverId);
        }
      }
    }
  }

  // Mark entries for greying out
  for (const entry of entries) {
    if (entry.year === latestYear) {
      const teamId = entry.constructor.id;
      const driverId = entry.driver.id;
      const driversForTeam = teamLatestDrivers.get(teamId) || [];

      // If the driver is not among the first two "most recent" drivers for the team, mark for greying out
      if (!driversForTeam.slice(0, 2).includes(driverId)) {
        entry.leftMidSeason = true;
      } else {
        entry.leftMidSeason = false;
      }
    } else {
      entry.leftMidSeason = false; // Not in the latest year, so not greyed out by this rule
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
        "formation is invalid:",
        constructor,
        year,
        wantedOrder,
        "expected",
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
  for (const lineage of lineages.values()) {
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

  const render = () => {
    document.querySelector("svg");

    const x = d3
      .scaleBand()
      .domain([...lineages.values()].map((c) => c.row))
      .range([0, WIDTH]);

    const y = d3.scaleLinear().domain(d3.extent(years)).range([HEIGHT, 0]);

    let lastSelected;
    let selected = null; // selected entry
    const update = () => {
      if (selected === lastSelected) return;
      // Apply fade class based on leftMidSeason when nothing is selected, or based on hover
      path.classed(
        "fade",
        (d) => (d.from.leftMidSeason && d.from.year === latestYear && !selected) || (selected && selected.driver !== d.from.driver)
      );
      entry.classed(
        "fade",
        (d) => (d.leftMidSeason && !selected) || (selected && selected.driver !== d.driver)
      );
      if (selected) {
        tooltip
          .classed("show", true)
          .attr(
            "transform",
            `translate(${carPos(selected)},${y(selected.year)})`
          )
          .select("text")
          .text(selected.driver.name);
      } else {
        tooltip.classed("show", false);
      }
      if (swap) {
        entry
          .filter((d) => d === swap)
          .select("circle")
          .attr("fill", "black");
      }
      lastSelected = selected;
    };

    d3.select(".container svg").remove();

    const svg = d3
      .select(".container")
      .append("svg")
      .attr("width", WIDTH + MARGIN.left + MARGIN.right)
      .attr("height", HEIGHT + MARGIN.top + MARGIN.bottom)
      .on("mousemove", () => {
        selected = null;
        update(); // Call update to apply default greyed-out state when nothing is selected
      });

    const defs = svg.append("defs");

    const container = svg
      .append("g")
      .attr("transform", `translate(${MARGIN.left},${MARGIN.top})`);

    const lineageGroup = container
      .selectAll(".lineage")
      .data([...lineages.values()])
      .enter()
      .append("g")
      .attr("class", "lineage")
      .attr(
        "transform",
        (d) => `translate(${x(d.row)},${y(Math.max(...d.years))})`
      );

    lineageGroup
      .append("rect")
      .attr("fill", (d) => {
        const startYear = Math.min(...d.years);
        const totalYears = Math.max(...d.years) - startYear;
        const stops = [...d.constructors]
          .map((constructor) => {
            return [...constructor.years].map((year) => {
              const color = constructor.color;
              return [
                1 - (year - startYear) / totalYears + 0.2 / totalYears,
                color,
              ];
            });
          })
          .flat();
        return generateGradient(defs, ...stops);
      })
      .attr("rx", 5)
      .attr("ry", 5)
      .attr("x", -x.bandwidth() / 2 + 2)
      .attr("y", -50)
      .attr("width", () => x.bandwidth() - 4)
      .attr(
        "height",
        (d) => y(Math.min(...d.years)) - y(Math.max(...d.years)) + 70
      );

    let title = lineageGroup
      .selectAll(".constructor-title")
      .data((d) => {
        let titles = [];
        for (const constructor of d.constructors) {
          let last;
          const years = [...constructor.years].sort((a, b) => b - a);
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
      .append("g")
      .attr("class", "constructor-title");

    title
      .append("text")
      .attr("class", "title")
      .attr("fill", (d) => d.color)
      .attr("y", (d) => y(d.yearEnd) - y(Math.max(...d.lineage.years)) - 26)
      .text((d) => d.name);

    title
      .append("text")
      .attr("class", "subtitle")
      .attr("y", (d) => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 54)
      .text((d) => (d.action ? `${d.action}` : ""));

    title
      .append("text")
      .attr("class", "subtitle")
      .attr("y", (d) => y(d.yearStart) - y(Math.max(...d.lineage.years)) - 44)
      .text((d) => (d.action ? `${d.name}` : ""));

    container
      .selectAll(".year")
      .data(years)
      .enter()
      .append("text")
      .text((d) => d)
      .attr("x", -MARGIN.left)
      .attr("y", (d) => y(d));

    const carPos = (entry) => {
      const space = getEntrySpacing(entry.totalCars);

      function getEntrySpacing(totalCars) {
        if (totalCars === 2) return 2 * ENTRY_SPACE;
        if (totalCars === 3) return 1.3 * ENTRY_SPACE;
        return ENTRY_SPACE;
      }
      return (
        x(entry.constructor.lineage.row) +
        (entry.car - (entry.totalCars - 1) / 2) * space
      );
    };

    const path = container
      .selectAll(".path")
      .data(links)
      .enter()
      .append("path")
      .attr("class", (d) => `path n-${makeID(d.from.name)}`)
      .classed("skip-season", (d) => d.skippedSeasons)

      .attr("d", (d) => {
        const y1 = Math.round(y(d.from.year));
        const x1 = Math.round(carPos(d.from));
        const y2 = Math.round(y(d.to.year));
        // add tiny amount to avoid straight lines (gradients don't work)
        // https://stackoverflow.com/questions/21638169/svg-line-with-gradient-stroke-wont-display-straight
        const x2 = Math.round(carPos(d.to)) + 0.001;
        const yc = Math.round(y1 + (y2 - y1) / 2);
        const xc = Math.round(x1 + (x2 - x1) / 2);
        return [
          ["M", x1, y1], // move to start coordinate
          ["L", x1, y1 - 10],
          ["Q", x1, y1 - 36, xc, yc], // quadratic curve, with control point and the end point half-way
          ["T", x2, y2 + 10], // infer second quadratic curve to the end
          ["L", x2, y2],
        ]
          .flat()
          .join(" ");
      })
      .attr("stroke", (d) =>
        generateGradient(
          defs,
          [d.from.year === d.to.year ? 0.2 : 0.8, d.from.constructor.color],
          [d.from.year === d.to.year ? 0.8 : 0.2, d.to.constructor.color]
        )
      )
      .attr("stroke-width", "2")
      .on("mousemove", (d) => {
        selected = d.from;
        update();
        d3.event.stopPropagation();
      });

    let swap;

    const entry = container
      .selectAll(".entry")
      .data(entries)
      .enter()
      .append("g")
      .attr("class", (d) => `entry ${d.constructor.id}`)
      .attr("transform", (d) => `translate(${carPos(d)},${y(d.year)})`)
      .on("mousemove", (d) => {
        selected = d;
        update();
        d3.event.stopPropagation();
      })
      .on("click", (d) => {
        if (!DEBUG) return;
        // Swap two drivers. Useful for previewing different orders.
        if (swap) {
          swapEntries(swap, d);
          render();
        } else {
          swap = d;
          update();
        }
      });

    entry
      .append("circle")
      .attr("r", 9)
      .attr("fill", (d) => d.constructor.color);

    entry.append("text").text((d) => d.driver.id);

    const tooltip = svg.append("g").attr("class", "tooltip");
    tooltip.append("rect");
    tooltip.append("text");

    // Initial call to update to apply the default greyed-out state
    update();
  };

  render();
};

init();
