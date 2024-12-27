function DaySchedule({ day, times, onUpdate }) {
    const handleTimeChange = (index, field, value) => {
      const updatedTimes = [...times];
      updatedTimes[index][field] = value;
      onUpdate(day, updatedTimes);
    };
  
    const addTimeSlot = () => {
      onUpdate(day, [...times, { start: "", end: "" }]);
    };
  
    const removeTimeSlot = (index) => {
      const updatedTimes = times.filter((_, i) => i !== index);
      onUpdate(day, updatedTimes);
    };
  
    return (
      <div className={`schedule ${day}-sessions`}>
        <h4>{day.charAt(0).toUpperCase() + day.slice(1)}</h4>
        {times.map((time, index) => (
          <div key={index} className="time-slot">
            <input
              type="time"
              value={time.start}
              onChange={(e) => handleTimeChange(index, "start", e.target.value)}
            />
            <span>to</span>
            <input
              type="time"
              value={time.end}
              onChange={(e) => handleTimeChange(index, "end", e.target.value)}
            />
            <button onClick={() => removeTimeSlot(index)}>Remove</button>
          </div>
        ))}
        <button onClick={addTimeSlot}>Add Time Slot</button>
      </div>
    );
  }

    export default DaySchedule;