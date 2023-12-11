const fs = require("fs");
const path = require("path");

// ========== INPUTS ==========

const oldData = JSON.parse(process.argv[2]);
const newData = JSON.parse(process.argv[3]);
const contractPath = path.parse(process.argv[4]);

// Skip if same
if (JSON.stringify(oldData) === JSON.stringify(newData)) process.exit(0);

// ========== VISUALIZE LAYOUTS ==========

const oldVisualized = createLayout(oldData);
//console.log(JSON.stringify(oldVisualized, null, 2));

const newVisualized = createLayout(newData);
//console.log(JSON.stringify(newVisualized, null, 2));

const overlayedVisualized = overlayLayouts(oldVisualized, newVisualized);
//console.log(JSON.stringify(overlayedVisualized, null, 2));

const alignedOverlayedVisualized = alignOverlayedLayout(overlayedVisualized, oldVisualized);
//console.log(JSON.stringify(alignedOverlayedVisualized, null, 2));

const alignedOldVisualized = alignOldLayout(oldVisualized, alignedOverlayedVisualized);
//console.log(JSON.stringify(alignedOldVisualized, null, 2));

if (alignedOldVisualized.length !== alignedOverlayedVisualized.length) {
  console.warn(
    "Error: Lengths do not match.\nThis is a bug. Please, submit a new issue: https://github.com/0xPolygon/storage-delta/issues.",
  );
  process.exit(1);
}

// ========== ANALYZE ==========

let reportOld = "";
let reportNew = "";
let i = 0;

for (; i < alignedOldVisualized.length; i++) {
  const oldItem = alignedOldVisualized[i];
  const overlayedItem = alignedOverlayedVisualized[i];

  // overlayedItem can be undefined, "dirty", or a storage item
  // oldItem can be undefined or a storage item

  // Emojis:
  // 🏴 - Dirty
  // 🏳️ - Moved
  // 🏁 - Dirty and moved
  // 🪦 - Removed
  // 🌱 - New

  // Same start
  if (checkStart(overlayedItem, oldItem) === 1) {
    // auto
    if (overlayedItem.label === "dirty") {
      printNew(false, "🪦");
      printOld(true);
      continue;
    }
    if (!isSame(overlayedItem, oldItem)) {
      if (!hasExisted(overlayedItem, oldVisualized)) {
        printNew(true, "🏴");
        printOld(true);
      } else {
        printNew(true, "🏁");
        printOld(true);
      }
    } else {
      printNew(true, "  ");
      printOld(true);
    }
  } else if (checkStart(overlayedItem, oldItem) === 0) {
    if (overlayedItem.label === "dirty") {
      const diff = overlayedItem.end - overlayedItem.start;
      const s = diff === 1 ? "" : "s";

      reportNew += "               " + diff + " dirty byte" + s + "\n";
      printOld(false);
      continue;
    }
    if (!isClean(overlayedItem, oldVisualized)) {
      if (!hasExisted(overlayedItem, oldVisualized)) {
        printNew(true, "🏴");
        printOld(false);
      } else {
        printNew(true, "🏁");
        printOld(false);
      }
    } else {
      if (!hasExisted(overlayedItem, oldVisualized)) {
        printNew(true, "🌱");
        printOld(false);
      } else {
        printNew(true, "🏳️");
        printOld(false);
      }
    }
  } else if (checkStart(overlayedItem, oldItem) === -1) {
    // auto
    printNew(false, "🪦");
    printOld(true);
  }
}

// ========== REPORT FINDINGS ==========

// remove \n from end of report
reportOld = reportOld.slice(0, -1);
reportNew = reportNew.slice(0, -1);

const directoryPath = path.join("./storage_check_report", contractPath.dir);

// Create directories recursively
try {
  fs.mkdirSync(directoryPath, { recursive: true });
} catch (err) {
  if (err.code !== "EEXIST") throw err;
}

const reportOldPath = path.join(directoryPath, contractPath.name + "-OLD");
const reportNewPath = path.join(directoryPath, contractPath.name + "-NEW");

// Write files
fs.writeFileSync(reportOldPath, reportOld);
fs.writeFileSync(reportNewPath, reportNew);

// ========== HELPERS ==========

