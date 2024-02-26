import React from 'react';

import './MapInfo.css';

const DataUpdateTime = (props) => {
    const month = props.date.toLocaleString('en-US', {month: 'long'});
    const day = props.date.toLocaleString('en-US', {day: '2-digit'});
    const time = props.date.toLocaleString("en-US", {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });
    const year = props.date.getFullYear();

    return (
        <div className='expense-date'>
            <div className='expense-date__month'>{month}{day} </div>
            <div className='expense-date__year'>{year}</div>
            <div className='expense-date__day'>{time}</div>
        </div>
    );
};

export default DataUpdateTime;