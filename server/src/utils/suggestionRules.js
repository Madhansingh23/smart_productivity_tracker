
function generateRules(stats) {
  const suggestions = [];
  const { meetingMinutes=0, totalWorkMinutes=0, avgSession=0, openTasks=0, taskCompletionRate=1 } = stats;
  if(totalWorkMinutes > 0 && meetingMinutes / Math.max(1, totalWorkMinutes) > 0.4) {
    suggestions.push({ suggestionType:'meetings', text:'Meetings >40% of time. Batch meetings or set 30-min slots.\n\nகூட்டங்கள் உங்கள் நேரம் 40% மேல். கூட்டங்களை தொகுக்கவும் அல்லது 30 நிமிடமாக மாற்றவும்.', score:0.9, source:'rule' });
  }
  if(avgSession < 45) suggestions.push({ suggestionType:'deep-work', text:'Short focus sessions. Block 90-min deep work twice a week.\n\nசிறிய கவனம். வாரத்தில் இரு முறை 90 நிமிடச் சேஷன் செய்யுங்கள்.', score:0.7, source:'rule' });
  if(taskCompletionRate < 0.6 || openTasks > 15) suggestions.push({ suggestionType:'prioritize', text:'Many open tasks. Prioritize top 3 each day.\n\nபல திறந்த பணிகள். தினசரி முதல் 3 பணிகளை முன்னுரிமை செய்யுங்கள்.', score:0.8, source:'rule' });
  if(suggestions.length===0) suggestions.push({ suggestionType:'ok', text:'No major issues detected. Keep tracking.\n\nபெரிய பிரச்சினைகள் இல்லை. தொடரவும்.', score:0.5, source:'rule' });
  return suggestions;
}
module.exports = { generateRules };
