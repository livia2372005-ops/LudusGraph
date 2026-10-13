import React from "react";
import { MacroCanvas } from "./components/canvas/MacroCanvas.js";

export const App: React.FC = () => {
  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <MacroCanvas />
    </div>
  );
};

export default App;
