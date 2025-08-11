
function scoreOnCompletion(task, completedAt) {
  const due = task.dueAt ? new Date(task.dueAt).getTime() : null;
  const completed = completedAt ? new Date(completedAt).getTime() : Date.now();
  let points = 0;
  if (!due) {
    points = Math.round((task.estimatedMinutes || 30) / 30);
  } else {
    const delta = completed - due;
    if (delta <= 0) {
      points = Math.max(1, Math.round((task.estimatedMinutes || 30)/30) + 2);
    } else {
      const lateHours = Math.ceil(delta / (1000*60*60));
      points = Math.max(-5, Math.round((task.estimatedMinutes || 30)/30) - lateHours);
    }
  }
  return points;
}
module.exports = { scoreOnCompletion };
