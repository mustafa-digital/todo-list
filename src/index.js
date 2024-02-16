import './reset.css';
import './style.css';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import ToDoList from './todo';
import Display from './display';
import Task from './task';
import { populateStorage, getTodoFromStorage } from './storage';
import { differenceInCalendarDays } from 'date-fns';

const display = new Display();
const todo = new ToDoList();

const newProjectModal = document.querySelector(".new-project-form-modal");
const newProjectForm = document.getElementById("new-project-form");
const newTaskModal = document.querySelector(".new-task-form-modal");
const newTaskForm = document.getElementById("new-task-form");

// load projects on document load and add event listeners to elements
document.addEventListener("DOMContentLoaded", () => {

    if (storageAvailable('localStorage')) {
        if (localStorage.length === 0) {
            todo.init();
        } else {
            getTodoFromStorage(todo);
        }
    } else {}

    console.log(todo);

    display.addImgSrc();

    //display projects on the sidebar
    display.displayProjects(todo.projects);

    //display home page
    displayHome();

    // add project button shows the project form modal
    const addProjectButton = document.querySelectorAll(".add-proj-btn");
        addProjectButton.forEach(btn => {
            btn.addEventListener("click", () => {
            newProjectModal.showModal();
        });
    });

    sideLinkListeners();

    // add home link events
    addHomeLinkEvents();

    // adds events to "add-task" buttons
    addTaskButtonEvents();

    // add event listeners to the sidebar project buttons - set this project to current
    projectButtonListeners();

    //add listeners to close modals when clicked outside
    dialogCloseOutOfBounds();

    // add listeners to the modal buttons (cancel, submit)
    dialogEventInit();

    //tagify tag inputs
    tagifyInputs();

    editTaskSubmitEvent();
});

function isClickOutOfBounds(e, dialog) {
    const dialogDimensions = dialog.getBoundingClientRect();
    return (
        e.clientX < dialogDimensions.left ||
        e.clientX > dialogDimensions.right ||
        e.clientY < dialogDimensions.top ||
        e.clientY > dialogDimensions.bottom
    );
}

function dialogCloseOutOfBounds(dia=null) {
    if (dia != null) {
        if (isClickOutOfBounds(e, dia)) {
            dialog.close;
        }     
    }
    else {
        const dialogs = document.querySelectorAll("dialog");
        Array.from(dialogs).forEach( dialog => {
            dialog.addEventListener("mousedown", e => {
                if (isClickOutOfBounds(e, dialog)) {
                    dialog.close();
                }
            });
        });
    }

    const editProjModal = document.querySelector(".edit-proj-modal");
    const editProjImg = document.querySelector(".edit-proj-img");
    window.addEventListener("click", e => {
        e.stopImmediatePropagation();
        if (e.target !== editProjModal && e.target !== editProjImg) {
            if (editProjModal.classList.contains("active-modal")){
                editProjModal.classList.toggle("active-modal");
                editProjModal.style.display = "none";
            }
        }
    });
}

function addHomeLinkEvents() {
    const home = document.querySelector(".home");
    home.addEventListener("click", e => {
        displayHome();
    });

    const logo = document.querySelector('.logo-div a');
    logo.addEventListener("click", e => {
        displayHome();
        display.changePageSelect(home);
    });

    const today = document.querySelector('.today');
    today.addEventListener('click', e => {
        setAndDisplayProject(0);
    });

    const quote = document.querySelector('.quote');
    quote.addEventListener('click', e => {
        displayQuote();
    });


}

function sideLinkListeners() {
    const links = document.querySelectorAll(".home-links a");
    Array.from(links).forEach( link => {
        link.addEventListener("click", e => {
            display.changePageSelect(e.target);
        })
    });
}

function projectButtonListeners() {
    const projectButtonList = document.querySelectorAll(".project-btn-div");
    projectButtonList.forEach( (projectButton) => {
        projectButton.addEventListener("click", (e) => {
            const projectButtonId = Number(projectButton.dataset.projectId);
            setAndDisplayProject(projectButtonId);

            display.changePageSelect(projectButton);
        });
    });
}

