import React from 'react';

export const NavItemButton = ({children, isSelected, ...props}) => {

    return (
        <li>
            <button className={isSelected ? 'active' : undefined} {...props}>
                {children}
            </button>
        </li>
    );
}