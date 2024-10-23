# Kanban Board Application

## Current Implementation

This project is a simple Kanban board application implemented with vanilla HTML, CSS, and JavaScript.

### Features
- Board Management:
  - Create, rename, and delete boards
  - In-place editing for board names
  - Board navigation and state management
  
- List Management:
  - Create, rename, and delete lists
  - Drag and drop to reorder lists
  - Dynamic list creation with editable titles
  
- Task Management:
  - Create, rename, and delete tasks
  - Drag and drop tasks within and between lists
  - Task details modal with metadata (creation date, creator, etc.)
  - Task editing through dropdown menu
  
- User Interface:
  - Responsive design with collapsible sidebar
  - Dark/Light theme switching with persistence
  - Settings page with theme controls
  - Modern and clean UI with consistent styling
  
- Interactive Features:
  - Smooth drag-and-drop animations
  - Visual feedback during drag operations
  - Empty list drop targets
  - Dropdown menus with ellipsis buttons
  
- Keyboard Navigation:
  - Enter to save changes
  - Escape to close modals and dropdowns
  - Keyboard shortcuts for common actions
  
- Data Structure:
  - Sample data with multiple boards, lists, and tasks
  - Task metadata (creator, creation date, comments)
  - Proper state management

### Files
- `index.html`: Main HTML structure
- `styles.css`: Styling for the application
- `script.js`: JavaScript functionality

### Dependencies
- SortableJS: For drag-and-drop functionality
- Font Awesome: For icons
- Google Fonts (Roboto): For typography

## Planned Future Tech Stack

### Front-End
- React
- Tailwind CSS
- JavaScript (with drag-and-drop API or SortableJS)

### Back-End
- Node.js
- Express.js

### Database
- MongoDB (NoSQL) or PostgreSQL (SQL)

### Authentication
- JWT or OAuth (Google/Facebook login)

### Real-Time Features (Optional)
- Socket.IO for real-time updates

### Deployment
- Front-end: Vercel
- Back-end: Heroku or DigitalOcean
- Database: MongoDB Atlas

## Getting Started

To run the current version of the application:

1. Clone this repository
2. Open `index.html` in a web browser

## Changelog
### [0.7.6] - 2023-04-XX
- Added Escape key functionality to close dropdowns
- Improved keyboard navigation throughout the application

### [0.7.5] - 2023-04-XX
- Added keyboard shortcuts for modals (Enter to save, Escape to close)
- Improved modal interaction with keyboard support
- Added proper cleanup for event listeners

### [0.7.4] - 2023-04-XX
- Changed task interaction behavior
- Added placeholder for task details modal
- Fixed task rename functionality through dropdown menu
- Prepared structure for future task details implementation

### [0.7.3] - 2023-04-XX
- Added sample data with multiple lists and tasks for testing
- Improved initial user experience with pre-populated boards

### [0.7.2] - 2023-04-XX
- Fixed list height to be dynamic based on content
- Improved empty list behavior for drag and drop
- Enhanced visual feedback when dragging tasks to empty lists

### [0.7.1] - 2023-04-XX
- Improved drag-and-drop functionality for empty lists
- Added visual feedback when dragging tasks over empty lists
- Fixed list height issues when empty
- Added smooth transitions for task container height changes

### [0.7.0] - 2023-04-XX
- Added drag-and-drop functionality using SortableJS
- Implemented list reordering with smooth animations
- Added ability to drag tasks between lists
- Improved visual feedback during drag operations

### [0.6.4] - 2023-04-XX
- Fixed icon visibility in light mode
- Improved color contrast for buttons and icons in both themes

### [0.6.3] - 2023-04-XX
- Fixed sidebar button text visibility in light mode
- Improved text contrast for better readability in both themes

### [0.6.2] - 2023-04-XX
- Fixed sidebar button text visibility in light mode
- Improved theme-specific text colors for better contrast

### [0.6.1] - 2023-04-XX
- Improved light mode color scheme for better visibility
- Added consistent shadows to UI elements
- Fixed button text contrast issues
- Enhanced overall visual comfort in both themes

### [0.6.0] - 2023-04-XX
- Added theme switching functionality (Dark/Light mode)
- Implemented settings page with theme controls
- Added theme persistence using localStorage
- Created comprehensive theme styling system for future features

### [0.5.6] - 2023-04-XX
- Fixed navigation between boards view and settings
- Improved visibility handling of main content when switching views

### [0.5.5] - 2023-04-XX
- Fixed navigation issue when returning to boards view from settings
- Improved board state management when switching between views

### [0.5.4] - 2023-04-XX
- Fixed bug causing duplicate list creation after animation
- Improved list creation process to prevent unintended behavior

### [0.5.3] - 2023-04-XX
- Fixed bug causing duplicate list creation
- Improved list creation process to prevent unintended behavior

### [0.5.2] - 2023-04-XX
- Implemented in-place editing for the "Create List" button
- Improved list creation process to match the editing style of board and list names

### [0.5.1] - 2023-04-XX
- Fixed positioning of editable text fields to maintain consistency with non-editable text

### [0.5.0] - 2023-04-XX
- Made the board view background transparent
- Removed pre-created lists when opening a board
- Changed "Add List" button to "Create List" and placed it at the end of the lists row
- Implemented dynamic list creation and positioning

### [0.4.0] - 2023-04-XX
- Implemented individual board view with lists and tasks
- Added functionality to create and manage lists within boards
- Added functionality to create, edit, and delete tasks within lists
- Updated UI to display lists and tasks in a horizontal layout

### [0.3.1] - 2023-04-XX
- Fixed the size of the board title editing field to match the original title size

### [0.3.0] - 2023-04-XX
- Added functionality to edit board name by clicking on it in the board view
- Implemented in-place editing for board names

### [0.2.0] - 2023-04-XX
- Added individual board view functionality
- Implemented modals for create, rename, and delete actions
- Added dropdown menu for board options (rename and delete)
- Improved sidebar with collapsible functionality
- Added close-on-click-outside behavior for dropdowns and modals

### [0.1.0] - 2023-04-XX
- Initial implementation of Kanban board application
- Created basic structure with HTML, CSS, and JavaScript
- Implemented board listing, creation, renaming, and deletion
- Added sidebar with user profile

## Future Development

The plan is to migrate this application to a full-stack solution using the tech stack mentioned above. This will involve:

1. Converting the front-end to a React application
2. Implementing a Node.js back-end with Express
3. Setting up a database for persistent storage
4. Adding user authentication
5. Implementing real-time updates (optional)
6. Deploying the application to the planned platforms

## Potential Next Features
1. Task details (due dates, descriptions, labels)
2. Data persistence using localStorage
3. More settings options
4. Improved mobile responsiveness
5. Keyboard shortcuts for common actions
