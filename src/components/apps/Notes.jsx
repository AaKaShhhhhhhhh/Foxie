import React, { useState } from 'react';

const Notes = () => {
  const [notes, setNotes] = useState('');

  const handleChange = (e) => {
    setNotes(e.target.value);
  };

  const handleClear = () => {
    setNotes('');
  };

  return (
    <div className="app-notes">
      <div className="app-toolbar">
        <button onClick={handleClear} className="btn-clear">
          Clear
        </button>
      </div>
      <textarea
        className="notes-textarea"
        value={notes}
        onChange={handleChange}
        placeholder="Write your notes here..."
      />
    </div>
  );
};

export default Notes;
