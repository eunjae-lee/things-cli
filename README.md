# Things CLI

A command-line interface for Things 3 task management app on macOS. This CLI wraps the Things AppleScript API to provide quick access to your tasks, projects, and areas from the terminal.

## Prerequisites

- macOS
- Things 3 app installed
- Node.js (v14 or higher)

## Installation

1. Clone or download this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make the CLI executable:
   ```bash
   chmod +x index.js
   ```
4. (Optional) Create a symlink for global access:
   ```bash
   ln -s $(pwd)/index.js /usr/local/bin/things
   ```

## Usage

### To-Do Commands

#### Add a new to-do
```bash
# Basic to-do
things add "Buy groceries"
# ✓ Added to-do: Buy groceries

# With options
things add "Call dentist" --notes "Schedule cleaning" --due 2024-01-15 --tags "Health,Personal"
# ✓ Added to-do: Call dentist

# Add to specific list
things add "Review code" --list Today
# ✓ Added to-do: Review code

# Add to project or area (by name)
things add "Book flights" --project "Vacation Planning"
things add "Team meeting" --area Work

# Add to project or area (by ID - more reliable)
things add "Book flights" --project-id "A1B2C3D4E5F6G7H8I9J0K1L2"
things add "Team meeting" --area-id "M3N4O5P6Q7R8S9T0U1V2W3X4"
# ✓ Added to-do: Team meeting
```

#### List to-dos
```bash
# List from Inbox (default)
things list
# 
# Inbox (3 items):
# 1. Buy groceries
# 2. Call dentist
# 3. Read new book

# List from specific containers
things list Today
# 
# Today (2 items):
# 1. Review code
# 2. Team meeting

things list Anytime
# 
# Anytime (1 items):
# 1. Learn Spanish

# List from project or area (by name)
things list "Vacation Planning"
# 
# Vacation Planning (2 items):
# 1. Book flights
# 2. Reserve hotel

things list Work
# 
# Work (3 items):
# 1. Team meeting
# 2. Finish presentation
# 3. Code review

# List from project or area (by ID - more reliable)
things list "A1B2C3D4E5F6G7H8I9J0K1L2"
# 
# A1B2C3D4E5F6G7H8I9J0K1L2 (2 items):
# 1. Book flights
# 2. Reserve hotel

# List with IDs (required for completing tasks)
things list Today --ids
# 
# Today (2 items):
# 1. Review code [A1B2C3D4E5F6G7H8I9J0K1L2]
# 2. Team meeting [M3N4O5P6Q7R8S9T0U1V2W3X4]

# List as JSON with full metadata (perfect for scripting)
things list-json Today
# [JSON output - see JSON section below]

# Empty list
things list Someday
# No to-dos found in Someday
```

#### Complete a to-do
```bash
# Complete by ID (get ID from list --ids command)
things complete "A1B2C3D4E5F6G7H8I9J0K1L2"
# ✓ Completed: Review code

# Error handling
things complete "invalid-id"
# Error: Item not found. Please check the name and try again.
```

#### Update an existing to-do
```bash
# Update title
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --title "New title"
# ✓ Updated: New title

# Update notes and tags
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --notes "Updated notes" --tags "Work,Important"
# ✓ Updated: New title

# Move to different project/area
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --project-id "M3N4O5P6Q7R8S9T0U1V2W3X4"
# ✓ Updated: New title

things update "A1B2C3D4E5F6G7H8I9J0K1L2" --area "Personal"
# ✓ Updated: New title

# Remove from project/area
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --no-project
# ✓ Updated: New title

things update "A1B2C3D4E5F6G7H8I9J0K1L2" --no-area
# ✓ Updated: New title

# Multiple updates at once
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --title "Urgent task" --tags "Urgent,Work" --project-id "X9Y8Z7W6V5U4T3S2R1Q0P9O8"
# ✓ Updated: Urgent task
```

### Project Commands

#### Add a new project
```bash
# Basic project
things project add "Website Redesign"
# ✓ Added project: Website Redesign

# With notes and area
things project add "Home Renovation" --notes "Kitchen and bathroom" --area Home
# ✓ Added project: Home Renovation
```

#### List projects
```bash
things project list
# 
# Projects (4):
# 1. Website Redesign
# 2. Home Renovation
# 3. Vacation Planning
# 4. Mobile App Development

# List projects with IDs
things project list --ids
# 
# Projects (4):
# 1. Website Redesign [A1B2C3D4E5F6G7H8I9J0K1L2]
# 2. Home Renovation [M3N4O5P6Q7R8S9T0U1V2W3X4]
# 3. Vacation Planning [X9Y8Z7W6V5U4T3S2R1Q0P9O8]
# 4. Mobile App Development [F1G2H3I4J5K6L7M8N9O0P1Q2]

# No projects
things project list
# No projects found
```

