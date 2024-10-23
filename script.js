let boards = [];
let currentBoard = null;
let currentTheme = 'dark';

function renderBoards() {
    const boardsList = document.getElementById('boardsList');
    boardsList.innerHTML = '';
    boards.forEach((board, index) => {
        const li = document.createElement('li');
        li.className = 'board-item';
        li.innerHTML = `
            <span>${board.name}</span>
            <div class="more-options">
                <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
                <div class="dropdown-content">
                    <a href="#" onclick="renameBoard(${index}); event.stopPropagation();">Rename</a>
                    <a href="#" onclick="deleteBoard(${index}); event.stopPropagation();">Delete</a>
                </div>
            </div>
        `;
        
        // Make the entire li clickable
        li.addEventListener('click', () => openBoard(index));
        
        // Prevent board opening when clicking on more options
        const moreOptions = li.querySelector('.more-options');
        moreOptions.addEventListener('click', (e) => {
            e.stopPropagation();
        });
        
        // Add click event for the ellipsis button
        li.querySelector('.more-btn').addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(e);
        });
        
        boardsList.appendChild(li);
    });
}

function toggleDropdown(index, event) {
    event.stopPropagation(); // Prevent the click from immediately closing the dropdown
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach((dropdown, i) => {
        if (i === index) {
            dropdown.classList.toggle('show');
            // Adjust dropdown position
            const rect = dropdown.getBoundingClientRect();
            if (rect.right > window.innerWidth) {
                dropdown.style.right = '0';
            }
        } else {
            dropdown.classList.remove('show');
        }
    });
}

function createBoard() {
    showModal('Create New Board');
}

function renameBoard(index) {
    showModal('Rename Board', index);
}

function deleteBoard(index) {
    showDeleteModal(index);
}

function openBoard(index) {
    currentBoard = boards[index];
    if (!currentBoard.lists) {
        currentBoard.lists = [];
    }
    renderBoardView();
}

