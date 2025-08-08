/**
 * Date utilities for Things CLI
 * Handles date validation, formatting, and AppleScript date operations
 */

/**
 * Validates a date string in YYYY-MM-DD format
 * @param {string} dateStr - Date string to validate
 * @throws {Error} If date format is invalid
 * @returns {Date} Parsed date object
 */
export function validateDateString(dateStr) {
  if (!dateStr) {
    throw new Error('Date cannot be empty');
  }

  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(dateStr)) {
    throw new Error('Due date must be in YYYY-MM-DD format');
  }

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error('Invalid due date provided');
  }

  return date;
}

/**
 * Generates AppleScript code to create a date object
 * This avoids locale issues by explicitly setting date components
 * @param {Date} date - JavaScript Date object
 * @param {string} varName - AppleScript variable name (default: 'tempDate')
 * @returns {string} AppleScript code to create the date
 */
export function generateAppleScriptDate(date, varName = 'tempDate') {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  return [
    `set ${varName} to current date`,
    `set month of ${varName} to ${month}`,
    `set day of ${varName} to ${day}`,
    `set year of ${varName} to ${year}`,
    `set time of ${varName} to 0`
  ].join('\n  ');
}

/**
 * Generates AppleScript date property for use in property lists
 * This creates a date property that can be used when creating new objects
 * @param {Date} date - JavaScript Date object
 * @param {string} varName - AppleScript variable name for the date (default: 'dueDateVar')
 * @returns {Object} Object with dateStatements and propertyValue
 */
export function generateAppleScriptDateProperty(date, varName = 'dueDateVar') {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();

  const dateStatements = [
    `set ${varName} to current date`,
    `set month of ${varName} to ${month}`,
    `set day of ${varName} to ${day}`,
    `set year of ${varName} to ${year}`,
    `set time of ${varName} to 0`
  ].join('\n  ');

  return {
    dateStatements,
    propertyValue: varName
  };
}

/**
 * Parses AppleScript date format to JavaScript Date
 * Handles format: "Wednesday 6 August 2025 at 20:45:46"
 * @param {string} dateStr - AppleScript date string
 * @returns {Date|null} Parsed date or null if parsing fails
 */
export function parseAppleScriptDate(dateStr) {
  if (!dateStr || dateStr === "missing value") return null;
  
  try {
    // AppleScript format: "Wednesday 6 August 2025 at 20:45:46"
    // Remove day of week and "at"
    const cleanStr = dateStr.replace(/^[A-Za-z]+ /, '').replace(' at ', ' ');
    
    // Parse with JavaScript Date constructor
    const date = new Date(cleanStr);
    
    if (!isNaN(date.getTime())) {
      return date;
    }
    
    // If that fails, try manual parsing
    const match = dateStr.match(/(\d{1,2}) ([A-Za-z]+) (\d{4}) at (\d{1,2}):(\d{2}):(\d{2})/);
    if (match) {
      const [, day, month, year, hour, minute, second] = match;
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                         'July', 'August', 'September', 'October', 'November', 'December'];
      const monthIndex = monthNames.indexOf(month);
      
      if (monthIndex !== -1) {
        return new Date(parseInt(year), monthIndex, parseInt(day), 
                       parseInt(hour), parseInt(minute), parseInt(second));
      }
    }
    
    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Converts AppleScript date fields in a todo object to ISO strings
 * @param {Object} todo - Todo object with AppleScript date fields
 * @returns {Object} Todo object with converted date fields
 */
export function convertTodoDateFields(todo) {
  const cleaned = { ...todo };
  
  // Convert "missing value" and "null" strings to actual null
  Object.keys(cleaned).forEach(key => {
    if (cleaned[key] === "missing value" || cleaned[key] === "null") {
      cleaned[key] = null;
    }
  });
  
  // Convert AppleScript dates to ISO strings
  const dateFields = ['creationDate', 'modificationDate', 'dueDate', 'activationDate', 'completionDate', 'cancellationDate'];
  dateFields.forEach(field => {
    if (cleaned[field] && cleaned[field] !== null) {
      try {
        const parsedDate = parseAppleScriptDate(cleaned[field]);
        if (parsedDate) {
          cleaned[field] = parsedDate.toISOString();
        }
      } catch (error) {
        // If parsing fails, keep the original value
        console.error(`Failed to parse date ${field}: ${cleaned[field]}`);
      }
    }
  });
  
  return cleaned;
}