import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

// Nouvelle fonction d'export enrichie
// Ajout du paramètre facultatif scoreProductivite (et user si besoin)
export async function exportFullReport({ schedule, tasks, availabilities, energyLevels, productivityStats, allTasks = [], scoreProductivite = null }) {
  const doc = new jsPDF();
  let y = 10;

  // Score de productivité (si fourni)
  if (scoreProductivite !== null) {
    doc.setFontSize(16);
    doc.text('Score de productivité : ' + scoreProductivite, 10, y);
    y += 8;
  }

  // Section Planning
  doc.setFontSize(16);
  doc.text('Planning', 10, y);
  y += 6;
  const planningRows = schedule.map(s => {
    const task = tasks.find(t => t.id === s.task_id);
    return [
      task ? task.name : 'Tâche',
      task ? task.categorie || '-' : '-',
      task ? task.description || '-' : '-',
      formatDateTime(s.start_datetime),
      formatDateTime(s.end_datetime)
    ];
  });
  autoTable(doc, {
    startY: y,
    head: [['Tâche', 'Catégorie', 'Description', 'Début', 'Fin']],
    body: planningRows
  });
  y = doc.lastAutoTable.finalY + 8;

  // Section Toutes les tâches (avec détails)
  if (allTasks.length > 0) {
    doc.setFontSize(16);
    doc.text('Toutes les tâches', 10, y);
    y += 6;
    const allTaskRows = allTasks.map(t => [
      t.name,
      t.categorie || '-',
      t.priority,
      t.duration ? (t.duration / 60).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' h' : '-',
      t.description || '-'
    ]);
    autoTable(doc, {
      startY: y,
      head: [['Nom', 'Catégorie', 'Priorité', 'Durée', 'Description']],
      body: allTaskRows
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  // Section Disponibilités
  doc.setFontSize(16);
  doc.text('Disponibilités', 10, y);
  y += 6;
  const availRows = availabilities.map(a => [a.start_time, a.end_time]);
  autoTable(doc, {
    startY: y,
    head: [['Début', 'Fin']],
    body: availRows
  });
  y = doc.lastAutoTable.finalY + 8;

  // Section Niveaux d'énergie
  doc.setFontSize(16);
  doc.text("Niveaux d'énergie", 10, y);
  y += 6;
  const energyRows = Object.entries(energyLevels).map(([period, level]) => [period, level]);
  autoTable(doc, {
    startY: y,
    head: [['Période', 'Niveau']],
    body: energyRows
  });
  y = doc.lastAutoTable.finalY + 8;

  // Section Statistiques de productivité
  doc.setFontSize(16);
  doc.text('Statistiques de productivité', 10, y);
  y += 6;
  const prodRows = productivityStats.map(stat => [stat.date, stat.completed]);
  autoTable(doc, {
    startY: y,
    head: [['Date', 'Tâches terminées']],
    body: prodRows
  });

  doc.save('rapport_complet.pdf');
}

// Ajout du paramètre facultatif scoreProductivite (et user si besoin)
export async function exportFullReportExcel({ schedule, tasks, availabilities, energyLevels, productivityStats, allTasks = [], scoreProductivite = null }) {
  const wb = XLSX.utils.book_new();

  // Score de productivité (si fourni)
  if (scoreProductivite !== null) {
    const wsScore = XLSX.utils.aoa_to_sheet([
      ['Score de productivité'],
      [scoreProductivite]
    ]);
    XLSX.utils.book_append_sheet(wb, wsScore, 'Score');
  }

  // Planning
  const planningData = [
    ['Tâche', 'Catégorie', 'Description', 'Début', 'Fin'],
    ...schedule.map(s => {
      const task = tasks.find(t => t.id === s.task_id);
      return [
        task ? task.name : 'Tâche',
        task ? task.categorie || '-' : '-',
        task ? task.description || '-' : '-',
        formatDateTime(s.start_datetime),
        formatDateTime(s.end_datetime)
      ];
    })
  ];
  const wsPlanning = XLSX.utils.aoa_to_sheet(planningData);
  XLSX.utils.book_append_sheet(wb, wsPlanning, 'Planning');

  // Toutes les tâches (avec détails)
  if (allTasks.length > 0) {
    const allTaskData = [
      ['Nom', 'Catégorie', 'Priorité', 'Durée', 'Description'],
      ...allTasks.map(t => [
        t.name,
        t.categorie || '-',
        t.priority,
        t.duration ? (t.duration / 60).toLocaleString(undefined, { maximumFractionDigits: 2 }) + ' h' : '-',
        t.description || '-'
      ])
    ];
    const wsAllTasks = XLSX.utils.aoa_to_sheet(allTaskData);
    XLSX.utils.book_append_sheet(wb, wsAllTasks, 'Toutes les tâches');
  }

  // Disponibilités
  const availData = [
    ['Début', 'Fin'],
    ...availabilities.map(a => [a.start_time, a.end_time])
  ];
  const wsAvail = XLSX.utils.aoa_to_sheet(availData);
  XLSX.utils.book_append_sheet(wb, wsAvail, 'Disponibilités');

  // Niveaux d'énergie
  const energyData = [
    ['Période', 'Niveau'],
    ...Object.entries(energyLevels).map(([period, level]) => [period, level])
  ];
  const wsEnergy = XLSX.utils.aoa_to_sheet(energyData);
  XLSX.utils.book_append_sheet(wb, wsEnergy, "Niveaux d'énergie");

  // Statistiques de productivité
  const prodData = [
    ['Date', 'Tâches terminées'],
    ...productivityStats.map(stat => [stat.date, stat.completed])
  ];
  const wsProd = XLSX.utils.aoa_to_sheet(prodData);
  XLSX.utils.book_append_sheet(wb, wsProd, 'Productivité');

  XLSX.writeFile(wb, 'rapport_complet.xlsx');
}

// Anciennes fonctions conservées pour compatibilité
export function exportScheduleToPDF(schedule, tasks) {
  const doc = new jsPDF();
  doc.text('Planning', 10, 10);
  const rows = schedule.map(s => {
    const task = tasks.find(t => t.id === s.task_id);
    return [
      task ? task.name : 'Tâche',
      task ? task.categorie || '-' : '-',
      task ? task.description || '-' : '-',
      formatDateTime(s.start_datetime),
      formatDateTime(s.end_datetime)
    ];
  });
  try {
    autoTable(doc, {
      head: [['Tâche', 'Catégorie', 'Description', 'Début', 'Fin']],
      body: rows
    });
  } catch (e) {
    // Export PDF de secours simple
    let y = 20;
    rows.forEach(r => {
      doc.text(`${r[0]} | ${r[1]} - ${r[2]}`, 10, y);
      y += 10;
    });
  }
  doc.save('planning.pdf');
}

export function exportScheduleToExcel(schedule, tasks) {
  const wsData = [
    ['Tâche', 'Catégorie', 'Description', 'Début', 'Fin'],
    ...schedule.map(s => {
      const task = tasks.find(t => t.id === s.task_id);
      return [
        task ? task.name : 'Tâche',
        task ? task.categorie || '-' : '-',
        task ? task.description || '-' : '-',
        formatDateTime(s.start_datetime),
        formatDateTime(s.end_datetime)
      ];
    })
  ];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Planning');
  XLSX.writeFile(wb, 'planning.xlsx');
}

