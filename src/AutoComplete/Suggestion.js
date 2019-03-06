import React from 'react';

import { ReactComponent as IconArrow } from './assets/svg/arrow-right.svg';

const Suggestion = ({ nasaId, title, date, img, description, className, selectSuggestion }) => (
    <li
        onClick={() => selectSuggestion({ nasaId, title, date, img, description })}
        className={className}
    >
        <IconArrow className="input__icon--arrow" />
        <img src={img} alt={title} />
        <div>
            <h3>{title ? title : 'n/a'}</h3>
            <p>{date ? date : 'n/a'}</p>
        </div>
    </li>
);

export default Suggestion;