function resetTaskForm() {
   newTaskForm.reset()
}

function resetProjectForm() {
    newProjectForm.reset();
}

// Creates new task when modal submit is pressed
function newTaskSubmitEvent() {
    newTaskForm.addEventListener("submit", function(e) {
        const newTask = createTaskFromInput();
        todo.addNewTaskToProject(newTask);
        display.displayTask(newTask);
        projectPageEvents();
    
        // close the modal
        newTaskModal.close();

        storeTaskIsDone();

        // reset the task form
        resetTaskForm();
    });  
}

function editTaskSubmitEvent() {
    const editTaskForm = document.querySelector(".edit-task-form-modal");
    editTaskForm.addEventListener("submit", function(e) {
        e.stopImmediatePropagation();
        const taskTitle = document.querySelector(".edit-task-form-modal input[name=task-name").value;
        const taskDesc = document.querySelector(".edit-task-form-modal textarea[name=task-desc]").value;
        const taskDueDate = document.querySelector(".edit-task-form-modal input[name=task-due-date").value;
        const taskPriorityOptions = document.querySelector(".edit-task-form-modal select[name=task-prio]");
        const taskPrio = taskPriorityOptions.options[taskPriorityOptions.selectedIndex].value; 
        const taskDiff = document.querySelector(".edit-task-form-modal input[name=task-diff]:checked"); 
        let taskDiffVal = null;
        if (taskDiff) {
            taskDiffVal = taskDiff.value;
            taskDiff.checked = false;
        }
        const taskTags = document.querySelector(".edit-task-form-modal input[name=task-tags]").value;

        const taskID = (Number(editTaskForm.dataset.taskId));
         
        const task = todo.getCurrentProject().getProjectTasks().get(taskID);  

        task.editTask(taskTitle, taskDesc, taskDueDate, taskPrio, taskDiffVal, taskTags);

        editTaskForm.close();
        
        display.displayEditedTask(task, taskID);

        editTaskForm.removeAttribute("data-task-id");
        populateStorage(todo);
    });
}

// Creates new project when modal submit is pressed
function newProjectSubmitEvent() {
    // new project form create a project and its button on submit
    newProjectForm.addEventListener("submit", function(e) {
        // get the project name from input
        let newProjectName = document.querySelector(".new-project-form-modal input[type=text]").value;

        // create the new project and then call display to create the project button
        const newProject = todo.createNewProject(newProjectName);
        const newProjectButtonDiv = display.displayNewProject(newProject);

        // add event to project button
        newProjectButtonDiv.addEventListener("click", (e) => {
            const projectButtonId = Number(newProjectButtonDiv.dataset.projectId);
            setAndDisplayProject(projectButtonId);
            display.changePageSelect(e.target);
        });

        // close the modal
        newProjectModal.close();

        // refresh the home page
        displayHome(todo.projects);
        display.changePageSelect(document.querySelector('.home'));

        // reset the project form
        resetProjectForm();
    });
}

function dialogCancelEvent() {
    // makes cancel buttons close modal
    const cancelButtons = document.querySelectorAll(".cancel-btn-modal");
    
    [...cancelButtons].forEach( btn => {
        btn.addEventListener("click", e => {
            e.stopImmediatePropagation();
            const dialog = document.querySelector("dialog[open]");
            dialog.close();

            // reset the forms
            resetProjectForm();
            resetTaskForm();
        });
    });
}

/*
    Adds listeners to dialog elements
    This is called on document load
*/
function dialogEventInit() {
    // submit project form event
    newProjectSubmitEvent();
    
    // submit task form event
    newTaskSubmitEvent();

    // close modal on cancel event
    dialogCancelEvent();
}

