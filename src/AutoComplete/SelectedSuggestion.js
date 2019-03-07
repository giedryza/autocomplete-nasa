import React from 'react';

const SelectedSuggestion = ({ selectedSuggestion: { nasaId, title, description, img, date } }) => (
    <div className="selected-suggestion">
        <img src={img} alt={title} />
        <div>
            <h6>{date}</h6>
            <h6>{nasaId}</h6>
        </div>
        <h2>{title}</h2>
        <p>{description}</p>
    </div>
);

export default SelectedSuggestion;
