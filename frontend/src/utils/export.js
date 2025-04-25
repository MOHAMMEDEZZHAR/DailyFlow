import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

function formatDateTime(dt) {
  if (!dt) return '';
  const d = new Date(dt);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
}

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
