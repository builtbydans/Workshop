import PDFDocument from "pdfkit";
import type { InvoiceDto } from "../../types/invoice.types";

const COMPANY = {
  name: "Workshop",
  legalName: "Workshop Automotive Ltd",
  address: ["14 Foundry Lane", "Manchester", "M1 4AB"],
  email: "hello@workshop.example",
  phone: "0161 555 0142",
  vatNumber: "GB 123 4567 89",
};

const colours = {
  ink: "#171717",
  muted: "#737373",
  line: "#e5e5e5",
  panel: "#f5f5f5",
  accent: "#2563eb",
  paid: "#15803d",
  warning: "#b45309",
};

const money = (value: number) =>
  `£${Number(value).toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const date = (value: string | null) =>
  value
    ? new Intl.DateTimeFormat("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(new Date(value))
    : "—";

const statusColour = (status: InvoiceDto["status"]) => {
  if (status === "PAID") return colours.paid;
  if (status === "UNPAID") return colours.warning;
  return colours.muted;
};

const kindLabel = (kind: string) =>
  kind.charAt(0) + kind.slice(1).toLowerCase();

const drawWordmark = (doc: PDFKit.PDFDocument) => {
  doc.roundedRect(50, 45, 38, 38, 8).fill(colours.ink);
  doc
    .fillColor("#ffffff")
    .font("Helvetica-Bold")
    .fontSize(22)
    .text("W", 50, 53, { width: 38, align: "center" });
  doc
    .fillColor(colours.ink)
    .font("Helvetica-Bold")
    .fontSize(22)
    .text(COMPANY.name, 100, 49);
  doc
    .fillColor(colours.muted)
    .font("Helvetica")
    .fontSize(8)
    .text("AUTOMOTIVE CARE", 101, 72, { characterSpacing: 1.3 });
};

const drawFooter = (doc: PDFKit.PDFDocument) => {
  const y = doc.page.height - 55;
  doc
    .moveTo(50, y)
    .lineTo(doc.page.width - 50, y)
    .strokeColor(colours.line)
    .stroke();
  doc
    .fillColor(colours.muted)
    .font("Helvetica")
    .fontSize(8)
    .text(
      `${COMPANY.legalName} · VAT ${COMPANY.vatNumber} · ${COMPANY.email} · ${COMPANY.phone}`,
      50,
      y + 12,
      { width: doc.page.width - 100, align: "center" },
    );
};

const ensureSpace = (doc: PDFKit.PDFDocument, required: number) => {
  if (doc.y + required < doc.page.height - 85) {
    return;
  }

  drawFooter(doc);
  doc.addPage();
  doc.y = 50;
};

const drawInvoicePdf = (invoice: InvoiceDto): Promise<Buffer> =>
  new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
      info: {
        Title: `${invoice.invoice_number} — ${COMPANY.name}`,
        Author: COMPANY.legalName,
        Subject: `Invoice for ${invoice.customer_name}`,
      },
    });
    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    drawWordmark(doc);

    doc
      .fillColor(colours.ink)
      .font("Helvetica-Bold")
      .fontSize(30)
      .text("INVOICE", 340, 45, { width: 205, align: "right" });
    doc
      .fillColor(statusColour(invoice.status))
      .fontSize(10)
      .text(invoice.status, 340, 82, { width: 205, align: "right" });

    if (invoice.status === "DRAFT") {
      doc.save();
      doc
        .fillColor("#eeeeee")
        .font("Helvetica-Bold")
        .fontSize(76)
        .rotate(-35, { origin: [300, 390] })
        .text("DRAFT", 85, 350, { width: 430, align: "center" });
      doc.restore();
    }

    doc.y = 120;
    doc
      .moveTo(50, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(colours.line)
      .stroke();

    const top = 142;
    doc
      .fillColor(colours.muted)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("FROM", 50, top);
    doc
      .fillColor(colours.ink)
      .fontSize(10)
      .text(COMPANY.legalName, 50, top + 18);
    doc
      .fillColor(colours.muted)
      .font("Helvetica")
      .fontSize(9)
      .text(COMPANY.address.join("\n"), 50, top + 35, { lineGap: 2 });
    doc.text(COMPANY.email, 50, top + 77);
    doc.text(COMPANY.phone, 50, top + 91);

    doc
      .fillColor(colours.muted)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("BILL TO", 225, top);
    doc
      .fillColor(colours.ink)
      .fontSize(10)
      .text(invoice.customer_name, 225, top + 18);
    doc
      .fillColor(colours.muted)
      .font("Helvetica")
      .fontSize(9)
      .text(invoice.customer_email ?? "", 225, top + 38);
    doc.text(invoice.customer_phone ?? "", 225, top + 53);

    const detailsX = 395;
    const detailValueX = 465;
    const detailRow = (label: string, value: string, y: number) => {
      doc
        .fillColor(colours.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(label, detailsX, y);
      doc
        .fillColor(colours.ink)
        .font("Helvetica-Bold")
        .text(value, detailValueX, y, { width: 80, align: "right" });
    };

    detailRow("Invoice", invoice.invoice_number, top);
    detailRow("Created", date(invoice.created_at), top + 22);
    detailRow("Issued", date(invoice.issued_at), top + 44);
    detailRow("Due", date(invoice.due_at), top + 66);
    detailRow("Job", invoice.job_number, top + 88);

    const vehicleY = 265;
    doc
      .roundedRect(50, vehicleY, 495, 48, 6)
      .fillAndStroke(colours.panel, colours.line);
    doc
      .fillColor(colours.muted)
      .font("Helvetica-Bold")
      .fontSize(8)
      .text("VEHICLE", 64, vehicleY + 12);
    doc
      .fillColor(colours.ink)
      .fontSize(10)
      .text(
        `${invoice.vehicle_make} ${invoice.vehicle_model} · ${invoice.vehicle_registration}`,
        64,
        vehicleY + 27,
      );

    doc.y = 340;
    const columns = {
      description: { x: 50, width: 250 },
      quantity: { x: 310, width: 55 },
      unit: { x: 375, width: 75 },
      total: { x: 460, width: 85 },
    };
    const drawTableHeader = () => {
      const headerY = doc.y;
      doc
        .rect(50, headerY, 495, 25)
        .fill(colours.ink);
      doc
        .fillColor("#ffffff")
        .font("Helvetica-Bold")
        .fontSize(8)
        .text("DESCRIPTION", columns.description.x + 8, headerY + 8);
      doc.text("QTY", columns.quantity.x, headerY + 8, {
        width: columns.quantity.width,
        align: "right",
      });
      doc.text("UNIT PRICE", columns.unit.x, headerY + 8, {
        width: columns.unit.width,
        align: "right",
      });
      doc.text("TOTAL", columns.total.x, headerY + 8, {
        width: columns.total.width,
        align: "right",
      });
      doc.y = headerY + 25;
    };

    drawTableHeader();

    for (const line of invoice.lines) {
      ensureSpace(doc, 48);

      if (doc.y === 50) {
        drawTableHeader();
      }

      const rowY = doc.y;
      const descriptionHeight = doc.heightOfString(line.description, {
        width: columns.description.width - 16,
      });
      const rowHeight = Math.max(40, descriptionHeight + 24);

      doc
        .fillColor(colours.ink)
        .font("Helvetica-Bold")
        .fontSize(9)
        .text(line.description, columns.description.x + 8, rowY + 8, {
          width: columns.description.width - 16,
        });
      doc
        .fillColor(colours.muted)
        .font("Helvetica")
        .fontSize(7)
        .text(
          `${kindLabel(line.kind)}${line.origin === "ADDITIONAL" ? " · Additional work" : ""}`,
          columns.description.x + 8,
          rowY + 10 + descriptionHeight,
        );
      doc
        .fillColor(colours.ink)
        .fontSize(9)
        .text(String(line.quantity), columns.quantity.x, rowY + 8, {
          width: columns.quantity.width,
          align: "right",
        });
      doc.text(money(line.unit_price), columns.unit.x, rowY + 8, {
        width: columns.unit.width,
        align: "right",
      });
      doc
        .font("Helvetica-Bold")
        .text(money(line.line_total), columns.total.x, rowY + 8, {
          width: columns.total.width,
          align: "right",
        });
      doc
        .moveTo(50, rowY + rowHeight)
        .lineTo(545, rowY + rowHeight)
        .strokeColor(colours.line)
        .stroke();
      doc.y = rowY + rowHeight;
    }

    ensureSpace(doc, 190);
    doc.y += 18;
    const summaryX = 345;
    const summaryValueX = 460;
    const summaryRow = (
      label: string,
      value: string,
      options?: { bold?: boolean; colour?: string },
    ) => {
      const y = doc.y;
      doc
        .fillColor(options?.colour ?? colours.muted)
        .font(options?.bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(options?.bold ? 11 : 9)
        .text(label, summaryX, y);
      doc.text(value, summaryValueX, y, { width: 85, align: "right" });
      doc.y = y + (options?.bold ? 25 : 20);
    };

    summaryRow("Subtotal", money(invoice.subtotal));
    if (invoice.discount > 0) {
      summaryRow("Discount", `-${money(invoice.discount)}`);
    }
    summaryRow(`VAT (${invoice.vat_rate}%)`, money(invoice.vat));
    summaryRow("Invoice total", money(invoice.total), { bold: true });
    summaryRow("Deposit paid", `-${money(invoice.deposit_paid)}`, {
      colour: colours.paid,
    });
    doc
      .moveTo(summaryX, doc.y)
      .lineTo(545, doc.y)
      .strokeColor(colours.ink)
      .stroke();
    doc.y += 10;
    summaryRow(
      invoice.status === "PAID" ? "Amount paid" : "Balance due",
      invoice.status === "PAID"
        ? money(invoice.amount_paid)
        : money(invoice.balance_due),
      {
        bold: true,
        colour:
          invoice.status === "PAID" ? colours.paid : colours.warning,
      },
    );

    if (invoice.status === "PAID") {
      doc
        .fillColor(colours.paid)
        .font("Helvetica-Bold")
        .fontSize(11)
        .text(`PAID ${date(invoice.paid_at)}`, 50, doc.y - 25);
    } else {
      doc
        .fillColor(colours.muted)
        .font("Helvetica")
        .fontSize(8)
        .text(
          "Payment terms: due on receipt. Please quote the invoice number with your payment.",
          50,
          doc.y - 25,
          { width: 250 },
        );
    }

    drawFooter(doc);
    doc.end();
  });

export { COMPANY, drawInvoicePdf };
