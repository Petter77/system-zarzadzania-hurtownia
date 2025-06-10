const TileButton = ({ icon, title, subtitle, color, onClick }) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center rounded-2xl shadow-lg p-4 m-0 w-48 h-32 transition-transform hover:scale-105 ${color}`}
  >
    <div className="text-3xl mb-2">{icon}</div>
    <div className="text-lg font-bold">{title}</div>
    <div className="text-sm">{subtitle}</div>
  </button>
);

export default TileButton;