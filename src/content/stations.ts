import type { StationConfig } from "@/types/game";

export const STATIONS: StationConfig[] = [
  {
    id: "linux",
    title: "Linux",
    subtitle: "The operating system layer",
    position: [-8, 0, -8],
    themeColor: "#f59e0b",
    inWorld: true,
  },
  {
    id: "apache",
    title: "Apache",
    subtitle: "The web server",
    position: [8, 0, -8],
    themeColor: "#ef4444",
    inWorld: true,
  },
  {
    id: "php",
    title: "PHP",
    subtitle: "The application language",
    position: [-8, 0, 8],
    themeColor: "#818cf8",
    inWorld: true,
  },
  {
    id: "mysql",
    title: "MySQL",
    subtitle: "The database",
    position: [8, 0, 8],
    themeColor: "#38bdf8",
    inWorld: true,
  },
  {
    id: "lamp",
    title: "LAMP Hub",
    subtitle: "How the stack works together",
    position: [0, 0, 0],
    themeColor: "#34d399",
    inWorld: true,
  },
  {
    id: "aws",
    title: "AWS Deploy",
    subtitle: "Cloud challenges (unlock later)",
    position: [0, 0, -16],
    themeColor: "#fb923c",
    inWorld: false,
  },
];

export const WORLD_STATIONS = STATIONS.filter((station) => station.inWorld);

export function getStation(id: StationConfig["id"]) {
  const station = STATIONS.find((item) => item.id === id);
  if (!station) {
    throw new Error(`Unknown station: ${id}`);
  }
  return station;
}
