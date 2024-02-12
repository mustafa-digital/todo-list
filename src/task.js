import _ from 'lodash';
import { isPast } from 'date-fns';

export default class Task {
    notes = "";
    tags;
    static id = 0;
    taskId;
    isDone = false;
    isOverdue;

    constructor(title, description, dueDate, priority, difficulty, tags) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.difficulty = difficulty;
        this.tags = tags;

        this.taskId = Task.id++;

        if (this.dueDate) { this.isOverdue = isPast(this.dueDate); }
    }

    getTitle() {
        return this.title;
    }

    setTitle(newTitle) {
        this.title = newTitle;
    }

    getDescription() {
        return this.description;
    }

    setDescription(newDescription) {
        this.description = newDescription;
    }

    getDueDate() {
        return this.dueDate;
    }

    setDueDate(newDueDate) {
        this.dueDate = newDueDate;
    }

    getPriority() {
        return this.priority;
    }

    setPriority(newPriority) {

        this.priority = newPriority;
    }

    getDifficulty() {
        return this.difficulty;
    }

    setDifficulty(newDifficulty) {
        this.difficulty = newDifficulty;
    }

    setNotes(note) {
        this.notes = note;
    }

    getTags() {
        return this.tags;
    }

    addTag(newTag) {
        this.tags.push(newTag);
    }

    removeTag(tagToRemove) {
        _.remove(this.projectTasks, () => {
            _.isEqual(task, tagToRemove);
        });
    }

    getID() {
        return this.taskId;
    }

    getIsDone() {
        return this.isDone;
    }

    setIsDone(isDone) {
        this.isDone = isDone;
    }

    editTask(title, description, dueDate, priority, difficulty, tags) {
        this.title = title;
        this.description = description;
        this.dueDate = dueDate;
        this.priority = priority;
        this.difficulty = difficulty;
        this.tags = tags;
    }

}



