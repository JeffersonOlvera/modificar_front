import { useState, useEffect } from "react";

interface ConfigPanelProps {
  settings: {
    temperature: string;
    topK: string;
    topP: string;
    reasoningEffort: string;
  };
  onChange: (newSettings: ConfigPanelProps["settings"]) => void;
}

export const ConfigPanel = ({ settings, onChange }: ConfigPanelProps) => {
  const [temperature, setTemperature] = useState(settings.temperature);
  const [topK, setTopK] = useState(settings.topK);
  const [topP, setTopP] = useState(settings.topP);
  const [reasoningEffort, setReasoningEffort] = useState(
    settings.reasoningEffort
  );

  // Notificar cambios al padre
  useEffect(() => {
    onChange({ temperature, topK, topP, reasoningEffort });
  }, [temperature, topK, topP, reasoningEffort]);

  const handleTopKChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopK(value);
    if (value !== "") setTopP(""); // desactiva Top P
  };

  const handleTopPChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTopP(value);
    if (value !== "") setTopK(""); // desactiva Top K
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4">Configuración del chat</h2>
      <div className="space-y-4">
        {/* Temperatura */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Temperatura (0 - 2)
          </label>
          <input
            type="number"
            min="0"
            max="2"
            step="0.1"
            value={temperature}
            onChange={(e) => setTemperature(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          />
        </div>

        {/* Top-K */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Top K (0 - 20)
          </label>
          <input
            type="number"
            min="0"
            max="20"
            value={topK}
            onChange={handleTopKChange}
            disabled={topP !== ""}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full disabled:bg-gray-100"
          />
        </div>

        {/* Top-P */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Top P (0 - 1)
          </label>
          <input
            type="number"
            min="0"
            max="1"
            step="0.01"
            value={topP}
            onChange={handleTopPChange}
            disabled={topK !== ""}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full disabled:bg-gray-100"
          />
        </div>

        {/* Reasoning Effort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Esfuerzo de razonamiento
          </label>
          <select
            value={reasoningEffort}
            onChange={(e) => setReasoningEffort(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full"
          >
            <option value="minimal">Minimal</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>
    </div>
  );
};