/*
    Displays the project page, then calls event functions for elements in the project page
    Called when a sidebar project button has been clicked
*/
function setAndDisplayProject(projectId=todo.getCurrentProject().getProjectID()) {
    let project;
     (projectId === 0) ? project = todo.todayProj : project = todo.projects.get(projectId);
    todo.setCurrentProject(project);
    display.displayProjectContent(project);
    projectPageEvents();
    storeTaskIsDone();
}

/*
    Allows Tagify to create tags from inputs
*/
function tagifyInputs() {
    const tagInputs = document.querySelectorAll("#task-tags");
    Array.from(tagInputs).forEach( tagInput => {
        new Tagify(tagInput, {
            maxTags: 5,
            placeholder: "Write up to 5 tags for this task",
            pattern: "/^.{0,10}$/"
        });
    });
}

/*
    Creates and returns a task based on form inputs
*/
function createTaskFromInput(){
    // get values from inputs
    const taskName = document.querySelector("input[name=task-name]").value;
    const taskDesc = document.querySelector("textarea[name=task-desc]").value; 
    const dueDateInput = document.querySelector("input[name=task-due-date]").value;
    const taskDueDate = dueDateInput; 
    const taskPriorityOptions = document.querySelector("select[name=task-prio]");
    const taskPriority = taskPriorityOptions.options[taskPriorityOptions.selectedIndex].value; 
    const taskDifficulty = document.querySelector("input[name=task-diff]:checked");
    let taskDiffVal = null;
    if (taskDifficulty) 
        taskDiffVal = taskDifficulty.value; 
    const taskTags = document.querySelector("input[name=task-tags]").value; 

    // create a new task and add it to current project
    return new Task(taskName, taskDesc, taskDueDate, taskPriority, taskDiffVal, taskTags);
}

/*
    Gives function to elements on the project page
*/
function projectPageEvents() {
    deleteProjectButtonEvent();
    editProjectButtonEvents();
    addTaskButtonEvents();
    deleteTaskConfirmEvent();
}

function deleteProjectButtonEvent() {
    const delProjButton = document.querySelector(".del-proj-btn");
    const delProjModal = document.querySelector(".del-proj-modal");
    const delProjConfirm = document.querySelector(".del-proj-confirm");
    delProjButton.addEventListener("click", e => {
        delProjModal.showModal();
    });

    delProjConfirm.addEventListener("click", e => {
        e.stopPropagation();
        delProjModal.close();
        const projectToDelete = todo.getCurrentProject();
        display.removeProject(projectToDelete);
        todo.deleteCurrentProject();

        display.displayHome(todo.projects);
    });
}

function editProjectButtonEvents() {
    const editProjModalBtn = document.querySelector(".edit-proj-modal-btn");
    const editProjModal = document.querySelector(".edit-proj-modal");
    

    editProjModalBtn.addEventListener("click", e => {
        editProjModal.classList.toggle("active-modal");

        if (editProjModal.classList.contains("active-modal")) {
            editProjModal.style.display = "grid";
        }
        else {
            editProjModal.style.display = "none";
        }
    });

    const editProjBtn = document.querySelector(".edit-proj-btn");
    const editProjFormModal = document.querySelector(".edit-project-form-modal");
    let editProjNameInput = document.querySelector(".edit-project-form-modal input[type=text]");
    editProjBtn.addEventListener("click", e => {
        editProjFormModal.showModal();

        editProjNameInput.value = todo.getCurrentProject().getProjectName();
    });

    editProjFormModal.addEventListener("submit", e => {
        todo.getCurrentProject().setProjectName(editProjNameInput.value);
        display.editProject(todo.getCurrentProject());
    });
}

/*
    Gives function to add Task button within project page
    This is called after a new page has been displayed
*/
function addTaskButtonEvents() {
    const taskButtons = document.getElementsByClassName("add-task-btn");
    Array.from(taskButtons).forEach( button => {
        button.addEventListener("click", () => {
            newTaskModal.showModal();
        });
    });
}