function renderBoardView() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <header>
            <div class="board-header">
                <button onclick="backToBoards()" class="back-button">
                    <i class="fas fa-arrow-left"></i>
                </button>
                <h1 id="boardTitle" class="editable-title">${currentBoard.name}</h1>
            </div>
        </header>
        <div class="board-content">
            <div id="listsContainer" class="lists-container"></div>
        </div>
    `;
    
    const boardTitle = document.getElementById('boardTitle');
    boardTitle.addEventListener('click', makeEditable);

    renderLists();
}

function renderLists() {
    const listsContainer = document.getElementById('listsContainer');
    listsContainer.innerHTML = '';
    
    const sortableListsContainer = document.createElement('div');
    sortableListsContainer.className = 'sortable-lists';
    listsContainer.appendChild(sortableListsContainer);

    currentBoard.lists.forEach((list, listIndex) => {
        const listElement = document.createElement('div');
        listElement.className = 'list';
        listElement.setAttribute('data-list-id', listIndex);
        listElement.innerHTML = `
            <div class="list-header">
                <h3 class="list-title editable-title">${list.name}</h3>
                <div class="more-options">
                    <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
                    <div class="dropdown-content">
                        <a href="#" onclick="deleteList(${listIndex}); event.stopPropagation();">Delete</a>
                    </div>
                </div>
            </div>
            <div class="tasks-container" id="tasksContainer${listIndex}"></div>
            <div class="add-task-button task" onclick="addTask(${listIndex})">
                <span>+ Add Task</span>
            </div>
        `;
        listElement.querySelector('.list-title').addEventListener('click', (e) => makeEditable(e, () => renderLists()));
        listElement.querySelector('.more-btn').addEventListener('click', (e) => toggleDropdown(e));
        sortableListsContainer.appendChild(listElement);
        renderTasks(listIndex);
    });

    // Add "Create List" button
    const createListBtn = document.createElement('div');
    createListBtn.className = 'create-list-btn editable-title';
    createListBtn.textContent = 'Create List';
    createListBtn.addEventListener('click', (e) => makeEditable(e, addList));
    listsContainer.appendChild(createListBtn);

    // Initialize Sortable for lists
    new Sortable(sortableListsContainer, {
        animation: 150,
        ghostClass: 'list-ghost',
        handle: '.list-header',
        onEnd: function(evt) {
            const lists = [...currentBoard.lists];
            const movedList = lists.splice(evt.oldIndex, 1)[0];
            lists.splice(evt.newIndex, 0, movedList);
            currentBoard.lists = lists;
        }
    });
}

function renderTasks(listIndex) {
    const tasksContainer = document.getElementById(`tasksContainer${listIndex}`);
    tasksContainer.innerHTML = '';
    
    if (currentBoard.lists[listIndex].tasks.length === 0) {
        tasksContainer.classList.add('empty');
    } else {
        tasksContainer.classList.remove('empty');
    }

    currentBoard.lists[listIndex].tasks.forEach((task, taskIndex) => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task';
        taskElement.setAttribute('data-task-id', taskIndex);
        taskElement.innerHTML = `
            <span class="task-title" onclick="openTaskDetails(${listIndex}, ${taskIndex})">${task.name}</span>
            <div class="more-options">
                <button class="more-btn"><i class="fas fa-ellipsis-v"></i></button>
                <div class="dropdown-content">
                    <a href="#" onclick="makeTaskEditable(${listIndex}, ${taskIndex}); event.stopPropagation();">Rename</a>
                    <a href="#" onclick="deleteTask(${listIndex}, ${taskIndex}); event.stopPropagation();">Delete</a>
                </div>
            </div>
        `;
        taskElement.querySelector('.more-btn').addEventListener('click', (e) => toggleDropdown(e));
        tasksContainer.appendChild(taskElement);
    });

    // Initialize Sortable for tasks within this list
    new Sortable(tasksContainer, {
        animation: 150,
        ghostClass: 'task-ghost',
        group: 'tasks',
        emptyClass: 'tasks-container-empty',
        dragoverBubble: true,
        forceFallback: false,
        fallbackClass: 'task-ghost',
        onEnd: function(evt) {
            const fromListIndex = parseInt(evt.from.id.replace('tasksContainer', ''));
            const toListIndex = parseInt(evt.to.id.replace('tasksContainer', ''));
            
            const task = currentBoard.lists[fromListIndex].tasks.splice(evt.oldIndex, 1)[0];
            currentBoard.lists[toListIndex].tasks.splice(evt.newIndex, 0, task);
            
            // Re-render both affected lists to update their empty states
            renderTasks(fromListIndex);
            if (fromListIndex !== toListIndex) {
                renderTasks(toListIndex);
            }
        }
    });
}

function addList(newListName) {
    if (newListName && newListName.trim() !== '') {
        currentBoard.lists.push({ name: newListName.trim(), tasks: [] });
        renderLists();
    }
}

function deleteList(listIndex) {
    if (confirm('Are you sure you want to delete this list?')) {
        currentBoard.lists.splice(listIndex, 1);
        renderLists();
    }
}

// Add this helper function to get current user (temporary)
function getCurrentUser() {
    return {
        id: 1,
        name: 'John Doe',
        avatar: 'https://via.placeholder.com/40'
    };
}

// Update the task structure when adding a new task
function addTask(listIndex) {
    const tasksContainer = document.getElementById(`tasksContainer${listIndex}`);
    const taskElement = document.createElement('div');
    taskElement.className = 'task';
    
    // Create a temporary task object
    const newTask = {
        id: Date.now(),
        name: '',
        createdBy: getCurrentUser(),
        createdAt: new Date(),
        description: '',
        comments: [],
        listIndex: listIndex,
        boardName: currentBoard.name,
        listName: currentBoard.lists[listIndex].name
    };
    
    // Add the task to the list but don't render it yet
    currentBoard.lists[listIndex].tasks.push(newTask);
    const taskIndex = currentBoard.lists[listIndex].tasks.length - 1;
    
    // Create editable task element
    taskElement.innerHTML = `<span class="task-title"></span>`;
    const taskTitle = taskElement.querySelector('.task-title');
    
    // Make the title immediately editable
    taskTitle.innerHTML = `<input type="text" class="edit-title-input" placeholder="Enter task name">`;
    const input = taskTitle.querySelector('input');
    
    // Focus the input
    setTimeout(() => input.focus(), 0);
    
    const handleSave = () => {
        const newName = input.value.trim();
        if (newName) {
            currentBoard.lists[listIndex].tasks[taskIndex].name = newName;
            renderTasks(listIndex);
        } else {
            // Remove the task if name is empty
            currentBoard.lists[listIndex].tasks.splice(taskIndex, 1);
            renderTasks(listIndex);
        }
    };
    
    const handleCancel = () => {
        // Remove the task and re-render
        currentBoard.lists[listIndex].tasks.splice(taskIndex, 1);
        renderTasks(listIndex);
    };
    
    input.addEventListener('blur', handleCancel);
    input.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            input.removeEventListener('blur', handleCancel);
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    });
    
    // Append the new task at the end of the tasks container
    tasksContainer.appendChild(taskElement);
}

function deleteTask(listIndex, taskIndex) {
    currentBoard.lists[listIndex].tasks.splice(taskIndex, 1);
    renderTasks(listIndex);
}

function makeEditable(event, callback) {
    const element = event.target;
    const currentText = element.textContent;
    let isProcessing = false;
    let originalText = currentText;  // Store the original text
    
    element.innerHTML = `<input type="text" value="${currentText}" class="edit-title-input">`;
    const input = element.querySelector('input');
    input.focus();
    input.setSelectionRange(0, input.value.length);
    
    const handleSave = () => {
        if (!isProcessing) {
            isProcessing = true;
            saveEdit(input, element, callback);
        }
    };

    const handleCancel = () => {
        if (!isProcessing) {
            isProcessing = true;
            element.textContent = originalText;  // Restore original text
            element.addEventListener('click', (e) => makeEditable(e, callback));
        }
    };
    
    input.addEventListener('blur', handleSave, { once: true });
    input.addEventListener('keydown', function(e) {  // Changed from keypress to keydown
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSave();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    });
}

function saveEdit(input, element, callback) {
    const newText = input.value.trim();
    
    if (element.classList.contains('create-list-btn')) {
        if (newText && newText !== 'Create List') {
            callback(newText);
        }
        element.textContent = 'Create List';
        element.addEventListener('click', (e) => makeEditable(e, callback));
        return;
    }
    
    if (newText && newText !== element.textContent) {
        if (element.id === 'boardTitle') {
            currentBoard.name = newText;
            const boardIndex = boards.findIndex(board => board.name === currentBoard.name);
            if (boardIndex !== -1) {
                boards[boardIndex].name = newText;
            }
        } else if (element.classList.contains('list-title')) {
            const listIndex = Array.from(element.closest('.sortable-lists').children).indexOf(element.closest('.list'));
            currentBoard.lists[listIndex].name = newText;
        } else if (element.classList.contains('task-title')) {
            const listElement = element.closest('.list');
            const listIndex = Array.from(listElement.closest('.sortable-lists').children).indexOf(listElement);
            const taskIndex = Array.from(element.closest('.tasks-container').children).indexOf(element.closest('.task'));
            currentBoard.lists[listIndex].tasks[taskIndex] = newText;
        }
    }
    
    element.textContent = newText || element.textContent;
    element.addEventListener('click', (e) => makeEditable(e, callback));
    if (callback && !element.classList.contains('create-list-btn')) {
        callback();
    }
}

function backToBoards() {
    currentBoard = null;
    document.querySelector('.main-content').style.display = 'block';
    renderMainView();
}

function renderMainView() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <header>
            <h1>My Boards</h1>
        </header>
        <ul id="boardsList"></ul>
        <button id="createBoardBtn">Create New Board</button>
    `;
    renderBoards();
    document.getElementById('createBoardBtn').addEventListener('click', createBoard);
}

