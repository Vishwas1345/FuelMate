import { jsPDF } from "jspdf";

type MinimalUser = {
  name?: string;
  email?: string;
  phone?: string;
  role?: string;
};

type MinimalOrder = {
  _id?: string;
  id?: string;
  createdAt?: string;
  timestamp?: string | number | Date;
  fuelType?: string;
  quantity?: number;
  brand?: string;
  totalPrice?: number;
  price?: number;
  status?: string;
  deliveryAddress?: string;
  paymentMethod?: string;
  paymentStatus?: string;
};

const safe = (v: any) => (v === null || v === undefined || v === "" ? "—" : String(v));

function formatDate(d: any) {
  try {
    const dt = d ? new Date(d) : new Date();
    if (Number.isNaN(dt.getTime())) return "—";
    return dt.toLocaleString("en-IN", { year: "numeric", month: "short", day: "2-digit" });
  } catch {
    return "—";
  }
}

function formatMoney(v: any) {
  const n = Number(v);
  if (!Number.isFinite(n)) return "—";
  return `₹${n.toLocaleString("en-IN")}`;
}

export function downloadOrderInvoicePdf(order: MinimalOrder, user?: MinimalUser) {
  const orderId = order._id || order.id || "";
  const shortId = orderId ? orderId.slice(-6) : "INV";
  const createdAt = order.createdAt || order.timestamp;

  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();

  // Header bar
  doc.setFillColor(249, 115, 22); // orange-500
  doc.rect(0, 0, pageW, 72, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("FuelMate", 40, 44);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`INVOICE #${shortId}`, pageW - 40, 30, { align: "right" });
  doc.text(`Date: ${formatDate(createdAt)}`, pageW - 40, 46, { align: "right" });

  // Body
  let y = 110;
  doc.setTextColor(17, 24, 39); // slate-900
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Billed To", 40, y);
  doc.text("Order Details", pageW / 2 + 10, y);

  y += 18;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);

  const left = [
    ["Name", safe(user?.name)],
    ["Email", safe(user?.email)],
    ["Phone", safe(user?.phone)],
  ];
  const right = [
    ["Fuel Type", safe(order.fuelType)],
    ["Quantity", order.quantity !== undefined ? `${order.quantity} L` : "—"],
    ["Brand", safe(order.brand)],
    ["Status", safe(order.status)],
    ["Payment", safe(order.paymentMethod || order.paymentStatus)],
    ["Amount", formatMoney(order.totalPrice ?? order.price)],
  ];

  const lineGap = 16;
  let yL = y;
  for (const [k, v] of left) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, 40, yL);
    doc.setFont("helvetica", "normal");
    doc.text(safe(v), 110, yL);
    yL += lineGap;
  }

  let yR = y;
  for (const [k, v] of right) {
    doc.setFont("helvetica", "bold");
    doc.text(`${k}:`, pageW / 2 + 10, yR);
    doc.setFont("helvetica", "normal");
    doc.text(safe(v), pageW / 2 + 90, yR);
    yR += lineGap;
  }

  const yNext = Math.max(yL, yR) + 22;
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.line(40, yNext, pageW - 40, yNext);

  let y2 = yNext + 26;
  doc.setFont("helvetica", "bold");
  doc.text("Delivery Address", 40, y2);
  y2 += 16;
  doc.setFont("helvetica", "normal");
  const addr = safe(order.deliveryAddress);
  doc.text(doc.splitTextToSize(addr, pageW - 80), 40, y2);

  // Footer
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("FuelMate • Secure & Encrypted", pageW / 2, 820, { align: "center" });

  const filename = `FuelMate_Invoice_${shortId}.pdf`;
  doc.save(filename);
}

