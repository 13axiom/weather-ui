'use client';

interface Props {
  cities: string[];
  selected: string;
  onChange: (city: string) => void;
}

export default function CitySelector({ cities, selected, onChange }: Props) {
  if (cities.length === 0) {
    return <p className="text-slate-400 text-sm">No cities available — start the backend first.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cities.map((city) => (
        <button
          key={city}
          onClick={() => onChange(city)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-150
            ${
              selected === city
                ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                : 'bg-white text-slate-600 border border-slate-200 hover:border-blue-300 hover:text-blue-600'
            }
          `}
        >
          {city}
        </button>
      ))}
    </div>
  );
}
