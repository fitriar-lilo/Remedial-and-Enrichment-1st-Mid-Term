import jsPDF from 'jspdf';
import { QUESTIONS } from '../data/questions';
import { QuizProgress, TopicType } from '../types';

export function exportQuizPDF(progress: QuizProgress, studentName: string) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  let currentY = 16;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 18) {
      doc.addPage();
      currentY = 16;
      drawHeaderSmall();
    }
  };

  const drawHeaderSmall = () => {
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Cambridge IGCSE Mathematics (0580) - Diagnostic Practice Report', margin, currentY);
    doc.setDrawColor(226, 234, 228);
    doc.line(margin, currentY + 2, margin + contentWidth, currentY + 2);
    currentY += 8;
  };

  // ==========================================
  // 1. MAIN REPORT HEADER
  // ==========================================
  // Soft Sage banner
  doc.setFillColor(61, 107, 86);
  doc.roundedRect(margin, currentY, contentWidth, 24, 3, 3, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text('Cambridge IGCSE Mathematics (0580)', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10.5);
  doc.setTextColor(235, 244, 238);
  doc.text('Personalised Student Assessment & Practice Diagnostic Report', margin + 6, currentY + 16);

  currentY += 30;

  // Metadata Card
  doc.setFillColor(248, 250, 248);
  doc.setDrawColor(226, 234, 228);
  doc.roundedRect(margin, currentY, contentWidth, 22, 2, 2, 'FD');

  const nameDisplay = studentName.trim() || 'IGCSE Candidate';
  const examDate = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // Calculate totals
  let totalPoints = 0;
  let totalAttempts = 0;
  Object.values(progress.answers).forEach((ans) => {
    totalPoints += ans.pointsEarned;
    totalAttempts += ans.attemptsCount;
  });
  const maxPoints = 100;
  const percentage = Math.round((totalPoints / maxPoints) * 100);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(45, 62, 53);
  doc.text('Student Name:', margin + 6, currentY + 7);
  doc.setFont('helvetica', 'normal');
  doc.text(nameDisplay, margin + 34, currentY + 7);

  doc.setFont('helvetica', 'bold');
  doc.text('Date of Quiz:', margin + 6, currentY + 14);
  doc.setFont('helvetica', 'normal');
  doc.text(examDate, margin + 34, currentY + 14);

  // Score Pill on the right
  doc.setFillColor(61, 107, 86);
  doc.roundedRect(margin + contentWidth - 52, currentY + 3.5, 46, 15, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text(`Score: ${totalPoints} / 100`, margin + contentWidth - 49, currentY + 9.5);
  doc.setFontSize(9);
  doc.text(`Accuracy: ${percentage}%`, margin + contentWidth - 49, currentY + 15);

  currentY += 28;

  // ==========================================
  // 2. TOPIC BREAKDOWN
  // ==========================================
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(45, 62, 53);
  doc.text('Topic Performance Summary', margin, currentY);
  currentY += 5;

  const topics: TopicType[] = [
    'Factorising quadratics',
    'Roots/solutions of quadratics',
    'Trigonometric ratios',
    'Scatter diagrams',
    'Managing money',
  ];

  // Table header
  doc.setFillColor(235, 244, 238);
  doc.rect(margin, currentY, contentWidth, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(45, 62, 53);
  doc.text('Topic Title', margin + 3, currentY + 4.8);
  doc.text('Questions', margin + 85, currentY + 4.8);
  doc.text('Points Earned', margin + 115, currentY + 4.8);
  doc.text('Total Possible', margin + 145, currentY + 4.8);
  doc.text('Proficiency', margin + 168, currentY + 4.8);
  currentY += 7;

  topics.forEach((t) => {
    const qInTopic = QUESTIONS.filter((q) => q.topic === t);
    const topicMax = qInTopic.length * 4;
    const earned = qInTopic.reduce((sum, q) => sum + (progress.answers[q.id]?.pointsEarned || 0), 0);
    const pct = Math.round((earned / topicMax) * 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(t, margin + 3, currentY + 4.5);
    doc.text(`${qInTopic.length}`, margin + 92, currentY + 4.5);
    doc.text(`${earned}`, margin + 124, currentY + 4.5);
    doc.text(`${topicMax}`, margin + 153, currentY + 4.5);
    doc.setFont('helvetica', 'bold');
    doc.text(`${pct}%`, margin + 172, currentY + 4.5);

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 6.5, margin + contentWidth, currentY + 6.5);
    currentY += 6.5;
  });

  currentY += 7;

  // ==========================================
  // 3. ATTEMPT ANALYSIS TABLE
  // ==========================================
  checkPageBreak(35);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(45, 62, 53);
  doc.text('Question Attempt Analysis Table', margin, currentY);
  currentY += 5;

  // Table header
  doc.setFillColor(235, 244, 238);
  doc.rect(margin, currentY, contentWidth, 6.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(45, 62, 53);
  doc.text('Q#', margin + 2, currentY + 4.5);
  doc.text('Topic', margin + 14, currentY + 4.5);
  doc.text('Attempts', margin + 95, currentY + 4.5);
  doc.text('Points', margin + 125, currentY + 4.5);
  doc.text('Hints Used', margin + 148, currentY + 4.5);
  doc.text('Result Tier', margin + 168, currentY + 4.5);
  currentY += 6.5;

  QUESTIONS.forEach((q) => {
    checkPageBreak(6);
    const ans = progress.answers[q.id];
    const attempts = ans?.attemptsCount || 0;
    const points = ans?.pointsEarned || 0;
    const hints = ans?.hintsRevealedCount || 0;
    const tier = attempts === 1 ? '1st Attempt (4 pts)' : attempts === 2 ? '2nd Attempt (3 pts)' : attempts === 3 ? '3rd Attempt (2 pts)' : `${attempts}th Attempt (1 pt)`;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.8);
    doc.setTextColor(51, 65, 85);
    doc.text(`Q${q.id}`, margin + 2, currentY + 4.2);
    doc.text(q.topic, margin + 14, currentY + 4.2);
    doc.text(`${attempts}`, margin + 102, currentY + 4.2);
    doc.text(`${points} / 4`, margin + 127, currentY + 4.2);
    doc.text(`${hints}`, margin + 154, currentY + 4.2);
    doc.text(tier, margin + 168, currentY + 4.2);

    doc.setDrawColor(241, 245, 249);
    doc.line(margin, currentY + 5.5, margin + contentWidth, currentY + 5.5);
    currentY += 5.5;
  });

  currentY += 8;

  // ==========================================
  // 4. DETAILED QUESTION & ANSWER REVIEW
  // ==========================================
  checkPageBreak(40);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(45, 62, 53);
  doc.text('Detailed Answer Review & Worked Solutions', margin, currentY);
  currentY += 6;

function cleanLatexForPdf(text: string): string {
  return text
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)')
    .replace(/\\times/g, '×')
    .replace(/\\pm/g, '±')
    .replace(/\\sqrt\{([^}]+)\}/g, '√$1')
    .replace(/\^2/g, '²')
    .replace(/\^\\circ/g, '°')
    .replace(/\\circ/g, '°')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\cos/g, 'cos')
    .replace(/\\sin/g, 'sin')
    .replace(/\\tan/g, 'tan')
    .replace(/\\angle/g, '∠')
    .replace(/\\%/g, '%')
    .replace(/\\\$/g, '$')
    .replace(/\$([^\$]+)\$/g, '$1')
    .replace(/\\/g, '');
}

  QUESTIONS.forEach((q) => {
    const ans = progress.answers[q.id];
    const correctOpt = q.options.find((o) => o.isCorrect);

    const qClean = cleanLatexForPdf(q.questionText);
    const expClean = cleanLatexForPdf(q.explanation);
    const ansClean = cleanLatexForPdf(correctOpt?.text || '');

    // Estimate box height
    const qLines = doc.splitTextToSize(`Q${q.id}. [${q.topic}] ${qClean}`, contentWidth - 8);
    const expLines = doc.splitTextToSize(`Worked Solution: ${expClean}`, contentWidth - 8);
    const boxHeight = 12 + qLines.length * 3.8 + expLines.length * 3.5;

    checkPageBreak(boxHeight + 4);

    doc.setFillColor(250, 252, 250);
    doc.setDrawColor(226, 234, 228);
    doc.roundedRect(margin, currentY, contentWidth, boxHeight, 1.5, 1.5, 'FD');

    // Header within card
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(45, 62, 53);
    doc.text(qLines, margin + 4, currentY + 5);

    let innerY = currentY + 5 + qLines.length * 3.8;

    // Correct Answer line
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(36, 107, 72);
    doc.text(`Correct Answer: ${ansClean}`, margin + 4, innerY);
    
    // Performance badge
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(`(Attempts: ${ans?.attemptsCount || 0} | Points: ${ans?.pointsEarned || 0}/4)`, margin + 85, innerY);

    innerY += 4.5;

    // Explanation text
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);
    doc.text(expLines, margin + 4, innerY);

    currentY += boxHeight + 3.5;
  });

  // Footer on each page
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184);
    doc.text(
      `IGCSE Mathematics 0580 Self-Study Diagnostic | Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 8,
      { align: 'center' }
    );
  }

  // Trigger download
  const safeFilename = `IGCSE_Math_Report_${nameDisplay.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
