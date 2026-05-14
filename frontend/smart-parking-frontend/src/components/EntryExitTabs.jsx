export default function EntryExitTabs({ activeTab, setActiveTab }) {
  return (
    <div className="entry-exit-tabs">
      <button
        className={activeTab === 'entry' ? 'active' : ''}
        onClick={() => setActiveTab('entry')}
      >
        Entry State
      </button>
      <button
        className={activeTab === 'exit' ? 'active' : ''}
        onClick={() => setActiveTab('exit')}
      >
        Exit State
      </button>
    </div>
  );
}