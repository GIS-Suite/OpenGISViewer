import React from 'react';

export const SectionItem = ({children, items, SectionContainer = 'menu'}) => {
    // const ButtonsContainer = buttonsContainer;
    return (
        <>
            <SectionContainer>{items}</SectionContainer>
            {children}
        </>
    );
}