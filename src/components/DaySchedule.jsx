function DaySchedule({ day, sessions, onUpdate }) {
  const handleSessionChange = (index, field, value) => {
    const updatedSessions = [...sessions];
    updatedSessions[index] = {
      ...updatedSessions[index],
      [field]: value
    };
    onUpdate(day, updatedSessions);
  };

  const addSession = () => {
    const newSession = {
      start: "",
      end: "",
      location: "",
      sessionType: ""
    };
    onUpdate(day, [...sessions, newSession]);
  };

  const removeSession = (index) => {
    const updatedSessions = sessions.filter((_, i) => i !== index);
    onUpdate(day, updatedSessions);
  };

  return (
    <div className={`schedule ${day.toLowerCase()}-sessions`}>
      <h4>{day}</h4>
      {sessions.map((session, index) => (
        <div key={index} className="session-slot">
          <div className="session-time">
            <input
              type="time"
              value={session.start}
              onChange={(e) => handleSessionChange(index, "start", e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              value={session.end}
              onChange={(e) => handleSessionChange(index, "end", e.target.value)}
            />
          </div>
          
          <div className="session-details">
            <input
              type="text"
              value={session.location}
              placeholder="Location"
              onChange={(e) => handleSessionChange(index, "location", e.target.value)}
            />
            
            <select
              value={session.sessionType}
              onChange={(e) => handleSessionChange(index, "sessionType", e.target.value)}
            >
              <option value="">Select Type</option>
              <option value="One-on-One">One-on-One</option>
              <option value="Group">Group</option>
            </select>
            
            <button 
              onClick={() => removeSession(index)}
              className="remove-session-btn"
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button 
        onClick={addSession}
        className="add-session-btn"
      >
        Add Session
      </button>
    </div>
  );
}

export default DaySchedule;
