import { jsPDF } from 'jspdf';
import { Transaction } from '../types';

export function generateReceiptPDF(tx: Transaction) {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
    });

    // Base layout: Outer frame/border
    doc.setDrawColor(229, 231, 235);
    doc.setLineWidth(0.5);
    doc.rect(10, 10, 190, 277);

    // Header background banner
    doc.setFillColor(17, 24, 39); // Dark navy/charcoal
    doc.rect(10, 10, 190, 35, 'F');

    // Title / Brand Name
    doc.setTextColor(255, 255, 255);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('CATHAY BANK', 15, 25);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(209, 213, 219);
    doc.text('OFFICIAL TRANSACTION RECEIPT', 15, 32);

    // Receipt details right-aligned in header
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(`STATUS: ${tx.status?.toUpperCase() || 'COMPLETED'}`, 135, 23);
    
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    const dateStr = tx.id === 'txn_sanchez_philippines_globalcash' 
        ? '05 Jul 2026, 7:15 PM' 
        : tx.id === 'txn_hilton_kyiv'
        ? '08 Jul 2026, 5:37 PM (Dubai Time 20:37)'
        : tx.id === 'txn_necel_laraga_failed'
        ? '08 Jul 2026, 10:06 PM (Dubai Time 12:06 AM, 9 July)'
        : new Date(tx.date).toLocaleString();
    doc.text(`DATE: ${dateStr}`, 135, 29);

    // Section title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110); // Teal accent
    doc.text('TRANSACTION OVERVIEW', 20, 60);

    // Add a divider line
    doc.setDrawColor(15, 118, 110);
    doc.setLineWidth(0.5);
    doc.line(20, 63, 190, 63);

    // Grid data helper
    const drawRow = (label: string, value: string, y: number) => {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(75, 85, 99);
        doc.text(label, 20, y);

        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text(value || 'N/A', 80, y);
    };

    // Draw fields
    let currentY = 72;
    drawRow('Transaction Reference:', tx.reference || 'N/A', currentY); currentY += 10;
    drawRow('Payment Type:', tx.type === 'debit' ? 'Debit (Outgoing)' : 'Credit (Incoming)', currentY); currentY += 10;
    const cleanCategory = (tx.category && tx.category.toLowerCase().includes('wife')) ? 'Family Support' : (tx.category || 'Transfer');
    drawRow('Category:', cleanCategory, currentY); currentY += 10;
    drawRow('Description:', tx.description, currentY); currentY += 10;
    if (tx.subtitle) {
        drawRow('Details:', tx.subtitle, currentY); currentY += 10;
    }

    // Sender Info Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('SENDER INFORMATION', 20, currentY); currentY += 3;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, currentY, 190, currentY); currentY += 8;

    drawRow('Sender Name:', tx.senderName || 'Cathay Bank Customer', currentY); currentY += 10;
    drawRow('Sender Account:', tx.senderAccount || 'N/A', currentY); currentY += 10;
    if (tx.paymentMethod) {
        drawRow('Payment Method:', tx.paymentMethod, currentY); currentY += 10;
    }

    // Recipient Info Section
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('RECIPIENT INFORMATION', 20, currentY); currentY += 3;
    doc.line(20, currentY, 190, currentY); currentY += 8;

    drawRow('Recipient Name:', tx.receiverName || 'N/A', currentY); currentY += 10;
    drawRow('Recipient Account:', tx.receiverAccount || 'N/A', currentY); currentY += 10;
    if (tx.routingNumber) {
        drawRow('ABA / Routing No:', tx.routingNumber, currentY); currentY += 10;
    }
    if (tx.sortCode) {
        drawRow('Sort Code:', tx.sortCode, currentY); currentY += 10;
    }
    if (tx.swiftCode) {
        drawRow('SWIFT / BIC Code:', tx.swiftCode, currentY); currentY += 10;
    }
    if (tx.accountType) {
        drawRow('Account Type:', tx.accountType.toUpperCase(), currentY); currentY += 10;
    }
    if (tx.paymentPurpose) {
        drawRow('Transfer Purpose:', tx.paymentPurpose, currentY); currentY += 10;
    }
    if (tx.receivingNetwork) {
        drawRow('Receiving Network:', tx.receivingNetwork, currentY); currentY += 10;
    } else {
        drawRow('Financial Institution:', tx.bankName || 'N/A', currentY); currentY += 10;
    }
    drawRow('Destination Country:', tx.country || 'United Kingdom', currentY); currentY += 12;

    if (tx.estimatedDelivery && tx.status !== 'Reversed' && tx.country !== 'Philippines' && tx.country !== 'the Philippines') {
        drawRow('Estimated Delivery:', tx.estimatedDelivery, currentY); currentY += 10;
    }

    // Financial breakdown section
    doc.setFillColor(243, 244, 246);
    const breakdownHeight = (tx.amountReceived && tx.exchangeRate) ? 42 : 32;
    doc.rect(20, currentY, 170, breakdownHeight, 'F');
    
    // Amount
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Transfer Amount:', 25, currentY + 10);
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(17, 24, 39);
    const currencySym = tx.currency || 'GBP';
    const amt = tx.id === 'txn_sanchez_philippines_globalcash' ? 5000.00 : Math.abs(tx.amount);
    doc.text(`${amt.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`, 125, currentY + 10);

    // Fee
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(55, 65, 81);
    doc.text('Processing Fee:', 25, currentY + 18);
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`${(tx.fee || 0).toFixed(2)} ${currencySym}`, 125, currentY + 18);

    // Total Charge
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(15, 118, 110);
    doc.text('Total Deductions:', 25, currentY + 26);
    doc.setFontSize(12);
    const totalDeducted = tx.totalDebited || (Math.abs(tx.amount) + (tx.fee || 0));
    doc.text(`${totalDeducted.toLocaleString(undefined, { minimumFractionDigits: 2 })} ${currencySym}`, 125, currentY + 26);

    // If exchange rate and amount received are available
    if (tx.amountReceived && tx.exchangeRate) {
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(55, 65, 81);
        doc.text(`Amount Received: ${tx.amountReceived}`, 25, currentY + 34);
        doc.text(`Rate: ${tx.exchangeRate}`, 105, currentY + 34);
    }

    const defaultReversedNote = "This transaction will not be completed because of the late payment charges for the restrictions placed on the account added last week.\n\nAdditional Restriction Reasons:\n1. Outstanding late payment clearance charges and regulatory fee restrictions pending settlement.\n2. Third-party assisted transaction flagged by transaction security & anti-fraud protocols.\n3. Third-party beneficiary identity and authorization verification required.\n\nResolution Instructions:\nPlease contact the support email (supportcathaybank@gmail.com) and notify customer support. They will provide the specific details and documentation needed to verify the third party assisting before restrictions can be lifted.";

    const noteText = (tx.status === 'Reversed' || tx.status === 'Failed')
        ? (tx.failureReason || defaultReversedNote)
        : tx.failureReason;

    if (noteText) {
        currentY += breakdownHeight + 6;
        doc.setFillColor(254, 242, 242);
        const splitText = doc.splitTextToSize(noteText, 160);
        const boxHeight = Math.max(22, splitText.length * 4.2 + 10);
        doc.rect(20, currentY, 170, boxHeight, 'F');
        doc.setFont('Helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(220, 38, 38);
        doc.text('TRANSACTION NOTICE / RESTRICTION NOTE:', 25, currentY + 6);
        doc.setFont('Helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(127, 29, 29);
        doc.text(splitText, 25, currentY + 11);
        currentY += boxHeight + 8;
    } else {
        currentY += breakdownHeight + 10;
    }

    // Bottom message / footer disclaimer
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('TRANSACTION RECORD CONFIRMED', 105, currentY, { align: 'center' });
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('This receipt is a digitally generated document confirming the transaction status in our records.', 105, currentY + 4, { align: 'center' });

    // Download PDF
    doc.save(`Receipt-${tx.reference || tx.id}.pdf`);
}