### Area Commands

#### Add a new area
```bash
things area add "Health & Fitness"
# ✓ Added area: Health & Fitness
```

#### List areas
```bash
things area list
# 
# Areas (3):
# 1. Work
# 2. Personal
# 3. Health & Fitness

# List areas with IDs
things area list --ids
# 
# Areas (3):
# 1. Work [A1B2C3D4E5F6G7H8I9J0K1L2]
# 2. Personal [M3N4O5P6Q7R8S9T0U1V2W3X4]
# 3. Health & Fitness [X9Y8Z7W6V5U4T3S2R1Q0P9O8]

# No areas
things area list
# No areas found
```

### Tag Commands

#### Add a new tag
```bash
things tag add "Urgent"
# ✓ Added tag: Urgent
```

#### List tags
```bash
things tag list
# 
# Tags (5):
# 1. Work
# 2. Personal
# 3. Health
# 4. Urgent
# 5. Shopping

# No tags
things tag list
# No tags found
```

### Quick Entry

Open the Things Quick Entry panel:
```bash
# Empty panel
things quick
# ✓ Opened Quick Entry panel

# Pre-filled
things quick --title "New task" --notes "Some details"
# ✓ Opened Quick Entry panel
```

## Available Lists

- `Inbox` - Default inbox
- `Today` - Today's tasks
- `Anytime` - Anytime tasks
- `Someday` - Someday tasks
- `Upcoming` - Scheduled tasks
- `Logbook` - Completed tasks

## Options

### To-Do Options
- `-n, --notes <notes>` - Add notes
- `-d, --due <date>` - Set due date (YYYY-MM-DD format)
- `-t, --tags <tags>` - Add comma-separated tags
- `-l, --list <list>` - Add to specific list
- `-p, --project <project>` - Add to specific project (by name)
- `--project-id <id>` - Add to specific project (by ID)
- `-a, --area <area>` - Add to specific area (by name)
- `--area-id <id>` - Add to specific area (by ID)

### Update Options
- `-t, --title <title>` - Update the title
- `-n, --notes <notes>` - Update the notes
- `--tags <tags>` - Update tags (comma-separated)
- `--project <project>` - Move to project (by name)
- `--project-id <id>` - Move to project (by ID)
- `--area <area>` - Move to area (by name)
- `--area-id <id>` - Move to area (by ID)
- `--no-project` - Remove from project
- `--no-area` - Remove from area

### List Options
- `--ids` - Show IDs alongside to-do names (required for completing tasks)

### Project/Area List Options
- `--ids` - Show IDs alongside project/area names (required for ID-based operations)

## ID-Based Operations

This CLI uses ID-based completion for reliability and automation:

**Benefits:**
- ✅ **No ambiguity** - Unique IDs prevent confusion with duplicate titles
- ✅ **Special characters** - Works with emojis, quotes, and Unicode in titles  
- ✅ **Automation-friendly** - Perfect for scripts and integrations
- ✅ **Always works** - IDs never change, unlike editable titles

**Workflows:**

**Complete Tasks:**
```bash
# 1. List items with IDs
things list Today --ids

# 2. Copy the ID and complete the task
things complete "A1B2C3D4E5F6G7H8I9J0K1L2"
```

**Update Tasks:**
```bash
# 1. List items with IDs
things list Today --ids

# 2. Update any properties
things update "A1B2C3D4E5F6G7H8I9J0K1L2" --title "New title" --tags "Updated,Important"
```

**Add to Projects/Areas:**
```bash
# 1. List projects/areas with IDs
things project list --ids
things area list --ids

# 2. Use ID when adding tasks
things add "New task" --project-id "A1B2C3D4E5F6G7H8I9J0K1L2"
things add "Another task" --area-id "M3N4O5P6Q7R8S9T0U1V2W3X4"
```

**List from Projects/Areas:**
```bash
# Works with both names and IDs
things list "Project Name"
things list "A1B2C3D4E5F6G7H8I9J0K1L2"
```

## JSON Output

The `list-json` command provides structured data perfect for scripting and automation:

```bash
things list-json Today
```

**Example JSON Output:**
```bash
things list-json Today
```

