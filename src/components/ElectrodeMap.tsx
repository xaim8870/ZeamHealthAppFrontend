import React from "react";

const channels = ["CP3","CP4","C3","C4","F5","F6","PO3","PO4"];

const statusColor = (status: string) => {
  switch (status) {
    case "good": return "bg-green-500";
    case "ok": return "bg-yellow-500";
    default: return "bg-red-500"; 
  }
};

export default function ElectrodeMap({ packet }: { packet: any[] }) {
  return (
    <div className="grid grid-cols-2 gap-6 mt-6">
      {packet.map((ch, i) => (
        <div key={i} className="flex flex-col items-center">
          <div
            className={
              "w-10 h-10 rounded-full shadow-lg animate-pulse border border-white/20 " +
              statusColor(ch.status)
            }
          />
          <p className="text-white mt-2 text-xs font-semibold">
            {channels[i]}
          </p>
          <p className="text-gray-400 text-[10px]">{ch.status}</p>
        </div>
      ))}
    </div>
  );
}
