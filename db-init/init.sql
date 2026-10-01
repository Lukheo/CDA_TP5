CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    assignee VARCHAR(50)
);

INSERT INTO tasks (title, completed, assignee) VALUES
('Préparer les affiches', false, 'Lina'),
('Réviser Git', true, 'Noé'),
('Installer le matériel', false, 'Milo');