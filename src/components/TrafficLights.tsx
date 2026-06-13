import React from "react";

export default function TrafficLights() {
  return (
    <div className="traffic-lights">
      <button
        className="traffic-light traffic-light-close"
        onClick={() => window.electronAPI.close()}
        title="Close"
      />
      <button
        className="traffic-light traffic-light-minimize"
        onClick={() => window.electronAPI.minimize()}
        title="Minimize"
      />
      <button
        className="traffic-light traffic-light-maximize"
        onClick={() => window.electronAPI.maximize()}
        title="Maximize"
      />
    </div>
  );
}
