// Trình học một câu một màn (Task 9 viết đầy đủ). Tạm: chỉ báo chưa có.
import type { StepNo } from "../core/path";
import { toast } from "../core/util";

export function startStep(n: number, step: StepNo, opts?: { skip?: boolean }) { void n; void step; void opts; toast("Đang xây phần này."); }
export function startReview() { toast("Đang xây phần này."); }
export function renderPlayer() {}
