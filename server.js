const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let tasks = [];
let nextId = 1;

app.get('/', (req, res) => {
    res.json({
        message: "bravo"
    });
});

app.post('/tasks', (req, res) => {
    const { title, isCompleted } = req.body;

    if (!title) {
        return res.status(400).json({
            message: 'We need a title'
        })
    }

    const newTask = {
        id: nextId++,
        title: title,
        isCompleted: isCompleted ?? false //false by default
    };

    tasks.push(newTask);

    res.status(201).json({
        message: 'task created',
        newTask
    });

});

app.get('/tasks', (req, res) => {
    const { status } = req.query;

    if (status === undefined) {
        return res.json({
            message: `${tasks.length} tasks found`,
            tasks
        });
    };

    if (status !== 'completed' && status !== 'uncompleted') {
        return res.status(400).json({
            message: 'incorrect status'
        });
    };

    const filteredTasks = tasks.filter((task) => {
        if (status === 'completed') {
            return task.isCompleted === true;
        }

        return task.isCompleted === false;
    });

    res.json({
        message: `${filteredTasks.length} ${status} tasks found`,
        filteredTasks
    });
});

app.put('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { title, isCompleted } = req.body;

    const task = tasks.find((task) => task.id === id);

    if (!task) {
        return res.status(404).json({
            message: 'task not found'
        })
    }

    if(title == undefined){
        res.status(400).json({
            message: "needs a title"
        });
    };

    if(isCompleted == undefined){
        res.status(400).json({
            message: "needs a status"
        });
    };
    
    task.title = title;
    task.isCompleted = isCompleted;

    res.json({
        message: 'task modified',
        task
    });
});

app.delete('/tasks/:id', (req, res) => {
    const id = parseInt(req.params.id);

    const taskIndex = tasks.findIndex((task) => task.id === id);

    if (taskIndex === -1) {
        return res.status(404).json({
            message: 'task not found'
        });
    }

    const deletedTask = tasks.splice(taskIndex, 1);

    res.json({
        message: 'task deleted',
        task: deletedTask[0]
    });
});

app.patch('/tasks/:id/completed', (req, res) => {
    const id = parseInt(req.params.id);

    const task = tasks.find(t => t.id === id);

    if (!task) {
        return res.status(404).json({ message: 'task not found' });
    }

    task.isCompleted = !task.isCompleted;

    res.json({
        message: 'task status toggled',
        task
    });
});

app.listen(port, () => {
    console.log(`Serveur Express en cours sur http://localhost:${port}`);
});