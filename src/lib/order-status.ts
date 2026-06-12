export const ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "Töötlemisel",
  pending_payment: "Ootab makset",
  processing: "Töös",
  completed: "Lõpetatud",
  canceled: "Tühistatud",
  closed: "Suletud",
  fraud: "Pettus",
  withdrawn: "Taganetud",
};

export function orderStatusLabel(status: string): string {
  return ORDER_STATUS_LABEL[status] ?? status;
}
