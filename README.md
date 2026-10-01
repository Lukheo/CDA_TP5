# TP4 - API creation

## TLDR
> This API uses the express module to create custom routes and can be tested via Postman/ Bruno
> The main goal is to try the basic functions of an API
>
> The project now uses a docker environment to use a database for all the requests.

## Start the API

To start the project, since the provided Dockerfile handles  
```
npm install
npm run
```   
The only necessary step is :  
```
docker compose up -d --build
```

### Required tools

- Docker desktop
- The Bruno extension or something similar to verify the endpoints' function
- DBeaver to verify the base is working properly


## Routes overview

> Routes still work the same user-wise, except they now use SQL queries

| Method | Route |
| --- | --- |
| **GET** | `http://localhost:3000/tasks` |
| **POST** | `http://localhost:3000/tasks` |
| **PUT** | `http://localhost:3000/tasks/:id` |
| **DELETE** | `http://localhost:3000/tasks/:id` |

PATCH Route added by Thomas :

**PATCH** `http://localhost:3000/tasks/:id/completed`

## Routes details

### GET route

> Sends the complete tasks list, with an optional filtering option through status
>
> Filtering : ?status=completed/uncompleted

#### Requests

```
GET http://localhost:3000/tasks
```
-> Result
```
{
  "message": "3 tasks found",
  "tasks": [
    {
      "id": 1,
      "title": "Dire coucou a Lenny",
      "isCompleted": true
    },
    {
      "id": 2,
      "title": "dire coucou",
      "isCompleted": false
    },
    {
      "id": 3,
      "title": "dire coucou",
      "isCompleted": false
    }
  ]
}
```

---

```
GET http://localhost:3000/tasks?status=completed
```
-> Result
```
{
  "message": "1 completed tasks found",
  "filteredTasks": [
    {
      "id": 1,
      "title": "Dire coucou a Lenny",
      "isCompleted": true
    }
  ]
}
```

---

```
GET http://localhost:3000/tasks?status=uncompleted
```
-> Result
```
{
  "message": "2 uncompleted tasks found",
  "filteredTasks": [
    {
      "id": 2,
      "title": "dire coucou",
      "isCompleted": false
    },
    {
      "id": 3,
      "title": "dire coucou",
      "isCompleted": false
    }
  ]
}
```

### POST route

> Creates a new task with the given informations
>
> If no status is given for isCompleted, False by default

#### Requests

```
POST http://localhost:3000/tasks
```
-> Body
```
{
  "title": "dire coucou",
"isCompleted": false
}
```
-> Result
```
{
  "message": "task created",
  "newTask": {
    "id": 3,
    "title": "dire coucou",
    "isCompleted": false
  }
}
```

---

```
POST http://localhost:3000/tasks
```
-> Body
```
{
  "title": "dire coucou"
}
```
-> Result
```
{
  "message": "task created",
  "newTask": {
    "id": 4,
    "title": "dire coucou",
    "isCompleted": false
  }
}
```

---

```
POST http://localhost:3000/tasks
```
-> Body
```
{
}
```
-> Result
```
{
  "message": "We need a title"
}
```

### PUT Route

> Changes a task
>
> If an info is undefined, it sends back a 400 status  
> If the id is incorrect, it sends back a 404 status

#### Requests

```
PUT http://localhost:3000/tasks/1
```
-> Body
```
{
  "title": "Dire coucou a Lenny",
  "isCompleted": true
}
```
-> Result
```
{
  "message": "task modified",
  "task": {
    "id": 1,
    "title": "Dire coucou a Lenny",
    "isCompleted": true
  }
}
```

---

```
PUT http://localhost:3000/tasks/2
```
-> Body
```
{
  "title": "Dire coucou a Lenny"
}
```
-> Result
```
{
  "message": "needs a status"
}
```

---

```
PUT http://localhost:3000/tasks/3
```
-> Body
```
{
  "isCompleted": true
}
```
-> Result
```
{
  "message": "needs a title"
}
```

### DELETE Route

> Deletes the task with the corresponding id
>
> If the id is incorrect, sends back a 404 status

#### Requests

```
DELETE http://localhost:3000/tasks/2
```
-> Result
```
{
  "message": "task deleted",
  "task": {
    "id": 2,
    "title": "dire coucou a lenny"
  }
}
```

---

```
DELETE http://localhost:3000/tasks/2
```
-> Result
```
{
  "message": "task not found"
}
```

### PATCH Route

> Switches the task's status according to its id
>
> If the id is incorrect, sends back a 404 status

#### Requests

```
PATCH http://localhost:3000/tasks/1/completed
```
-> Result
```
{
  "message": "task status toggled",
  "task": {
    "id": 1,
    "title": "dire coucou",
    "isCompleted": true
  }
}
```

---

```
PATCH http://localhost:3000/tasks/5/completed
```
-> Result
```
{
  "message": "task not found"
}
```

## Traitement des données personnelles

### Finalité

L'application collecte le prénom du bénévole afin d'indiquer quelle personne est assignée à une tâche.

Cette donnée est utilisée uniquement dans le cadre de la gestion et du suivi des tâches.

### Données collectées

L'application collecte uniquement :

* le prénom du bénévole ;
* le titre de la tâche ;
* le statut de la tâche.

Le prénom du bénévole est limité à 50 caractères. Aucune donnée supplémentaire telle que le nom de famille, l'adresse e-mail ou le numéro de téléphone n'est collectée.

Les données utilisées pour les tests sont fictives.

### Durée de conservation

Le prénom du bénévole est conservé uniquement pendant la durée de vie de la tâche à laquelle il est associé.

Lorsque la tâche est supprimée, le prénom associé est supprimé en même temps.

Le bénévole peut également demander la suppression de son prénom sans supprimer la tâche.

### Accès aux données

Les données sont utilisées par l'application de gestion des tâches et sont stockées dans la base de données PostgreSQL.

Aucun service tiers de suivi ou d'analyse n'est utilisé par l'application.

### Droits des personnes

La personne concernée peut demander :

* l'accès à ses données ;
* la rectification de ses données ;
* la suppression de ses données.

Pour demander la suppression du prénom associé à une tâche, un bouton « Retirer le bénévole » est disponible directement dans l'application.

Une demande peut également être effectuée à l'adresse :

`contact@association.example`

### Sécurité

Les données sont stockées dans une base PostgreSQL et les accès à la base utilisent des variables d'environnement pour les identifiants de connexion.

Les données personnelles ne sont pas enregistrées volontairement dans les logs de l'API.
