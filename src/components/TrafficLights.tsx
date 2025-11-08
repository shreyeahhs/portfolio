const TrafficLights = () => {
  return (
    <div className="flex items-center gap-2">
      <div className="w-3 h-3 rounded-full bg-traffic-red" aria-hidden="true" />
      <div className="w-3 h-3 rounded-full bg-traffic-yellow" aria-hidden="true" />
      <div className="w-3 h-3 rounded-full bg-traffic-green" aria-hidden="true" />
    </div>
  );
};

export default TrafficLights;
