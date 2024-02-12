import './reset.css';
import './style.css';
import Tagify from '@yaireo/tagify';
import '@yaireo/tagify/dist/tagify.css';
import ToDoList from './todo';
import Display from './display';
import Task from './task';

const display = new Display();
const todo = new ToDoList();

const newProjectModal = document.querySelector(".new-project-form-modal");
const newProjectForm = document.getElementById("new-project-form");
const newTaskModal = document.querySelector(".new-task-form-modal");
const newTaskForm = document.getElementById("new-task-form");

// load projects on document load and add event listeners to elements
document.addEventListener("DOMContentLoaded", () => {
    //display projects on the sidebar
    display.displayProjects(todo.projects);

    //display home page
    displayHome();

    // //display currently selected project's tasks
    // let currentProject = todo.getCurrentProject();
    // display.displayProjectContent(currentProject);

    // add project button shows the project form modal
    const addProjectButton = document.querySelector(".add-proj-btn");
    addProjectButton.addEventListener("click", () => {
        newProjectModal.showModal();
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

    // setAndDisplayProject();
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

    const today = document.querySelector('.today');
    today.addEventListener('click', e => {
        setAndDisplayProject(0);
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
        console.log("click");
        e.stopPropagation();
        delProjModal.close();
        const projectToDelete = todo.getCurrentProject();
        display.removeProject(projectToDelete);
        todo.deleteCurrentProject();

        display.displayHome();
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

    const projectHeaderList = document.querySelectorAll('.task-due-soon-proj-link');
    Array.from(projectHeaderList).forEach(elem => {
        elem.addEventListener('click', e => {
            setAndDisplayProject(Number(elem.dataset.projId));

            const button = document.querySelector(`[data-project-id="${Number(elem.dataset.projId)}"]`);

            display.changePageSelect(button);
        });
    });

    display.displayHome();
}