function showModal(title, index = -1) {
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const boardNameInput = document.getElementById('boardNameInput');
    const saveBtn = document.getElementById('saveBtn');

    modalTitle.textContent = title;
    modal.style.display = 'block';
    boardNameInput.value = index >= 0 ? boards[index].name : '';
    boardNameInput.focus();

    const handleSave = () => {
        const name = boardNameInput.value.trim();
        if (name) {
            if (index >= 0) {
                boards[index].name = name;
            } else {
                boards.push({ name });
            }
            renderBoards();
            closeModal(modal);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSave();
        } else if (e.key === 'Escape') {
            closeModal(modal);
        }
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);

    saveBtn.onclick = handleSave;

    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target == modal) {
            closeModal(modal);
        }
    };

    // Clean up event listener when modal closes
    modal.addEventListener('close', () => {
        document.removeEventListener('keydown', handleKeyPress);
    });
}

function closeModal(modal) {
    modal.style.display = 'none';
    // Dispatch close event to clean up event listeners
    modal.dispatchEvent(new Event('close'));
}

// Add these new functions for sidebar functionality
function showBoards() {
    document.querySelector('.main-content').style.display = 'block';
    if (currentBoard) {
        renderBoardView();
    } else {
        renderMainView();
    }
}

function showSettings() {
    const mainContent = document.querySelector('.main-content');
    mainContent.innerHTML = `
        <header>
            <h1>Settings</h1>
        </header>
        <div class="settings-container">
            <div class="settings-section">
                <h2>Appearance</h2>
                <div class="setting-item">
                    <label>Interface Theme</label>
                    <select id="themeSelect" onchange="changeTheme(this.value)">
                        <option value="dark" ${currentTheme === 'dark' ? 'selected' : ''}>Dark Mode</option>
                        <option value="light" ${currentTheme === 'light' ? 'selected' : ''}>Light Mode</option>
                    </select>
                </div>
            </div>
            <div class="settings-section">
                <h2>About</h2>
                <div class="about-content">
                    <h3>Kanban Board Application</h3>
                    <p class="version">Version 1.0.0</p>
                    <p class="description">
                        A modern task management application with drag-and-drop functionality, 
                        dark/light themes, and intuitive board organization.
                    </p>
                    <div class="about-details">
                        <p><strong>Created by:</strong> Your Name</p>
                        <p><strong>Created on:</strong> April 2023</p>
                        <p><strong>Last Updated:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    <div class="tech-stack">
                        <p><strong>Built with:</strong></p>
                        <ul>
                            <li>HTML5</li>
                            <li>CSS3</li>
                            <li>JavaScript</li>
                            <li>SortableJS</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function changeTheme(theme) {
    currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    // Save theme preference to localStorage
    localStorage.setItem('theme', theme);
}

function logout() {
    alert('Logout functionality not implemented yet');
    // Implement logout functionality
}

function toggleSidebar() {
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    const toggleBtn = document.getElementById('toggleSidebar');
    
    sidebar.classList.toggle('collapsed');
    mainContent.classList.toggle('sidebar-collapsed');
    
    if (sidebar.classList.contains('collapsed')) {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
    } else {
        toggleBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
    }
}

function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.dropdown-content');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('createBoardBtn').addEventListener('click', createBoard);
    document.getElementById('cancelBtn').addEventListener('click', () => {
        closeModal(document.getElementById('modal'));
    });

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            if (this.textContent.includes('Boards')) {
                showBoards();
            } else if (this.textContent.includes('Settings')) {
                showSettings();
            } else if (this.textContent.includes('Log Out')) {
                logout();
            }
        });
    });

    document.getElementById('toggleSidebar').addEventListener('click', toggleSidebar);

    // Add this new event listener
    document.addEventListener('click', (event) => {
        if (!event.target.matches('.more-btn') && !event.target.closest('.dropdown-content')) {
            closeAllDropdowns();
        }
    });

    // Add this new event listener for Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeAllDropdowns();
        }
    });

    // Initialize with sample boards, lists, and tasks
    boards = [
        {
            name: 'Personal Tasks',
            lists: [
                {
                    name: 'To Do',
                    tasks: [
                        {
                            id: 1,
                            name: 'Buy groceries',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-01'),
                            description: 'Need to buy groceries for the week',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-01'),
                                    content: 'Don\'t forget milk!'
                                }
                            ]
                        },
                        {
                            id: 2,
                            name: 'Pay bills',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-02'),
                            description: 'Need to pay bills for the month',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-02'),
                                    content: 'Don\'t forget to pay the electricity bill!'
                                }
                            ]
                        },
                        {
                            id: 3,
                            name: 'Call dentist',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-03'),
                            description: 'Need to schedule a dental appointment',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-03'),
                                    content: 'Don\'t forget to schedule a dental appointment!'
                                }
                            ]
                        },
                        {
                            id: 4,
                            name: 'Clean house',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-04'),
                            description: 'Need to clean the house',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-04'),
                                    content: 'Don\'t forget to clean the house!'
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'In Progress',
                    tasks: [
                        {
                            id: 5,
                            name: 'Learn JavaScript',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-05'),
                            description: 'Need to learn JavaScript',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-05'),
                                    content: 'Don\'t forget to learn JavaScript!'
                                }
                            ]
                        },
                        {
                            id: 6,
                            name: 'Read book',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-06'),
                            description: 'Need to read a book',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-06'),
                                    content: 'Don\'t forget to read a book!'
                                }
                            ]
                        },
                        {
                            id: 7,
                            name: 'Exercise routine',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-07'),
                            description: 'Need to exercise',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-07'),
                                    content: 'Don\'t forget to exercise!'
                                }
                            ]
                        }
                    ]
                },
                {
                    name: 'Done',
                    tasks: [
                        {
                            id: 8,
                            name: 'Update resume',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-08'),
                            description: 'Need to update resume',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-08'),
                                    content: 'Don\'t forget to update resume!'
                                }
                            ]
                        },
                        {
                            id: 9,
                            name: 'Schedule meeting',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-09'),
                            description: 'Need to schedule a meeting',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-09'),
                                    content: 'Don\'t forget to schedule a meeting!'
                                }
                            ]
                        },
                        {
                            id: 10,
                            name: 'Fix laptop',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-10'),
                            description: 'Need to fix laptop',
                            comments: [
                                {
                                    author: 'John Doe',
                                    date: new Date('2023-04-10'),
                                    content: 'Don\'t forget to fix laptop!'
                                }
                            ]
                        }
                    ]
                }
            ]
        },
        {
            name: 'Work Projects',
            lists: [
                {
                    name: 'Backlog',
                    tasks: [
                        {
                            id: 11,
                            name: 'Research competitors',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Research market competitors and their features',
                            comments: []
                        },
                        {
                            id: 12,
                            name: 'Update documentation',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Update project documentation with new features',
                            comments: []
                        },
                        {
                            id: 13,
                            name: 'Client meeting prep',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Prepare presentation for client meeting',
                            comments: []
                        }
                    ]
                },
                {
                    name: 'In Development',
                    tasks: [
                        {
                            id: 14,
                            name: 'Fix login bug',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Fix login authentication issues',
                            comments: []
                        },
                        {
                            id: 15,
                            name: 'Implement dark mode',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Add dark mode theme to the application',
                            comments: []
                        },
                        {
                            id: 16,
                            name: 'Add drag-and-drop',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Implement drag and drop functionality',
                            comments: []
                        }
                    ]
                },
                {
                    name: 'Testing',
                    tasks: [
                        {
                            id: 17,
                            name: 'Test homepage',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Test homepage functionality',
                            comments: []
                        },
                        {
                            id: 18,
                            name: 'Mobile responsiveness',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Test mobile responsiveness',
                            comments: []
                        },
                        {
                            id: 19,
                            name: 'Cross-browser testing',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Test across different browsers',
                            comments: []
                        }
                    ]
                }
            ]
        },
        {
            name: 'Shopping List',
            lists: [
                {
                    name: 'Groceries',
                    tasks: [
                        {
                            id: 20,
                            name: 'Milk',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy milk',
                            comments: []
                        },
                        {
                            id: 21,
                            name: 'Bread',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy bread',
                            comments: []
                        },
                        {
                            id: 22,
                            name: 'Eggs',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy eggs',
                            comments: []
                        }
                    ]
                },
                {
                    name: 'Electronics',
                    tasks: [
                        {
                            id: 23,
                            name: 'USB cable',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy USB cable',
                            comments: []
                        },
                        {
                            id: 24,
                            name: 'Phone case',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy phone case',
                            comments: []
                        },
                        {
                            id: 25,
                            name: 'Headphones',
                            createdBy: getCurrentUser(),
                            createdAt: new Date('2023-04-11'),
                            description: 'Buy headphones',
                            comments: []
                        }
                    ]
                }
            ]
        }
    ];

    renderMainView();

    // Close delete modal when clicking outside of it
    window.onclick = function(event) {
        const deleteModal = document.getElementById('deleteModal');
        if (event.target == deleteModal) {
            deleteModal.style.display = 'none';
        }
    }

    // Set initial theme from localStorage or default to dark
    const savedTheme = localStorage.getItem('theme') || 'dark';
    currentTheme = savedTheme;
    document.documentElement.setAttribute('data-theme', savedTheme);
});

function showDeleteModal(index) {
    const deleteModal = document.getElementById('deleteModal');
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

    deleteModal.style.display = 'block';

    const handleDelete = () => {
        boards.splice(index, 1);
        renderBoards();
        closeModal(deleteModal);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleDelete();
        } else if (e.key === 'Escape') {
            closeModal(deleteModal);
        }
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);

    confirmDeleteBtn.onclick = handleDelete;
    cancelDeleteBtn.onclick = () => closeModal(deleteModal);

    // Close modal when clicking outside
    deleteModal.onclick = function(event) {
        if (event.target == deleteModal) {
            closeModal(deleteModal);
        }
    };

    // Clean up event listener when modal closes
    deleteModal.addEventListener('close', () => {
        document.removeEventListener('keydown', handleKeyPress);
    });
}

function toggleDropdown(event) {
    event.stopPropagation();
    const dropdown = event.target.closest('.more-options').querySelector('.dropdown-content');
    dropdown.classList.toggle('show');
}

function makeTaskEditable(listIndex, taskIndex) {
    const taskElement = document.querySelector(`#tasksContainer${listIndex} [data-task-id="${taskIndex}"]`);
    const taskTitle = taskElement.querySelector('.task-title');
    const currentText = taskTitle.textContent;
    
    // Close the dropdown
    closeAllDropdowns();
    
    taskTitle.innerHTML = `<input type="text" value="${currentText}" class="edit-title-input">`;
    const input = taskTitle.querySelector('input');
    input.focus();
    input.setSelectionRange(0, input.value.length);
    
    input.addEventListener('blur', () => saveTaskEdit(listIndex, taskIndex, input));
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            saveTaskEdit(listIndex, taskIndex, input);
        }
    });
}

