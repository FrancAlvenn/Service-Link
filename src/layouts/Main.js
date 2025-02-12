import { useState } from 'react';
import SidebarView from '../components/sidebar/SidebarView';

function Main({ children }) {
    

    return (
        <main className="flex-1 pl-4 h-full">
            {children}
            
        </main>
    );
}

export default Main;
