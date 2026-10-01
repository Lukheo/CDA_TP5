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
  const [titleError, setTitleError] = useState('')
  const [assignee, setAssignee] = useState('')
  const [refresh, setRefresh] = useState(0)

  // useEffect(() => {
  //   loadTasks();
  // }, [filter]);

  // to avoid an ESlint error linked to "calling setState within an effet can trigger cascading renders"
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        let url = `${API_URL}/tasks`;

        if (filter === 'completed') {
          url += '?status=completed';
        } else if (filter === 'uncompleted') {
          url += '?status=uncompleted';
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error('Impossible de récupérer les tâches');
        }

        const data = await response.json();

        setTasks(data.tasks);
        setError('');
      } catch {
        setError("Impossible de contacter l'API.");
      }
    };

    fetchTasks();
  }, [filter, refresh]);

  const addTask = async (event) => {
    event.preventDefault();
    setTitleError('');

    if (!title.trim()) {
      setTitleError('Le titre est obligatoire');
      setMessage('');
      return;
    }

    // extra "safety" if a user finds a way to send without using the input
    if (title.trim().length > 255) {
      setTitleError('Le titre ne peut pas dépasser 255 caractères');
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
          assignee: assignee.trim() || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors de la création');
      };

      setTitle('');
      setAssignee('');
      setMessage(`Tâche "${data.newTask.title}" ajoutée avec succès.`);


      setRefresh(value => value + 1);

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

      setMessage(`Statut de la tâche ${id} modifié.`);
      setRefresh(value => value + 1);
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

      setMessage(`Tâche ${id} supprimée avec succès.`);
      setRefresh(value => value + 1);
    } catch (error) {
      setError(error.message || 'Impossible de supprimer la tâche.');
      setMessage('');
    }
  };

  const removeAssignee = async (id) => {
    try {
      setError('');
      setMessage('');

      const response = await fetch(
        `${API_URL}/tasks/${id}/assignee`,
        { method: 'PATCH' }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erreur lors du retrait du bénévole');
      }

      setMessage('Bénévole retiré de la tâche.');
      setRefresh(value => value + 1);
    } catch (error) {
      setError(error.message || 'Impossible de retirer le bénévole.');
      setMessage('');
    }
  };


  return (
    <div className="app">
      <header>
        <h1>Gestion des tâches</h1>
      </header>
      <main>
        <form onSubmit={addTask} className="task-form">
          <div>
            <div>
              <label htmlFor="titre-tache">
                Nouvelle tâche
              </label>
              <input
                id='titre-tache'
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Titre de la tâche"
                maxLength={255}
                aria-describedby={error ? 'title-error' : undefined}
              />
            </div>

            <div>
              <label htmlFor="assignee">
                Prénom du bénévole
              </label>

              <input
                id="assignee"
                type="text"
                value={assignee}
                maxLength={50}
                onChange={(event) => setAssignee(event.target.value)}
                placeholder="Prénom du bénévole"
              />
            </div>


            <button type="submit">
              Ajouter
            </button>
            {titleError && (
              <p id="task-error" className="title-error" role="alert">
                {titleError}
              </p>
            )}
          </div>
        </form>
        <p className="rgpd-info">
          Le prénom saisi sert uniquement à savoir quel bénévole s&apos;occupe de la tâche.
          Il est supprimé en même temps que la tâche. Pour le faire retirer plus tôt :
          <code>contact@association.example</code>
        </p>

        <div className={`filters ${filter}`} aria-label="Filtrage des tâches">
          <h2>Filtrage des tâches</h2>
          <button
            onClick={() => setFilter('all')}
            aria-pressed={filter === 'all'}
            type='button'>
            Toutes
          </button>

          <button
            onClick={() => setFilter('completed')}
            aria-pressed={filter === 'completed'}
            type='button'>
            Complétées
          </button>

          <button
            onClick={() => setFilter('uncompleted')}
            aria-pressed={filter === 'uncompleted'}
            type='button'>
            Non complétées
          </button>
        </div>

        <div className="infos">
          {message && (
            <p className="success" role="status">
              {message}
            </p>
          )}

          {error && (
            <p className="error" role='alert'>
              {error}
            </p>
          )}
        </div>

        <ul className="tasks">
          {tasks.map((task) => (
            <li key={task.id} className={task.isCompleted ? 'completed' : ''}>
              <div>
                {task.isCompleted && (
                  <p className="completion">Tâche complétée</p>
                )}
                <b>tâche n°{task.id} : </b>
                <span>
                  {task.title}
                </span>
                {task.assignee && (
                  <p className='benevole-nom'>
                    Bénévole : {task.assignee}
                  </p>
                )}
              </div>

              <label>
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTask(task.id)}
                />
                {task.isCompleted
                  ? 'Tâche complétée'
                  : 'Tâche non complétée'}
              </label>
              <div>

                {task.assignee && (
                  <button
                    type="button"
                    onClick={() => removeAssignee(task.id)}
                    aria-label='Retirer le bénévole assigné'
                  >
                    Retirer le bénévole
                  </button>
                )}

                <button
                  onClick={() => deleteTask(task.id)}
                  type='button'
                  aria-label={`Supprimer la tâche ${task.title}`}>
                  Supprimer
                </button>
              </div>
            </li>
          ))}
        </ul>

        {tasks.length === 0 && (
          <p>Aucune tâche à afficher.</p>
        )}
      </main>

    </div>

  )
}

export default App