function saveTaskEdit(listIndex, taskIndex, input) {
    const newText = input.value.trim();
    if (newText && newText !== currentBoard.lists[listIndex].tasks[taskIndex]) {
        currentBoard.lists[listIndex].tasks[taskIndex] = newText;
    }
    renderTasks(listIndex);
}

// Update the openTaskDetails function to show task metadata
function openTaskDetails(listIndex, taskIndex) {
    const modal = document.getElementById('taskDetailsModal');
    const taskTitle = document.getElementById('taskTitle');
    const listName = document.getElementById('listName');
    const boardName = document.getElementById('boardName');
    const createdDate = document.getElementById('createdDate');
    const taskDescription = document.getElementById('taskDescription');
    const commentsContainer = document.getElementById('commentsContainer');
    
    const task = currentBoard.lists[listIndex].tasks[taskIndex];
    
    taskTitle.textContent = task.name;
    listName.textContent = currentBoard.lists[listIndex].name;
    boardName.textContent = currentBoard.name;
    createdDate.textContent = new Date(task.createdAt).toLocaleString();
    taskDescription.textContent = task.description || 'No description provided yet.';
    
    // Render comments
    if (task.comments && task.comments.length > 0) {
        commentsContainer.innerHTML = task.comments.map(comment => `
            <div class="comment">
                <div class="comment-header">
                    <span class="comment-author">${comment.author}</span>
                    <span class="comment-date">${new Date(comment.date).toLocaleString()}</span>
                </div>
                <div class="comment-content">${comment.content}</div>
            </div>
        `).join('');
    } else {
        commentsContainer.innerHTML = 'No comments yet.';
    }
    
    modal.style.display = 'block';
    
    const handleKeyPress = (e) => {
        if (e.key === 'Escape') {
            closeModal(modal);
        }
    };

    // Add keyboard event listener
    document.addEventListener('keydown', handleKeyPress);
    
    // Close modal when clicking close button
    document.getElementById('closeTaskDetails').onclick = () => {
        closeModal(modal);
    };
    
    // Close modal when clicking outside
    modal.onclick = function(event) {
        if (event.target == modal) {
            closeModal(modal);
        }
    };

    // Clean up event listener when modal closes
    modal.addEventListener('close', () => {
        document.removeEventListener('keydown', handleKeyPress);
    });
}