```json
[
  {
    "id": "A1B2C3D4E5F6G7H8I9J0K1L2",
    "name": "Review code",
    "notes": "Check pull request #42",
    "status": "open",
    "tags": ["Work", "Development"],
    "creationDate": "2025-01-15T09:30:00.000Z",
    "modificationDate": "2025-01-15T09:30:00.000Z",
    "dueDate": "2025-01-16T17:00:00.000Z",
    "activationDate": "2025-01-15T00:00:00.000Z",
    "completionDate": null,
    "cancellationDate": null,
    "project": "Website Redesign",
    "area": "Work"
  },
  {
    "id": "M3N4O5P6Q7R8S9T0U1V2W3X4",
    "name": "Team meeting",
    "notes": "",
    "status": "completed",
    "tags": ["Work", "Meeting"],
    "creationDate": "2025-01-14T14:20:00.000Z",
    "modificationDate": "2025-01-15T10:15:00.000Z",
    "dueDate": null,
    "activationDate": "2025-01-15T00:00:00.000Z",
    "completionDate": "2025-01-15T10:15:00.000Z",
    "cancellationDate": null,
    "project": null,
    "area": "Work"
  }
]
```

**Scripting Examples:**
```bash
# Count open tasks
things list-json Today | jq '[.[] | select(.status == "open")] | length'
# 1

# Get overdue tasks
things list-json Today | jq '.[] | select(.dueDate != null and (.dueDate | fromdateiso8601) < now)'
# {
#   "id": "A1B2C3D4E5F6G7H8I9J0K1L2",
#   "name": "Review code",
#   "dueDate": "2025-01-16T17:00:00.000Z",
#   ...
# }

# List tasks by project
things list-json Anytime | jq 'group_by(.project) | .[] | {project: .[0].project, count: length}'
# {"project": "Website Redesign", "count": 3}
# {"project": "Mobile App", "count": 2}
# {"project": null, "count": 1}

# Get tasks created today
things list-json Inbox | jq --arg today "$(date -u +%Y-%m-%d)" '.[] | select(.creationDate | startswith($today))'
# {
#   "id": "X9Y8Z7W6V5U4T3S2R1Q0P9O8",
#   "name": "Buy groceries",
#   "creationDate": "2025-01-15T14:30:00.000Z",
#   ...
# }

# Get only task names and due dates
things list-json Today | jq '.[] | {name, dueDate}'
# {"name": "Review code", "dueDate": "2025-01-16T17:00:00.000Z"}
# {"name": "Team meeting", "dueDate": null}
```

### Project Options
- `-n, --notes <notes>` - Add notes
- `-a, --area <area>` - Add to specific area

## Examples

```bash
# Daily workflow
things add "Review emails" --list Today --tags "Work,Daily"
# ✓ Added to-do: Review emails

things add "Gym workout" --list Today --area "Health"
# ✓ Added to-do: Gym workout

things list Today
# Today (2 items):
# 1. Review emails
# 2. Gym workout

# Working with IDs
things list Today --ids
# Today (2 items):
# 1. Review emails [A1B2C3D4E5F6G7H8I9J0K1L2]
# 2. Gym workout [M3N4O5P6Q7R8S9T0U1V2W3X4]

things complete "A1B2C3D4E5F6G7H8I9J0K1L2"
# ✓ Completed: Review emails

# JSON output for scripting and automation
things list-json Today | jq '.[] | select(.status == "open")'
# {"id": "M3N4O5P6Q7R8S9T0U1V2W3X4", "name": "Gym workout", "status": "open", ...}

things list-json Inbox | jq 'length'
# 3

# Project management
things project add "Mobile App" --area "Work"
# ✓ Added project: Mobile App

things add "Design mockups" --project "Mobile App" --due 2024-01-20
# ✓ Added to-do: Design mockups

things add "Setup development environment" --project "Mobile App"
# ✓ Added to-do: Setup development environment

# Quick capture
things quick --title "Call mom" --notes "Discuss weekend plans"
# ✓ Opened Quick Entry panel
```

## Error Handling

The CLI provides helpful error messages for common issues:

```bash
# Things 3 not running
things list Today
# Error: Things 3 is not running. Please open Things 3 and try again.

# Invalid date format
things add "Doctor appointment" --due "tomorrow"
# Error: Due date must be in YYYY-MM-DD format

# Invalid list name
things add "New task" --list "InvalidList"
# Error: Invalid list. Valid lists are: Inbox, Today, Anytime, Someday, Upcoming

# Empty title
things add ""
# Error: To-do title cannot be empty

# Invalid ID
things complete "invalid-id"
# Error: Item not found. Please check the name and try again.
```

## Limitations

- macOS only (AppleScript requirement)
- Requires Things 3 to be installed
- Some advanced Things features (like checklists, headings) are not supported
- Date parsing is basic (YYYY-MM-DD format only)

## Contributing

Feel free to submit issues and pull requests to improve the CLI functionality.

## License

MIT License