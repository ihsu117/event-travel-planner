
/**
 * Parses an ISO 8601 duration string and returns a short formatted string.
 * Example:
 *   formatISODurationShort("P1DT5H20M") 
 *     → "1d 5h 20m"
 *
 * @param {string} duration - The ISO 8601 duration string.
 * @returns {string} A short formatted string.
 */
export function formatISODurationShort(duration) {
    // Regular expression to capture the various parts of an ISO 8601 duration.
    console.log(duration)
    if (!duration || typeof duration !== "string") {
        return "Invalid ISO 8601 duration format";
    }
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
//   console.log(formatISODurationShort("P1DT5H20M"));         // Output: "1d 5h 20m"
//   console.log(formatISODurationShort("P3Y6M4DT12H30M5S"));    // Output: "3y 6mo 4d 12h 30m 5s"
//   console.log(formatISODurationShort("PT15M"));               // Output: "15m"
//   console.log(formatISODurationShort("P1DT2H"));              // Output: "1d 2h"
  

/**
 * Parses an ISO 8601 duration string and returns a formatted string.
 * The output format is: "# day(s), # hour(s) & # minute(s)"
 * If there are no days, the days part is omitted.
 *
 * Note: Weeks are converted to days (1 week = 7 days). Years, months, and seconds are ignored.
 *
 * @param {string} duration - The ISO 8601 duration string.
 * @returns {string} A formatted string.
 */
export function formatISODurationLong(duration) {
  // Log the input for debugging.
  console.log("Input duration:", duration);

  // Validate that we have a defined, non-empty string.
  if (!duration || typeof duration !== "string") {
    return "Invalid ISO 8601 duration format";
  }

  // Regular expression to capture the parts of an ISO 8601 duration.
  const isoRegex = /^P(?:(\d+)Y)?(?:(\d+)M)?(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?)?$/;
  const matches = duration.match(isoRegex);
  if (!matches) {
    return "Invalid ISO 8601 duration format";
  }

  // Parse all components.
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

  // Convert weeks to days.
  const totalDays = components.days + (components.weeks * 7);

  // Use only days, hours, and minutes in our output.
  const days = totalDays;
  const hours = components.hours;
  const minutes = components.minutes;

  // Helper function for proper pluralization.
  const pluralize = (value, singular, plural) =>
    value === 1 ? singular : plural;

  const formattedHours = `${hours} ${pluralize(hours, "hour", "hours")}`;
  const formattedMinutes = `${minutes} ${pluralize(minutes, "minute", "minutes")}`;

  // Build the output string depending on whether days exist.
  if (days > 0) {
    const formattedDays = `${days} ${pluralize(days, "day", "days")}`;
    return `${formattedDays}, ${formattedHours} & ${formattedMinutes}`;
  } else {
    return `${formattedHours} & ${formattedMinutes}`;
  }
}

// Example usage:
console.log(formatISODurationShort("P1DT5H20M"));      // Expected output: "1 day, 5 hours & 20 minutes"
console.log(formatISODurationShort("PT5H20M"));         // Expected output: "5 hours & 20 minutes"
console.log(formatISODurationShort("P2W"));             // For two weeks -> "14 days, 0 hours & 0 minutes"
