"use client";

import { useState } from "react";
import { FileDown, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { formatCurrency, formatDate } from "@/lib/format";

type ExpenseRow = {
  expenseDate: Date;
  vendorName: string;
  description: string;
  amount: string | number;
};

export function ProjectExportButtons({
  projectName,
  projectCode,
  totalBudget,
  totalSpent,
  expenses,
}: {
  projectName: string;
  projectCode: string;
  totalBudget: number;
  totalSpent: number;
  expenses: ExpenseRow[];
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  function handleExportCsv() {
    const rows: (string | number)[][] = [
      ["Tanggal", "Vendor", "Deskripsi", "Jumlah (Rp)"],
      ...expenses.map((e) => [
        formatDate(e.expenseDate),
        e.vendorName,
        e.description,
        Number(e.amount),
      ]),
    ];
    downloadCsv(`pengeluaran-${projectCode}.csv`, rows);
  }

  async function handleExportPdf() {
    setIsGeneratingPdf(true);
    try {
      const { jsPDF } = await import("jspdf");
      const autoTable = (await import("jspdf-autotable")).default;

      const doc = new jsPDF();
      const vendors = Array.from(new Set(expenses.map((e) => e.vendorName)));

      doc.setFontSize(16);
      doc.text("CashNode — Laporan Proyek", 14, 18);
      doc.setFontSize(11);
      doc.setTextColor(90);
      doc.text(`${projectName} (${projectCode})`, 14, 26);

      doc.setFontSize(10);
      doc.setTextColor(20);
      doc.text(`Total Anggaran: ${formatCurrency(totalBudget)}`, 14, 36);
      doc.text(`Total Pengeluaran: ${formatCurrency(totalSpent)}`, 14, 42);
      doc.text(
        `Vendor yang digunakan: ${vendors.length > 0 ? vendors.join(", ") : "-"}`,
        14,
        48
      );

      autoTable(doc, {
        startY: 56,
        head: [["Tanggal", "Vendor", "Deskripsi", "Jumlah (Rp)"]],
        body: expenses.map((e) => [
          formatDate(e.expenseDate),
          e.vendorName,
          e.description,
          formatCurrency(e.amount.toString()),
        ]),
        headStyles: { fillColor: [22, 130, 90] },
        styles: { fontSize: 9 },
      });

      doc.save(`laporan-${projectCode}.pdf`);
    } finally {
      setIsGeneratingPdf(false);
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={handleExportCsv}>
        <FileDown className="size-4" />
        Export CSV
      </Button>
      <Button variant="outline" size="sm" onClick={handleExportPdf} disabled={isGeneratingPdf}>
        {isGeneratingPdf ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <FileText className="size-4" />
        )}
        Generate PDF Report
      </Button>
    </div>
  );
}
