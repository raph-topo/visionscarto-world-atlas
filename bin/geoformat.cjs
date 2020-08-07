#!/usr/bin/env node

var commander = require("commander");

commander
    .version(require("../package.json").version)
    .usage("[options]")
    .description("Pretty-print GeoJSON.")
    .option("-p, --precision <value>", "number of output digits after the decimal point", 14)
    .parse(process.argv);

process.stdin.setEncoding('utf8');

let json = "";
process.stdin.on('readable', () => {
  const chunk = process.stdin.read();
  if (chunk !== null) {
    json += chunk;
  }
});
process.stdin.on('end', () => { 
  console.log(geoformat(commander.precision)(JSON.parse(json)));
});


function geoformat(n, exclude = [], align = true) {
  if (typeof n === "undefined") n = 14;
  function q(o) {
    if (
      align &&
      typeof o === "object" &&
      typeof o[0] === "object" &&
      typeof o[0][0] === "number"
    )
      return "°°°[" + o.map(q).join(",") + "]°°°";
    if (align && typeof o === "object" && typeof o[0] === "number")
      return "°°°[" + o.map(q).join(",") + "]°°°";
    if (typeof o === "object") return o.map(q);
    if (typeof o === "number") return +o.toFixed(n);
    return o;
  }
  return function(x) {
    let st = JSON.stringify(
      x,
      function(key, val) {
        if (key === "coordinates") {
          return q(val);
        }
        if (exclude.indexOf(key) > -1) return undefined;
        return val;
      },
      2
    );
    return align
      ? st
          .replace(/"°°°/g, "")
          .replace(/°°°",\n */g, ", ")
          .replace(/°°°"/g, "")
          .replace(/°°°/g, "")
          // no repeats
          .replace(/(\[[\.\-0123456789]+,[\.\-0123456789]+\])(,\1)+,/g, '$1,')
      : st;
  };
}
