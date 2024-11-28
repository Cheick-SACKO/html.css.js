const apiUrl = 'http://localhost:8090/taches'; 
const taskTableBody = document.getElementById('taskTableBody');
const todoModal = document.getElementById('todoModal');

// Affichage de la fenêtre modale pour ajouter une tâche
document.getElementById('add-task-btn').addEventListener('click', () => {
  reinitialiserChampsModale(); // Réinitialise les champs de la modale
  todoModal.style.display = 'flex';
});

// Fermeture de la fenêtre modale
document.getElementById('close-modal-btn').addEventListener('click', () => {
  todoModal.style.display = 'none';
});

// Chargement de toutes les tâches depuis l'API
async function chargerTaches() {
  const response = await fetch(apiUrl);
  const tasks = await response.json();
  afficherTaches(tasks);
}

// Affichage des tâches dans le tableau
function afficherTaches(tasks) {
  taskTableBody.innerHTML = '';
  tasks.forEach(task => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${task.tache}</td>
      <td>${task.description}</td>
      <td>${task.categorie}</td>
      <td>${new Date(task.date).toLocaleString()}</td>
      <td>${task.priorite}</td>
      <td>${task.etat}%</td>
      <td>
        <button onclick="modifierTache(${task.id})">✏️</button>
        <button onclick="supprimerTache(${task.id})">❌</button>
      </td>
    `;
    taskTableBody.appendChild(row);
  });
}

// Enregistre ment d'une nouvelle tâche et mis à jour d'une tâche existante
document.getElementById('save-task-btn').addEventListener('click', async () => {
  const nouvelleTache = {
    tache: document.getElementById('task-name').value,
    description: document.getElementById('task-desc').value,
    categorie: document.getElementById('task-cat').value,
    date: `${document.getElementById('task-date').value}T${document.getElementById('task-time').value}`,
    priorite: document.getElementById('task-priority').value,
    etat: document.getElementById('task-status').value,
  };

  if (document.getElementById('save-task-btn').dataset.id) {
    // Mise à jour d'une tâche existante
    const taskId = document.getElementById('save-task-btn').dataset.id;
    await fetch(`${apiUrl}/${taskId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouvelleTache),
    });
    delete document.getElementById('save-task-btn').dataset.id;
  } else {
    // Ajout d'une nouvelle tâche
    await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(nouvelleTache),
    });
  }

  todoModal.style.display = 'none';
  chargerTaches();
});

// Suppression d'une tâche
async function supprimerTache(id) {
  await fetch(`${apiUrl}/${id}`, { method: 'DELETE' });
  chargerTaches();
}

// Filtrage des tâches par état d'avancement(à faire ou déjà fait)
async function filtrerTaches(typeFiltre) {
  const response = await fetch(apiUrl);
  let tasks = await response.json();

  if (typeFiltre === 'todo') {
    tasks = tasks.filter(task => task.etat < 100); // État < 100
  } else if (typeFiltre === 'completed') {
    tasks = tasks.filter(task => task.etat == 100); // État = 100
  }

  afficherTaches(tasks);
}

// Gestion de la mise à jour des boutons actifs
const buttons = document.querySelectorAll('.button');
buttons.forEach(button => {
  button.addEventListener('click', () => {
    buttons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
  });
});

// Pré-remplissage les champs de la fenêtre modale pour modifier une tâche
async function modifierTache(id) {
  const response = await fetch(`${apiUrl}/${id}`);
  const task = await response.json();

  document.getElementById('task-name').value = task.tache;
  document.getElementById('task-desc').value = task.description;
  document.getElementById('task-cat').value = task.categorie;
  document.getElementById('task-date').value = task.date.split('T')[0];
  document.getElementById('task-time').value = task.date.split('T')[1];
  document.getElementById('task-priority').value = task.priorite;
  document.getElementById('task-status').value = task.etat;

  document.getElementById('save-task-btn').dataset.id = id;
  todoModal.style.display = 'flex';
}

// Réinitialisation des champs de la fenêtre modale
function reinitialiserChampsModale() {
  document.getElementById('task-name').value = '';
  document.getElementById('task-desc').value = '';
  document.getElementById('task-cat').value = '';
  document.getElementById('task-date').value = '';
  document.getElementById('task-time').value = '';
  document.getElementById('task-priority').value = 'Moyen';
  document.getElementById('task-status').value = 50;
  delete document.getElementById('save-task-btn').dataset.id;
}

// Attachement des actions de filtrage aux boutons
document.getElementById('todo-tasks-btn').addEventListener('click', () => filtrerTaches('todo'));
document.getElementById('completed-tasks-btn').addEventListener('click', () => filtrerTaches('completed'));
document.getElementById('list-tasks-btn').addEventListener('click', chargerTaches);

// Chargement de toutes les tâches au démarrage
document.addEventListener('DOMContentLoaded', chargerTaches);