/* 
    adds event listeners to the delete task confirm buttons in modal
*/
function deleteTaskConfirmEvent() {
    const taskDeleteButtons = document.querySelectorAll(".del-task-confirm");
    Array.from(taskDeleteButtons).forEach( btn => {
        btn.addEventListener("click", e => {
            e.stopImmediatePropagation();
            const taskToDeleteId = Number(btn.dataset.taskId);
            todo.deleteTaskFromProject(taskToDeleteId);
            setAndDisplayProject();

            // close the open modal
            const modal = document.querySelector("dialog[open]");
            modal.close();
        });
    });
}

function displayHome() {
    // tasks due soon - traverse through all projects and save the tasks with due dates within 3 days, sort the list by earliest due date to latest
    const dueSoonList = todo.getTasksDueSoon();
    if (dueSoonList) {
        display.displayHomeDueSoon(dueSoonList);
    }

    projectHeaderLinks();

    display.displayHome(todo.projects);


    const myProjectBtns = document.querySelectorAll('.go-project-btn');
    myProjectBtns.forEach(btn => {
        btn.addEventListener('click', e => {
            setAndDisplayProject(Number(btn.dataset.goProjectId));

            const button = document.querySelector(`[data-project-id="${Number(btn.dataset.goProjectId)}"]`);
            display.changePageSelect(button);
        });
    });
}

function projectHeaderLinks() {
    const projectHeaderList = document.querySelectorAll('.task-due-soon-proj-link');
    Array.from(projectHeaderList).forEach(elem => {
        elem.addEventListener('click', e => {
            setAndDisplayProject(Number(elem.dataset.projId));

            const button = document.querySelector(`[data-project-id="${Number(elem.dataset.projId)}"]`);

            display.changePageSelect(button);
        });
    });
}

function displayQuote() {

    const prevQuoteDate = Date.parse(JSON.parse(localStorage.getItem('quoteDate')));

    if (prevQuoteDate) {
        const currentDate = new Date().getTime();
        if (differenceInCalendarDays(currentDate, prevQuoteDate) >= 1) {
            getQuote().then(res => {
                display.displayQuote(res.content, res.author);
                localStorage.setItem('quoteDate', JSON.stringify(new Date()));
                localStorage.setItem('quote', res.content);
                localStorage.setItem('quoteAuthor', res.author);
            });
        } else {
            const quote = localStorage.getItem('quote');
            const author = localStorage.getItem('quoteAuthor');

            display.displayQuote(quote, author);
        }

    }
    else {
        getQuote().then(res => {
            display.displayQuote(res.content, res.author);
            localStorage.setItem('quoteDate', JSON.stringify(new Date()));
            localStorage.setItem('quote', res.content);
            localStorage.setItem('quoteAuthor', res.author);
        });
    }
}

async function getQuote() {
    const url = "https://api.quotable.io/random?inspirational";
    const request = new Request(url);

    const res =  await fetch(request);

    return await res.json();
}

const searchForm = document.querySelector('.search-form');
searchForm.addEventListener('submit', e => {
    e.preventDefault();

    const searchVal = document.querySelector('input#task-search').value;
    const result = todo.searchTasks(searchVal.toLowerCase());

    display.displaySearchResults(searchVal, result);
    projectHeaderLinks();

    document.querySelector('input#task-search').value = '';

    display.changePageSelect(null);
});

function storageAvailable(type) {
    let storage;
    try {
      storage = window[type];
      const x = "__storage_test__";
      storage.setItem(x, x);
      storage.removeItem(x);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        // everything except Firefox
        (e.code === 22 ||
          // Firefox
          e.code === 1014 ||
          // test name field too, because code might not be present
          // everything except Firefox
          e.name === "QuotaExceededError" ||
          // Firefox
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        // acknowledge QuotaExceededError only if there's something already stored
        storage &&
        storage.length !== 0
      );
    }
}

function storeTaskIsDone() {
    const checkboxes = document.querySelectorAll('.check-task');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', e => {
            populateStorage(todo);
        });
    });
}
