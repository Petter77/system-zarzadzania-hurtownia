const TileButton = ({ icon, title, subtitle, iconColor = "text-blue-600", onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center justify-center rounded-2xl shadow-lg p-4 m-0 w-64 h-44 bg-white transition-transform hover:scale-105"
  >
    <div className={`text-4xl mb-2 ${iconColor}`}>{icon}</div>
    <div className="text-xl font-bold text-black">{title}</div>
    <div className="text-base text-gray-700">{subtitle}</div>
  </button>
);

export default TileButton;