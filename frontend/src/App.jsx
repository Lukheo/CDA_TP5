import { useEffect, useState } from 'react';
// import heroImg from './assets/hero.png'
// import reactLogo from './assets/react.svg'
// import viteLogo from './assets/vite.svg'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL

function App() {
  const [tasks, setTasks] = useState([])
  const [title, setTitle] = useState('')
  const [filter, setFilter] = useState('all')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadTasks = async () => {
    try {
      setError('')

      let url = `${API_URL}/tasks`

      if (filter === 'completed') {
        url += '?status=completed'
      } else if (filter === 'uncompleted') {
        url += '?status=uncompleted'
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error('Impossible de récupérer les tâches');
      }

      const data = await response.json();
      setTasks(data.tasks);

    } catch (error) {
      setError(`Impossible de contacter l'API.`);
    }
  };

  useEffect(() => {
    loadTasks();
  }, [filter]);

  const addTask = async (event) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Le titre est obligatoire');
      setMessage('');
      return;
    }

    try {
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          isCompleted: false,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      };

      setTitle('');
      setMessage('Tâche ajoutée avec succès.');

      loadTasks();

    } catch (error) {
      setError(error.message || `Impossible d'ajouter la tâche`);
      setMessage('');
    }
  };

  const toggleTask = async (id) => {
    try {
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/tasks/${id}/completed`, {
        method: 'PATCH',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la modification');
      };

      setMessage('Statut de la tâche modifié.');
      loadTasks();
    } catch (error) {
      setError(error.message || 'Impossible de modifier la tâche.');
      setMessage('');
    }
  };

  const deleteTask = async (id) => {
    try {
      setError('');
      setMessage('');

      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la suppression');
      }

      setMessage('Tâche supprimée avec succès.');
      loadTasks();
    } catch (error) {
      setError(error.message || 'Impossible de supprimer la tâche.');
      setMessage('');
    }
  };


  return (
    <div className="app">
      <h1>Gestion des tâches</h1>

      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Titre de la tâche"
        />
        <button type="submit">
          Ajouter
        </button>
      </form>

      <div className="filters">
        <button onClick={() => setFilter('all')}>
          Toutes
        </button>

        <button onClick={() => setFilter('completed')}>
          Complétées
        </button>

        <button onClick={() => setFilter('uncompleted')}>
          Non complétées
        </button>
      </div>

      {message && (
        <p className="success">
          {message}
        </p>
      )}

      {error && (
        <p className="error">
          {error}
        </p>
      )}

      <ul className="tasks">
        {tasks.map((task) => (
          <li key={task.id}>
            <span className={task.isCompleted ? 'completed' : ''}>
              {task.title}
            </span>

            <div>
              <button onClick={() => toggleTask(task.id)}>
                {task.isCompleted
                  ? 'Marquer non complétée'
                  : 'Marquer complétée'}
              </button>

              <button onClick={() => deleteTask(task.id)}>
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ul>

      {tasks.length === 0 && (
        <p>Aucune tâche à afficher.</p>
      )}

    </div>
  )
}

export default App
