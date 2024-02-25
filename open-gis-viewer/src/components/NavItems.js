import React from 'react';

export const NavItems = ({children, buttons, ButtonsContainer = 'menu'}) => {
    // const ButtonsContainer = buttonsContainer;
    return (
        <>
            <ButtonsContainer>{buttons}</ButtonsContainer>
            {children}
        </>
    );
}