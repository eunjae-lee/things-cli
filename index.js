#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { executeAppleScript } from './lib/applescript.js';

const program = new Command();

program
  .name('things')
  .description('CLI for Things 3 task management')
  .version('1.0.0');

// To-do commands
program
  .command('add <title>')
  .usage('<title> [options]')
  .description('Add a new to-do\n\nExamples:\n  things add "Buy groceries"\n  things add "Call dentist" --notes "Schedule cleaning" --due 2024-01-15\n  things add "Review code" --list Today --tags "Work,Urgent"\n  things add "Book flights" --project-id "A1B2C3D4E5F6G7H8I9J0K1L2"')
  .option('-n, --notes <notes>', 'Add notes to the to-do')
  .option('-d, --due <date>', 'Set due date (YYYY-MM-DD)')
  .option('-t, --tags <tags>', 'Add tags (comma-separated)')
  .option('-l, --list <list>', 'Add to specific list (Inbox, Today, Anytime, Someday)')
  .option('-p, --project <project>', 'Add to specific project (by name)')
  .option('--project-id <id>', 'Add to specific project (by ID)')
  .option('-a, --area <area>', 'Add to specific area (by name)')
  .option('--area-id <id>', 'Add to specific area (by ID)')
  .action(async (title, options) => {
    try {
      await addTodo(title, options);
      console.log(chalk.green(`✓ Added to-do: ${title}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command('list [container]')
  .usage('[container] [options]')
  .description('List to-dos from a container\n\nExamples:\n  things list                    # List from Inbox\n  things list Today              # List from Today\n  things list "My Project"       # List from project\n  things list Today --ids        # Show IDs for completion\n  things list A1B2C3D4E5F6G7H8   # List by project/area ID')
  .option('--ids', 'Show IDs for each to-do')
  .action(async (container = 'Inbox', options) => {
    try {
      const todos = await listTodos(container, options.ids);
      if (todos.length === 0) {
        console.log(chalk.yellow(`No to-dos found in ${container}`));
      } else {
        console.log(chalk.blue(`\n${container} (${todos.length} items):`));
        todos.forEach((todo, index) => {
          if (options.ids) {
            console.log(`${index + 1}. ${todo.name} ${chalk.gray(`[${todo.id}]`)}`);
          } else {
            console.log(`${index + 1}. ${todo}`);
          }
        });
      }
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command('list-json [container]')
  .description('List to-dos as JSON with full metadata\n\nExamples:\n  things list-json Today                           # JSON output\n  things list-json Inbox | jq \'.[] | .name\'        # Extract names\n  things list-json Today | jq \'length\'             # Count items\n  things list-json Today | jq \'.[] | select(.status == "open")\'')
  .action(async (container = 'Inbox') => {
    try {
      const todos = await listTodosJson(container);
      console.log(JSON.stringify(todos, null, 2));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command('complete <id>')
  .usage('<id>')
  .description('Mark a to-do as complete by ID\n\nExamples:\n  things list Today --ids                    # Get IDs\n  things complete "A1B2C3D4E5F6G7H8I9J0K1L2"  # Complete by ID')
  .action(async (id) => {
    try {
      const todoName = await completeTodoById(id);
      console.log(chalk.green(`✓ Completed: ${todoName}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

program
  .command('update <id>')
  .usage('<id> [options]')
  .description('Update an existing to-do by ID\n\nExamples:\n  things update "A1B2C3D4E5F6G7H8I9J0K1L2" --title "New title"\n  things update "A1B2C3D4E5F6G7H8I9J0K1L2" --notes "Updated" --tags "Work,Urgent"\n  things update "A1B2C3D4E5F6G7H8I9J0K1L2" --project-id "M3N4O5P6Q7R8S9T0U1V2W3X4"\n  things update "A1B2C3D4E5F6G7H8I9J0K1L2" --no-project --area "Personal"')
  .option('-t, --title <title>', 'Update the title')
  .option('-n, --notes <notes>', 'Update the notes')
  .option('--tags <tags>', 'Update tags (comma-separated)')
  .option('-d, --due <date>', 'Update due date (YYYY-MM-DD)')
  .option('--project <project>', 'Move to project (by name)')
  .option('--project-id <id>', 'Move to project (by ID)')
  .option('--area <area>', 'Move to area (by name)')
  .option('--area-id <id>', 'Move to area (by ID)')
  .option('--no-project', 'Remove from project')
  .option('--no-area', 'Remove from area')
  .action(async (id, options) => {
    try {
      const todoName = await updateTodo(id, options);
      console.log(chalk.green(`✓ Updated: ${todoName}`));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Project commands
program
  .command('project')
  .description('Project management commands\n\nExamples:\n  things project add "Website Redesign"\n  things project add "Mobile App" --area "Work"\n  things project list\n  things project list --ids')
  .addCommand(
    new Command('add')
      .argument('<name>', 'Project name')
      .usage('<name> [options]')
      .description('Add a new project\n\nExamples:\n  things project add "Website Redesign"\n  things project add "Home Renovation" --notes "Kitchen and bathroom" --area "Home"')
      .option('-n, --notes <notes>', 'Add notes to the project')
      .option('-a, --area <area>', 'Add to specific area')
      .action(async (name, options) => {
        try {
          await addProject(name, options);
          console.log(chalk.green(`✓ Added project: ${name}`));
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all projects\n\nExamples:\n  things project list        # List project names\n  things project list --ids  # List with IDs for reference')
      .option('--ids', 'Show IDs for each project')
      .action(async (options) => {
        try {
          const projects = await listProjects(options.ids);
          if (projects.length === 0) {
            console.log(chalk.yellow('No projects found'));
          } else {
            console.log(chalk.blue(`\nProjects (${projects.length}):`));
            projects.forEach((project, index) => {
              if (options.ids) {
                console.log(`${index + 1}. ${project.name} ${chalk.gray(`[${project.id}]`)}`);
              } else {
                console.log(`${index + 1}. ${project}`);
              }
            });
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  );

// Area commands
program
  .command('area')
  .description('Area management commands\n\nExamples:\n  things area add "Health & Fitness"\n  things area list\n  things area list --ids')
  .addCommand(
    new Command('add')
      .argument('<name>', 'Area name')
      .usage('<name>')
      .description('Add a new area\n\nExamples:\n  things area add "Health & Fitness"\n  things area add "Work Projects"')
      .action(async (name) => {
        try {
          await addArea(name);
          console.log(chalk.green(`✓ Added area: ${name}`));
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('list')
      .description('List all areas\n\nExamples:\n  things area list        # List area names\n  things area list --ids  # List with IDs for reference')
      .option('--ids', 'Show IDs for each area')
      .action(async (options) => {
        try {
          const areas = await listAreas(options.ids);
          if (areas.length === 0) {
            console.log(chalk.yellow('No areas found'));
          } else {
            console.log(chalk.blue(`\nAreas (${areas.length}):`));
            areas.forEach((area, index) => {
              if (options.ids) {
                console.log(`${index + 1}. ${area.name} ${chalk.gray(`[${area.id}]`)}`);
              } else {
                console.log(`${index + 1}. ${area}`);
              }
            });
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  );

// Tag commands
program
  .command('tag')
  .description('Tag management commands\n\nExamples:\n  things tag add "Urgent"\n  things tag list')
  .addCommand(
    new Command('list')
      .description('List all tags\n\nExamples:\n  things tag list  # Show all available tags')
      .action(async () => {
        try {
          const tags = await listTags();
          if (tags.length === 0) {
            console.log(chalk.yellow('No tags found'));
          } else {
            console.log(chalk.blue(`\nTags (${tags.length}):`));
            tags.forEach((tag, index) => {
              console.log(`${index + 1}. ${tag}`);
            });
          }
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  )
  .addCommand(
    new Command('add')
      .argument('<name>', 'Tag name')
      .usage('<name>')
      .description('Add a new tag\n\nExamples:\n  things tag add "Urgent"\n  things tag add "Work Projects"')
      .action(async (name) => {
        try {
          await addTag(name);
          console.log(chalk.green(`✓ Added tag: ${name}`));
        } catch (error) {
          console.error(chalk.red(`Error: ${error.message}`));
        }
      })
  );

// Quick entry
program
  .command('quick')
  .description('Open Things Quick Entry panel\n\nExamples:\n  things quick                                    # Empty panel\n  things quick --title "New idea" --notes "Details here"')
  .option('-t, --title <title>', 'Pre-fill title')
  .option('-n, --notes <notes>', 'Pre-fill notes')
  .action(async (options) => {
    try {
      await showQuickEntry(options);
      console.log(chalk.green('✓ Opened Quick Entry panel'));
    } catch (error) {
      console.error(chalk.red(`Error: ${error.message}`));
    }
  });

// Helper functions
function parseAppleScriptDate(dateStr) {
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

// Implementation functions
async function addTodo(title, options) {
  // Validate title
  if (!title || title.trim().length === 0) {
    throw new Error('To-do title cannot be empty');
  }

  // Validate date format if provided
  if (options.due) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(options.due)) {
      throw new Error('Due date must be in YYYY-MM-DD format');
    }
    const dueDate = new Date(options.due);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due date provided');
    }
  }

  // Validate list name if provided
  const validLists = ['Inbox', 'Today', 'Anytime', 'Someday', 'Upcoming'];
  if (options.list && !validLists.includes(options.list)) {
    throw new Error(`Invalid list. Valid lists are: ${validLists.join(', ')}`);
  }

  let script = `tell application "Things3"\n`;
  
  let properties = [`name:"${title.replace(/"/g, '\\"')}"`];
  
  if (options.notes) {
    properties.push(`notes:"${options.notes.replace(/"/g, '\\"')}"`);
  }
  
  if (options.due) {
    const dueDate = new Date(options.due);
    properties.push(`due date:date "${dueDate.toDateString()}"`);
  }
  
  if (options.tags) {
    properties.push(`tag names:"${options.tags.replace(/"/g, '\\"')}"`);
  }
  
  script += `  set newToDo to make new to do with properties {${properties.join(', ')}}`;
  
  if (options.list) {
    script += ` at beginning of list "${options.list}"`;
  } else if (options.projectId) {
    script += ` at beginning of project id "${options.projectId.replace(/"/g, '\\"')}"`;
  } else if (options.project) {
    script += ` at beginning of project "${options.project.replace(/"/g, '\\"')}"`;
  } else if (options.areaId) {
    script += ` at beginning of area id "${options.areaId.replace(/"/g, '\\"')}"`;
  } else if (options.area) {
    script += ` at beginning of area "${options.area.replace(/"/g, '\\"')}"`;
  }
  
  script += `\nend tell`;
  
  return executeAppleScript(script);
}

async function listTodos(container, includeIds = false) {
  let script = `tell application "Things3"\n`;
  
  if (['Inbox', 'Today', 'Anytime', 'Someday', 'Upcoming', 'Logbook'].includes(container)) {
    script += `  set todoList to to dos of list "${container}"\n`;
  } else {
    // Try as project ID first, then project name, then area ID, then area name
    script += `  try\n`;
    script += `    set todoList to to dos of project id "${container}"\n`;
    script += `  on error\n`;
    script += `    try\n`;
    script += `      set todoList to to dos of project "${container}"\n`;
    script += `    on error\n`;
    script += `      try\n`;
    script += `        set todoList to to dos of area id "${container}"\n`;
    script += `      on error\n`;
    script += `        set todoList to to dos of area "${container}"\n`;
    script += `      end try\n`;
    script += `    end try\n`;
    script += `  end try\n`;
  }
  
  if (includeIds) {
    script += `  set todoData to {}\n`;
    script += `  repeat with aTodo in todoList\n`;
    script += `    set end of todoData to {name:(name of aTodo), id:(id of aTodo)}\n`;
    script += `  end repeat\n`;
    script += `  return todoData\n`;
  } else {
    script += `  set todoNames to {}\n`;
    script += `  repeat with aTodo in todoList\n`;
    script += `    set end of todoNames to name of aTodo\n`;
    script += `  end repeat\n`;
    script += `  return todoNames\n`;
  }
  
  script += `end tell`;
  
  const result = await executeAppleScript(script);
  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }
  return Array.isArray(result) ? result : [];
}

async function listTodosJson(container) {
  let script = `tell application "Things3"\n`;
  
  if (['Inbox', 'Today', 'Anytime', 'Someday', 'Upcoming', 'Logbook'].includes(container)) {
    script += `  set todoList to to dos of list "${container}"\n`;
  } else {
    // Try as project first, then area
    script += `  try\n`;
    script += `    set todoList to to dos of project "${container}"\n`;
    script += `  on error\n`;
    script += `    set todoList to to dos of area "${container}"\n`;
    script += `  end try\n`;
  }
  
  script += `  set todoData to {}\n`;
  script += `  repeat with aTodo in todoList\n`;
  script += `    set todoRecord to {}\n`;
  script += `    set todoRecord to todoRecord & {id:(id of aTodo)}\n`;
  script += `    set todoRecord to todoRecord & {name:(name of aTodo)}\n`;
  script += `    set todoRecord to todoRecord & {notes:(notes of aTodo)}\n`;
  script += `    set todoRecord to todoRecord & {status:(status of aTodo as string)}\n`;
  script += `    set todoRecord to todoRecord & {tagNames:(tag names of aTodo)}\n`;
  script += `    set todoRecord to todoRecord & {creationDate:(creation date of aTodo as string)}\n`;
  script += `    set todoRecord to todoRecord & {modificationDate:(modification date of aTodo as string)}\n`;
  script += `    \n`;
  script += `    -- Handle optional dates\n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {dueDate:(due date of aTodo as string)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {dueDate:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {activationDate:(activation date of aTodo as string)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {activationDate:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {completionDate:(completion date of aTodo as string)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {completionDate:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {cancellationDate:(cancellation date of aTodo as string)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {cancellationDate:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    -- Handle optional project and area\n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {project:(name of project of aTodo)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {project:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    try\n`;
  script += `      set todoRecord to todoRecord & {area:(name of area of aTodo)}\n`;
  script += `    on error\n`;
  script += `      set todoRecord to todoRecord & {area:null}\n`;
  script += `    end try\n`;
  script += `    \n`;
  script += `    set end of todoData to todoRecord\n`;
  script += `  end repeat\n`;
  script += `  return todoData\n`;
  script += `end tell`;
  
  const result = await executeAppleScript(script);
  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }
  
  // Clean up the result to handle AppleScript's "missing value" and "null" strings
  const cleanedResult = Array.isArray(result) ? result.map(todo => {
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
          // Parse AppleScript date format: "Wednesday 6 August 2025 at 20:45:46"
          const dateStr = cleaned[field];
          const parsedDate = parseAppleScriptDate(dateStr);
          if (parsedDate) {
            cleaned[field] = parsedDate.toISOString();
          }
        } catch (error) {
          // If parsing fails, keep the original value
          console.error(`Failed to parse date ${field}: ${cleaned[field]}`);
        }
      }
    });
    
    // Parse tag names into array if present
    if (cleaned.tagNames && cleaned.tagNames !== "") {
      cleaned.tags = cleaned.tagNames.split(", ");
    } else {
      cleaned.tags = [];
    }
    delete cleaned.tagNames;
    
    return cleaned;
  }) : [];
  
  return cleanedResult;
}

async function completeTodoById(id) {
  if (!id || id.trim().length === 0) {
    throw new Error('To-do ID cannot be empty');
  }

  const script = `tell application "Things3"
    set aTodo to to do id "${id.replace(/"/g, '\\"')}"
    set todoName to name of aTodo
    set status of aTodo to completed
    return todoName
  end tell`;
  
  return executeAppleScript(script);
}

async function updateTodo(id, options) {
  if (!id || id.trim().length === 0) {
    throw new Error('To-do ID cannot be empty');
  }

  // Validate date format if provided
  if (options.due) {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(options.due)) {
      throw new Error('Due date must be in YYYY-MM-DD format');
    }
    const dueDate = new Date(options.due);
    if (isNaN(dueDate.getTime())) {
      throw new Error('Invalid due date provided');
    }
  }

  let script = `tell application "Things3"\n`;
  script += `  set aTodo to to do id "${id.replace(/"/g, '\\"')}"\n`;
  script += `  set todoName to name of aTodo\n`;

  // Update basic properties
  if (options.title) {
    script += `  set name of aTodo to "${options.title.replace(/"/g, '\\"')}"\n`;
    script += `  set todoName to "${options.title.replace(/"/g, '\\"')}"\n`;
  }

  if (options.notes) {
    script += `  set notes of aTodo to "${options.notes.replace(/"/g, '\\"')}"\n`;
  }

  if (options.tags) {
    script += `  set tag names of aTodo to "${options.tags.replace(/"/g, '\\"')}"\n`;
  }

  if (options.due) {
    // For now, skip due date updates due to AppleScript date parsing complexity
    // This can be implemented later with a more robust date handling approach
    console.log(chalk.yellow('Note: Due date updates are not yet supported'));
  }

  // Handle project/area changes
  if (options.noProject) {
    script += `  delete project of aTodo\n`;
  } else if (options.projectId) {
    script += `  set project of aTodo to project id "${options.projectId.replace(/"/g, '\\"')}"\n`;
  } else if (options.project) {
    script += `  set project of aTodo to project "${options.project.replace(/"/g, '\\"')}"\n`;
  }

  if (options.noArea) {
    script += `  delete area of aTodo\n`;
  } else if (options.areaId) {
    script += `  set area of aTodo to area id "${options.areaId.replace(/"/g, '\\"')}"\n`;
  } else if (options.area) {
    script += `  set area of aTodo to area "${options.area.replace(/"/g, '\\"')}"\n`;
  }

  script += `  return todoName\n`;
  script += `end tell`;

  return executeAppleScript(script);
}

async function addProject(name, options) {
  if (!name || name.trim().length === 0) {
    throw new Error('Project name cannot be empty');
  }

  let script = `tell application "Things3"\n`;
  
  let properties = [`name:"${name.replace(/"/g, '\\"')}"`];
  
  if (options.notes) {
    properties.push(`notes:"${options.notes.replace(/"/g, '\\"')}"`);
  }
  
  script += `  set newProject to make new project with properties {${properties.join(', ')}}`;
  
  if (options.area) {
    script += `\n  set area of newProject to area "${options.area.replace(/"/g, '\\"')}"`;
  }
  
  script += `\nend tell`;
  
  return executeAppleScript(script);
}

async function listProjects(includeIds = false) {
  let script = `tell application "Things3"\n`;
  script += `  set projectList to projects\n`;
  
  if (includeIds) {
    script += `  set projectData to {}\n`;
    script += `  repeat with aProject in projectList\n`;
    script += `    set end of projectData to {name:(name of aProject), id:(id of aProject)}\n`;
    script += `  end repeat\n`;
    script += `  return projectData\n`;
  } else {
    script += `  set projectNames to {}\n`;
    script += `  repeat with aProject in projectList\n`;
    script += `    set end of projectNames to name of aProject\n`;
    script += `  end repeat\n`;
    script += `  return projectNames\n`;
  }
  
  script += `end tell`;
  
  const result = await executeAppleScript(script);
  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }
  return Array.isArray(result) ? result : [];
}

async function addArea(name) {
  if (!name || name.trim().length === 0) {
    throw new Error('Area name cannot be empty');
  }

  const script = `tell application "Things3"
    make new area with properties {name:"${name.replace(/"/g, '\\"')}"}
  end tell`;
  
  return executeAppleScript(script);
}

async function listAreas(includeIds = false) {
  let script = `tell application "Things3"\n`;
  script += `  set areaList to areas\n`;
  
  if (includeIds) {
    script += `  set areaData to {}\n`;
    script += `  repeat with anArea in areaList\n`;
    script += `    set end of areaData to {name:(name of anArea), id:(id of anArea)}\n`;
    script += `  end repeat\n`;
    script += `  return areaData\n`;
  } else {
    script += `  set areaNames to {}\n`;
    script += `  repeat with anArea in areaList\n`;
    script += `    set end of areaNames to name of anArea\n`;
    script += `  end repeat\n`;
    script += `  return areaNames\n`;
  }
  
  script += `end tell`;
  
  const result = await executeAppleScript(script);
  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }
  return Array.isArray(result) ? result : [];
}

async function listTags() {
  const script = `tell application "Things3"
    set tagList to tags
    set tagNames to {}
    repeat with aTag in tagList
      set end of tagNames to name of aTag
    end repeat
    return tagNames
  end tell`;
  
  const result = await executeAppleScript(script);
  if (!result || (Array.isArray(result) && result.length === 0)) {
    return [];
  }
  return Array.isArray(result) ? result : [];
}

async function addTag(name) {
  if (!name || name.trim().length === 0) {
    throw new Error('Tag name cannot be empty');
  }

  const script = `tell application "Things3"
    make new tag with properties {name:"${name.replace(/"/g, '\\"')}"}
  end tell`;
  
  return executeAppleScript(script);
}

async function showQuickEntry(options) {
  let script = `tell application "Things3"\n`;
  
  if (options.title || options.notes) {
    let properties = [];
    if (options.title) properties.push(`name:"${options.title}"`);
    if (options.notes) properties.push(`notes:"${options.notes}"`);
    
    script += `  show quick entry panel with properties {${properties.join(', ')}}\n`;
  } else {
    script += `  show quick entry panel\n`;
  }
  
  script += `end tell`;
  
  return executeAppleScript(script);
}

program.parse();