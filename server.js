const express = require('express');
const pool = require('./db')
const app = express();
const cors = require('cors');
const Joi = require('joi');
const port = 3000;

app.use(express.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
}));

const taskSchema = Joi.object({
    title: Joi.string().trim().min(1).max(255).required(),
    isCompleted: Joi.boolean().default(false),
    assignee: Joi.string().trim().max(50).allow('', null).default(null),
});


app.get('/test-db', async (req, res) => {
    try {
        const result = await pool.query('SELECT NOW()');

        res.json({
            message: 'Connexion PostgreSQL réussie',
            date: result.rows[0].now
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            error: 'Erreur de connexion à PostgreSQL'
        });
    }
});


app.get('/', (req, res) => {
    res.json({
        message: "bravo"
    });
});

app.post('/tasks', async (req, res) => {

    const { error, value } = taskSchema.validate(req.body);

    if (error) {
        return res.status(400).json({
            message: error.details[0].message,
        });
    }

    const { title, isCompleted, assignee } = value;

    if (!title) {
        return res.status(400).json({
            message: 'We need a title'
        })
    }

    try {
        const result = await pool.query(
            `INSERT INTO tasks (title, completed, assignee)
             VALUES ($1, $2, $3)
             RETURNING *`,
            [title, isCompleted, assignee]
        );

        const task = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            isCompleted: result.rows[0].completed,
            assignee: result.rows[0].assignee
        };

        res.status(201).json({
            message: 'task created',
            newTask: task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error creating task'
        });
    }

});

app.get('/tasks', async (req, res) => {
    const { status } = req.query;

    try {
        let result;

        if (status === undefined) {
            result = await pool.query(
                'SELECT * FROM tasks ORDER BY id'
            );
        } else {

            if (status !== 'completed' && status !== 'uncompleted') {
                return res.status(400).json({
                    message: 'incorrect status'
                });
            }

            const completed = status === 'completed';

            result = await pool.query(
                `SELECT * FROM tasks 
                WHERE completed = $1
                ORDER BY id`,
                [completed]
            );
        }

        const tasks = result.rows.map(task => ({
            id: task.id,
            title: task.title,
            isCompleted: task.completed,
            assignee: task.assignee
        }));

        res.json({
            message: `${tasks.length} ${status ? status + ' ' : ''}tasks found`,
            tasks
        });

    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving tasks'
        });
    }
});

app.put('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);
    const { title, isCompleted, assignee } = req.body;

    if (title === undefined) {
        return res.status(400).json({
            message: "needs a title"
        });
    }

    if (isCompleted === undefined) {
        return res.status(400).json({
            message: "needs a status"
        });
    }

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET title = $1,
                completed = $2,
                assignee = $3
             WHERE id = $4
             RETURNING *`,
            [title, isCompleted, assignee, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'task not found'
            });
        }

        const task = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            isCompleted: result.rows[0].completed,
            assignee: result.rows[0].assignee
        };

        res.json({
            message: 'task modified',
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error modifying task'
        });
    }
});


app.delete('/tasks/:id', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            `DELETE FROM tasks
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'task not found'
            });
        }

        const deletedTask = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            isCompleted: result.rows[0].completed
        };

        res.json({
            message: 'task deleted',
            task: deletedTask
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error deleting task'
        });
    }
});

app.patch('/tasks/:id/completed', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            `UPDATE tasks
             SET completed = NOT completed
             WHERE id = $1
             RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'task not found'
            });
        }

        const task = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            isCompleted: result.rows[0].completed
        };

        res.json({
            message: 'task status toggled',
            task
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: 'Error toggling task status'
        });
    }
});

app.patch('/tasks/:id/assignee', async (req, res) => {
    const id = parseInt(req.params.id);

    try {
        const result = await pool.query(
            `UPDATE tasks
       SET assignee = NULL
       WHERE id = $1
       RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: 'task not found'
            });
        }

        const task = {
            id: result.rows[0].id,
            title: result.rows[0].title,
            isCompleted: result.rows[0].completed,
            assignee: result.rows[0].assignee
        };

        res.json({
            message: 'bénévole retiré',
            task
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'Error removing assignee'
        });
    }
});


app.listen(port, '0.0.0.0', () => {
    console.log(`Serveur Express en cours sur http://localhost:${port}`);
});