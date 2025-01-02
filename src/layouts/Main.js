function Main({ children }) {
    return (
        <main className="flex-1 p-4 overflow-y-auto custom-scrollbar">
            <div className="">
                {children}
            </div>
        </main>
    );
}

export default Main;
