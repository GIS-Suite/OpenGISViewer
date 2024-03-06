import React from 'react';

export const Section = ({children, ...props}) => {
    return (
        <section {...props}>
            {children}
        </section>
    );
}