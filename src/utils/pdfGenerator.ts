import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

interface InterviewAnswer {
  questionId: string;
  transcript: string;
  timeTaken: number;
  timestamp: Date;
  behavioralMetrics: {
    faceDetectedPercentage: number;
    eyeContactScore: number;
    headStability: number;
    cameraOnDuration: number;
    micActivity: number;
    speakingPercentage?: number;
  };
}

interface InterviewMetrics {
  cameraOnDuration: number;
  faceDetected: number;
  speakingTime: number;
  totalDuration: number;
  eyeContactScore: number;
  headStability: number;
  micActivity: number;
  engagementScore: number;
}

interface InterviewResult {
  company: string;
  role: string;
  interviewType: string;
  answers: InterviewAnswer[];
  metrics: InterviewMetrics;
  technicalScore: number;
  hrScore: number;
  overallScore: number;
  candidateName: string;
  candidateEmail: string;
  date: Date;
}

export const generateInterviewPDF = (result: InterviewResult): Blob => {
  const doc = new jsPDF();

  // Track Y position manually
  let currentY = 20;

  // Add header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Performance Report", 105, currentY, { align: "center" });
  currentY += 10;

  // Add subheader
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Candidate: ${result.candidateName}`, 105, currentY, { align: "center" });
  currentY += 10;
  doc.text(`Company: ${result.company} - ${result.role}`, 105, currentY, { align: "center" });
  currentY += 10;
  doc.text(`Interview Type: ${result.interviewType}`, 105, currentY, { align: "center" });
  currentY += 10;
  doc.text(`Date: ${result.date.toLocaleDateString()}`, 105, currentY, { align: "center" });
  currentY += 20;

  // Add scores section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Scores", 20, currentY);
  currentY += 10;

  // Create scores table
  const scoresData = [
    ["Technical Score", `${result.technicalScore}%`],
    ["HR Score", `${result.hrScore}%`],
    ["Overall Score", `${result.overallScore}%`],
    ["Engagement Score", `${result.metrics.engagementScore}%`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Category", "Score"]],
    body: scoresData,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60 } }
  });

  // Update Y position after table
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Add behavioral metrics
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Behavioral Metrics", 20, currentY);
  currentY += 10;

  const metricsData = [
    ["Camera Active", `${Math.round(result.metrics.cameraOnDuration / result.metrics.totalDuration * 100)}%`],
    ["Face Detected", `${Math.round(result.metrics.faceDetected / result.metrics.totalDuration * 100)}%`],
    ["Speaking Time", `${Math.round(result.metrics.speakingTime / result.metrics.totalDuration * 100)}%`],
    ["Eye Contact", `${result.metrics.eyeContactScore}%`],
    ["Head Stability", `${result.metrics.headStability}%`],
    ["Microphone Activity", `${result.metrics.micActivity}%`]
  ];

  autoTable(doc, {
    startY: currentY,
    head: [["Metric", "Value"]],
    body: metricsData,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60 } }
  });

  // Update Y position after table
  currentY = (doc as any).lastAutoTable.finalY + 15;

  // Add question answers
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Question Answers", 20, currentY);
  currentY += 10;

  // Add page break if needed
  if (currentY + 100 > doc.internal.pageSize.height) {
    doc.addPage();
    currentY = 20;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Question Answers (continued)", 20, currentY);
    currentY += 10;
  }

  // Add each question and answer
  result.answers.forEach((answer, index) => {
    // Check if we need a new page
    if (currentY + 80 > doc.internal.pageSize.height) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Question ${index + 1}:`, 20, currentY);
    currentY += 10;

    doc.setFont("helvetica", "normal");
    const questionLines = doc.splitTextToSize(`Q: ${answer.questionId}`, 170);
    doc.text(questionLines, 20, currentY);
    currentY += (questionLines.length * 7) + 10;

    doc.setFont("helvetica", "normal");
    const answerLines = doc.splitTextToSize(`A: ${answer.transcript}`, 170);
    doc.text(answerLines, 20, currentY);
    currentY += (answerLines.length * 7) + 10;

    // Add metrics for this answer
    doc.setFontSize(10);
    doc.text(`Time taken: ${answer.timeTaken / 1000} seconds`, 20, currentY);
    currentY += 5;
    doc.text(`Words: ${answer.transcript.split(/\s+/).length}`, 20, currentY);
    currentY += 5;
    doc.text(`Face detected: ${answer.behavioralMetrics.faceDetectedPercentage}%`, 20, currentY);
    currentY += 10;

    // Add separator
    doc.setDrawColor(200);
    doc.line(20, currentY, 190, currentY);
    currentY += 10;
  });

  // Add footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Generated by CampusPrep Interview System", 105, doc.internal.pageSize.height - 10, { align: "center" });
  doc.text("From Campus to Career • Built by Team Block Minds", 105, doc.internal.pageSize.height - 5, { align: "center" });

  // Return as blob
  return new Blob([doc.output("blob")], { type: "application/pdf" });
};