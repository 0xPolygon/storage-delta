// PREPARE JSONS

const oldObject = JSON.parse(process.argv[2]);
const newObject = JSON.parse(process.argv[3]);

function removeField(jsonArray, fieldToRemove) {
  jsonArray.forEach((json) => {
    if (json.hasOwnProperty("astId")) {
      delete json[fieldToRemove];
    }
  });
}

removeField(oldObject.storage, "astId");
removeField(newObject.storage, "astId");

function jsonsSame(json1, json2) {
  return JSON.stringify(json1) === JSON.stringify(json2);
}

if (jsonsSame(oldObject, newObject)) {
  process.exit(0);
}

let oldStorage = oldObject.storage;
let newStorage = newObject.storage;

// COMPARE

let reportOld = "";
let reportNew = "";

function calcStart(item) {
  let slot = parseInt(item.slot);
  let offset = item.offset;
  let result = slot * 256 + 1 + offset * 8;
  if (slot + offset == 0) result = 0;
  return result;
}

function startsSame(item1, item2) {
  return calcStart(item1) === calcStart(item2);
}

function startsBefore(item1, item2) {
  return calcStart(item1) < calcStart(item2);
}

function isSame(item1, item2) {
  return (
    item1.label === item2.label &&
    item1.type === item2.type &&
    jsonsSame(oldObject.types[item1.type], newObject.types[item2.type])
  );
}

let o = 0;
let n = 0;

while (true) {
  const item1 = oldStorage[o];
  const item2 = newStorage[n];

  if (item1 && item2 && startsSame(item1, item2)) {
    printOld(true);
    printNew(true, isSame(item1, item2) ? "  " : "❗️");
    o++;
    n++;
  } else if (item1 && (!item2 || startsBefore(item1, item2))) {
    printOld(true);
    printNew(false, "🗑️");
    o++;
  } else if (item2 && (!item1 || startsBefore(item2, item1))) {
    printOld(false);
    printNew(true, "✨");
    n++;
  } else {
    break;
  }
}

function printOld(notEmpty) {
  if (!notEmpty) reportOld += "\n";
  else reportOld += formatLine("  ", oldStorage[o]);
}

function printNew(notEmpty, emoji) {
  if (!notEmpty) reportNew += emoji + "\n";
  else reportNew += formatLine(emoji, newStorage[n]);
}

function formatLine(emoji, item) {
  emoji = emoji.padEnd(1, " ");
  let slot = item.slot;
  let offset = item.offset.toString().padEnd(2, " ");
  let label = item.label.padEnd(25, " ");
  let type = item.type;

  if (item.offset == 0) {
    slot = slot.padEnd(8, " ");
    offset = "";
  } else {
    slot += ": ";
  }

  return `${emoji}  ${slot}${offset}   ${label}   ${type}\n`;
}

// REPORT

// remove \n from end of report
reportOld = reportOld.slice(0, -1);
reportNew = reportNew.slice(0, -1);

const fs = require("fs");
const path = require("path");

const filePath = path.parse(process.argv[4]);
const directoryPath = path.join("./storage_check_report", filePath.dir);

// Create directories recursively
try {
  fs.mkdirSync(directoryPath, { recursive: true });
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

const reportOldPath = path.join(directoryPath, filePath.name + "-OLD");
const reportNewPath = path.join(directoryPath, filePath.name + "-NEW");

// Write files
fs.writeFileSync(reportOldPath, reportOld);
fs.writeFileSync(reportNewPath, reportNew);