// IN: Storage layout JSON
// OUT: Easy to read storage layout JSON
function createLayout(data) {
  const result = [];

  function calcStart(item) {
    let slot = parseInt(item.slot);
    let offset = parseInt(item.offset);
    let result = slot * 32 + offset;
    if (slot + offset === 0) result = 0;
    return result;
  }

  for (const item of data.storage) {
    const start = calcStart(item);
    const end = start + parseInt(data.types[item.type].numberOfBytes);
    const json = {
      label: item.label,
      start: start,
      end: end,
      type: processType(data.types[item.type]),
      slot: item.slot,
      offset: item.offset,
    };
    result.push(json);
  }

  return result;
}

// IN: JSON for "type"
// OUT: JSON of "type" with "astId" and "contract" removed from each "member"
// Note: For shallow comparison. TODO: Deep comparison
function processType(type) {
  if (type && type.members && Array.isArray(type.members)) {
    // Iterate through each member of the type
    type.members.forEach((member) => {
      // Delete the "astId" and "contract" properties from the member
      delete member.astId;
      delete member.contract;
    });
  }
  return type;
}

// IN: Old storage layout JSON, new storage layout JSON
// OUT: New storage layout JSON with dirty bytes visible
function overlayLayouts(oldJSON, newJSON) {
  // Step 1: Process old items and mark them as "dirty"
  const processedOldJSON = oldJSON.map((item) => ({
    label: "dirty",
    start: item.start,
    end: item.end,
  }));

  const result = [];

  let newIndex = 0;
  let currentNewItem = newJSON[newIndex];

  for (let oldItem of processedOldJSON) {
    // Step 2: Overlay the items from the new JSON
    while (currentNewItem && currentNewItem.end <= oldItem.start) {
      // Add completely non-overlapping new items
      result.push({ ...currentNewItem });
      newIndex++;
      currentNewItem = newJSON[newIndex];
    }

    if (currentNewItem && currentNewItem.start < oldItem.end) {
      // There is an overlap between the old and new items
      if (currentNewItem.start > oldItem.start) {
        // Add the portion of the old item before the overlap
        result.push({ label: "dirty", start: oldItem.start, end: currentNewItem.start });
        oldItem.start = currentNewItem.start;
      }
      if (currentNewItem.end >= oldItem.end) {
        // The new item completely covers the old item
        oldItem = null; // Old item is entirely overlapped
      } else {
        // The new item partially overlaps the old item
        oldItem.start = currentNewItem.end;
      }
    }

    if (oldItem) {
      // Add any remaining portion of the old item
      result.push({ ...oldItem });
    }
  }

  // Add any remaining new items that do not overlap with old items
  while (currentNewItem) {
    result.push({ ...currentNewItem });
    newIndex++;
    currentNewItem = newJSON[newIndex];
  }

  // Sort the result by the "start" property to ensure the order
  result.sort((a, b) => a.start - b.start);

  return result;
}

// IN: Overlayed storage layout
// OUT: Aligned overlayed storage layout
function alignOverlayedLayout(overlayedVisualized, oldArray) {
  const result = [];
  let overlayIndex = 0;
  let newIndex = 0;

  while (overlayIndex < overlayedVisualized.length && newIndex < oldArray.length) {
    const overlayItem = overlayedVisualized[overlayIndex];
    const oldItem = oldArray[newIndex];

    if (overlayItem.start === oldItem.start) {
      // Copy overlayed item when there's a match
      result.push({ ...overlayItem });
      overlayIndex++;
      newIndex++;
    } else if (overlayItem.start < oldItem.start) {
      // Copy overlayed item when it precedes the old item
      result.push({ ...overlayItem });
      overlayIndex++;
    } else {
      // Insert undefined when oldItem.start is missing in overlayedVisualized
      result.push(undefined);
      newIndex++;
    }
  }

  // Add any remaining overlayed items
  while (overlayIndex < overlayedVisualized.length) {
    result.push({ ...overlayedVisualized[overlayIndex] });
    overlayIndex++;
  }

  // Add undefined for any remaining old items
  while (newIndex < oldArray.length) {
    result.push(undefined);
    newIndex++;
  }

  return result;
}

