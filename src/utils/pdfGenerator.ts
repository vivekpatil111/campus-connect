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

  // Add header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("Interview Performance Report", 105, 20, { align: "center" });

  // Add subheader
  doc.setFontSize(14);
  doc.setFont("helvetica", "normal");
  doc.text(`Candidate: ${result.candidateName}`, 105, 30, { align: "center" });
  doc.text(`Company: ${result.company} - ${result.role}`, 105, 40, { align: "center" });
  doc.text(`Interview Type: ${result.interviewType}`, 105, 50, { align: "center" });
  doc.text(`Date: ${result.date.toLocaleDateString()}`, 105, 60, { align: "center" });

  // Add scores section
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Performance Scores", 20, 80);

  // Create scores table
  const scoresData = [
    ["Technical Score", `${result.technicalScore}%`],
    ["HR Score", `${result.hrScore}%`],
    ["Overall Score", `${result.overallScore}%`],
    ["Engagement Score", `${result.metrics.engagementScore}%`]
  ];

  autoTable(doc, {
    startY: 85,
    head: [["Category", "Score"]],
    body: scoresData,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60 } }
  });

  // Add behavioral metrics
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Behavioral Metrics", 20, doc.lastAutoTable.finalY + 15);

  const metricsData = [
    ["Camera Active", `${Math.round(result.metrics.cameraOnDuration / result.metrics.totalDuration * 100)}%`],
    ["Face Detected", `${Math.round(result.metrics.faceDetected / result.metrics.totalDuration * 100)}%`],
    ["Speaking Time", `${Math.round(result.metrics.speakingTime / result.metrics.totalDuration * 100)}%`],
    ["Eye Contact", `${result.metrics.eyeContactScore}%`],
    ["Head Stability", `${result.metrics.headStability}%`],
    ["Microphone Activity", `${result.metrics.micActivity}%`]
  ];

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 20,
    head: [["Metric", "Value"]],
    body: metricsData,
    styles: { fontSize: 12 },
    headStyles: { fillColor: [41, 128, 185], textColor: 255 },
    columnStyles: { 0: { cellWidth: 120 }, 1: { cellWidth: 60 } }
  });

  // Add question answers
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Question Answers", 20, doc.lastAutoTable.finalY + 15);

  // Add page break if needed
  if (doc.lastAutoTable.finalY + 100 > doc.internal.pageSize.height) {
    doc.addPage();
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Question Answers (continued)", 20, 20);
  }

  // Add each question and answer
  result.answers.forEach((answer, index) => {
    const startY = index === 0 ? doc.lastAutoTable.finalY + 20 : doc.lastAutoTable.finalY + 5;

    // Check if we need a new page
    if (startY + 80 > doc.internal.pageSize.height) {
      doc.addPage();
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Question ${index + 1}:`, 20, startY);

    doc.setFont("helvetica", "normal");
    const questionLines = doc.splitTextToSize(`Q: ${answer.questionId}`, 170);
    doc.text(questionLines, 20, startY + 10);

    doc.setFont("helvetica", "normal");
    const answerLines = doc.splitTextToSize(`A: ${answer.transcript}`, 170);
    doc.text(answerLines, 20, startY + 20 + (questionLines.length * 7));

    // Add metrics for this answer
    doc.setFontSize(10);
    doc.text(`Time taken: ${answer.timeTaken / 1000} seconds`, 20, startY + 30 + (questionLines.length * 7) + (answerLines.length * 7));
    doc.text(`Words: ${answer.transcript.split(/\s+/).length}`, 20, startY + 35 + (questionLines.length * 7) + (answerLines.length * 7));
    doc.text(`Face detected: ${answer.behavioralMetrics.faceDetectedPercentage}%`, 20, startY + 40 + (questionLines.length * 7) + (answerLines.length * 7));

    // Add separator
    doc.setDrawColor(200);
    doc.line(20, startY + 45 + (questionLines.length * 7) + (answerLines.length * 7), 190, startY + 45 + (questionLines.length * 7) + (answerLines.length * 7));
  });

  // Add footer
  doc.setFontSize(10);
  doc.setFont("helvetica", "italic");
  doc.text("Generated by CampusPrep Interview System", 105, doc.internal.pageSize.height - 10, { align: "center" });
  doc.text("From Campus to Career • Built by Team Block Minds", 105, doc.internal.pageSize.height - 5, { align: "center" });

  // Return as blob
  return new Blob([doc.output("blob")], { type: "application/pdf" });
};