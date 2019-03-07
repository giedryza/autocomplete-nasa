import React from 'react';
import { ReactComponent as IconArrow } from './assets/svg/arrow-right.svg';

const Suggestion = ({ suggestion, cursor, className, selectSuggestion }) => (
    <li onClick={() => selectSuggestion(suggestion, cursor)} className={className}>
        <IconArrow className="input__icon--arrow" />
        <img src={suggestion.img} alt={suggestion.title} />
        <div>
            <h3>{suggestion.title}</h3>
            <p>{suggestion.date}</p>
        </div>
    </li>
);

export default Suggestion;
