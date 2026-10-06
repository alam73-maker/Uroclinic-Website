import { geoNaturalEarth1, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const topo = JSON.parse(readFileSync(new URL('../node_modules/world-atlas/countries-110m.json', import.meta.url)));
const countries = feature(topo, topo.objects.countries).features.filter((f) => f.properties?.name !== 'Antarctica');
const width = 960;
const height = 470;
const projection = geoNaturalEarth1().fitSize([width, height], { type: 'FeatureCollection', features: countries });
const path = geoPath(projection).digits(0);
const shades = ['#2f6466', '#3d7577', '#4b8486', '#5e8f91', '#729fa1', '#87b0b1', '#3a6f71'];
const groups = shades.map(() => []);
countries.forEach((f, i) => {
  const d = path(f);
  if (d) groups[(i * 7 + Number(f.id || 0)) % shades.length].push(d);
});
const body = groups.map((g, i) => `<path fill="${shades[i]}" d="${g.join('')}"/>`).join('');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}"><g stroke="#e7e9ea" stroke-width=".6" stroke-linejoin="round">${body}</g></svg>`;
mkdirSync(new URL('../public/', import.meta.url), { recursive: true });
writeFileSync(new URL('../public/world-map.svg', import.meta.url), svg);
console.log('world-map.svg', (svg.length / 1024).toFixed(1) + ' KB');
