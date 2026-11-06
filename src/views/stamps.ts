// Sổ con dấu ga (Task 10 viết đầy đủ). Tạm: báo đạt rồi về bản đồ.
import { setView } from "../app/shell";
import { stationOf } from "../core/route";
import { toast } from "../core/util";
export function showStampMoment(n: number, score: number) { toast(`Qua ga ${stationOf(n).code} (${Math.round(score * 100)}%)!`); setView("journey"); }
export function renderStamps() { setView("journey"); }
