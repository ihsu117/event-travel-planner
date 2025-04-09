import { format, formatISO } from "date-fns";

/**
 * Parses an ISO 8601 duration string and returns a short formatted string.
 * Example:
 *   formatISODurationShort("P1DT5H20M") 
 *     → "1d 5h 20m"
 *
 * @param {string} duration - The ISO 8601 duration string.
 * @returns {string} A short formatted string.
 */
export async function formatISODurationShort(duration) {
    // Regular expression to capture the various parts of an ISO 8601 duration.
    const isoRegex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
    const matches = duration.match(isoRegex);
  
    if (!matches) {
      return "Invalid ISO 8601 duration format";
    }
  
    // Extract and parse the duration components.
    const components = {
      years: matches[1] ? parseInt(matches[1], 10) : 0,
      // The first 'M' is months (date portion)
      months: matches[2] ? parseInt(matches[2], 10) : 0,
      weeks: matches[3] ? parseInt(matches[3], 10) : 0,
      days: matches[4] ? parseInt(matches[4], 10) : 0,
      hours: matches[5] ? parseInt(matches[5], 10) : 0,
      // The second 'M' is minutes (time portion)
      minutes: matches[6] ? parseInt(matches[6], 10) : 0,
      seconds: matches[7] ? parseFloat(matches[7]) : 0,
    };
  
    // Define abbreviations for each component.
    const abbreviations = {
      years: "y",
      months: "mo",
      weeks: "w",
      days: "d",
      hours: "h",
      minutes: "m",
      seconds: "s"
    };
  
    // Build the formatted string only including components with non-zero values.
    const parts = [];
    for (let key in components) {
      if (components[key]) {
        parts.push(`${components[key]}${abbreviations[key]}`);
      }
    }
  
    // If no component is non-zero, default to "0s".
    if (parts.length === 0) {
      return "0s";
    }
  
    return parts.join(" ");
  }

  
  // Example usage:
  console.log(formatISODurationShort("P1DT5H20M"));         // Output: "1d 5h 20m"
  console.log(formatISODurationShort("P3Y6M4DT12H30M5S"));    // Output: "3y 6mo 4d 12h 30m 5s"
  console.log(formatISODurationShort("PT15M"));               // Output: "15m"
  console.log(formatISODurationShort("P1DT2H"));              // Output: "1d 2h"
  