// IN: Old storage layout, aligned overlayed storage layout
// OUT: Aligned old storage layout
function alignOldLayout(oldArray, alignedOverlayedVisualized) {
  const result = [];
  let overlayIndex = 0;
  let oldIndex = 0;

  while (overlayIndex < alignedOverlayedVisualized.length) {
    const alignedOverlayedItem = alignedOverlayedVisualized[overlayIndex];

    if (alignedOverlayedItem) {
      if (oldIndex < oldArray.length) {
        const oldItem = oldArray[oldIndex];

        if (alignedOverlayedItem.start === oldItem.start) {
          // Copy old item when there's a match
          result.push({ ...oldItem });
          overlayIndex++;
          oldIndex++;
        } else if (alignedOverlayedItem.start < oldItem.start) {
          // Insert undefined when oldItem.start is missing in oldArray
          result.push(undefined);
          overlayIndex++;
        } else {
          // Copy old item when it precedes the aligned overlayed item
          result.push({ ...oldItem });
          oldIndex++;
        }
      } else {
        // No old item to compare, so insert undefined
        result.push(undefined);
        overlayIndex++;
      }
    } else {
      // Skip undefined item in alignedOverlayedVisualized
      overlayIndex++;
    }
  }

  // Handle remaining items in oldArray, if any
  while (oldIndex < oldArray.length) {
    result.push({ ...oldArray[oldIndex] });
    oldIndex++;
  }

  return result;
}

// IN: Storage item, storage item
// OUT: True or false
function isSame(item1, item2) {
  // Compare items by label and type
  if (item1.label === item2.label && JSON.stringify(item1.type) === JSON.stringify(item2.type)) {
    return true; // Items are equal
  } else {
    return false; // Items are not equal
  }
}

// IN: Item from aligned overlayed storage layout, old storage layout
// OUT: True or false
// Note: Check for dirty bytes.
function isClean(item, oldLayout) {
  for (const oldItem of oldLayout) {
    // Check for overlap between the given item and oldItem
    if (item.start < oldItem.end && item.end > oldItem.start) {
      return false; // There is an overlap, not clean
    }
  }
  return true; // No overlaps found, clean
}

// IN: Item from aligned overlayed storage layout, old storage layout
// OUT: True or false
function hasExisted(item, oldLayout) {
  for (const oldItem of oldLayout) {
    if (isSame(item, oldItem)) {
      return true; // The item exists in oldLayout
    }
  }
  return false; // The item does not exist in oldLayout
}

// IN: Item from aligned overlayed storage layout, old storage layout
// OUT: -1 if no start, 0 diff/gt start, 1 if same start
function checkStart(newItem, oldItem) {
  if (newItem === undefined && oldItem !== undefined) {
    return -1; // "new" is undefined
  } else if (newItem !== undefined && oldItem === undefined) {
    return 0; // "old" is undefined
  } else {
    if (newItem.start !== oldItem.start) {
      console.warn(
        "Error: Starts are different.\nThis is a bug. Please, submit a new issue: https://github.com/0xPolygon/storage-delta/issues.",
      );
      process.exit(1);
    }
    return 1; // Both "new" and "old" are defined
  }
}

// IN: Whether line should be empty
// Notes: Adds line to old report.
function printOld(notEmpty) {
  if (!notEmpty) reportOld += "\n";
  else reportOld += formatLine("  ", alignedOldVisualized[i]);
}

// IN: Whether line should be empty, finding indicator
// Notes: Adds line to new report.
function printNew(notEmpty, emoji) {
  if (!notEmpty) reportNew += emoji + "\n";
  else reportNew += formatLine(emoji, alignedOverlayedVisualized[i]);
}

// IN: Finding indicator, storage item
function formatLine(emoji, item) {
  emoji = emoji.padEnd(1, " ");
  let slot = item.slot;
  let offset = item.offset.toString().padEnd(5, " ");
  let label = item.label.padEnd(25, " ");
  let type = item.type.label;

  if (item.offset == 0) {
    slot = slot.padEnd(8, " ");
    offset = "";
  } else {
    slot += ": ";
  }

  return `${emoji}  ${slot}${offset}   ${label}    ${type}\n`;
}
