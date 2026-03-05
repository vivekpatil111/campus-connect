import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StudentProfile {
  name: string;
  field: string;
  educationLevel: string;
  interviewReadiness: number;
  strengths: string[];
  areasForImprovement: string[];
}

interface MockInterviewMCQProps {
  isOpen: boolean;
  onClose: () => void;
  studentProfile: StudentProfile;
}

interface Question {
  id: string;
  text: string;
  category: "behavioral" | "technical" | "logical";
  options: string[];
  correctAnswer: string;
}

const questionBank: Question[] = [
  {
    id: "q1",
    text: "What is the time complexity of binary search?",
    category: "technical",
    options: ["O(n)", "O(log n)", "O(n log n)", "O(1)"],
    correctAnswer: "O(log n)",
  },
  {
    id: "q2",
    text: "Which data structure uses FIFO?",
    category: "technical",
    options: ["Stack", "Queue", "Tree", "Graph"],
    correctAnswer: "Queue",
  },
  {
    id: "q3",
    text: "Find the next number: 2, 6, 12, 20, ?",
    category: "logical",
    options: ["28", "30", "32", "36"],
    correctAnswer: "30",
  },
  {
    id: "q4",
    text: "If all roses are flowers and some flowers fade quickly, what can we conclude?",
    category: "logical",
    options: [
      "All roses fade quickly",
      "Some roses may fade quickly",
      "No roses fade quickly",
      "Roses are not flowers",
    ],
    correctAnswer: "Some roses may fade quickly",
  },
  {
    id: "q5",
    text: "A teammate disagrees with your idea. What should you do?",
    category: "behavioral",
    options: [
      "Ignore them",
      "Discuss and find common ground",
      "Force your decision",
      "Leave the project",
    ],
    correctAnswer: "Discuss and find common ground",
  },
  {
    id: "q6",
    text: "How should you handle tight deadlines?",
    category: "behavioral",
    options: [
      "Panic",
      "Prioritize tasks",
      "Ignore some tasks",
      "Delay the project",
    ],
    correctAnswer: "Prioritize tasks",
  },
  {
    id: "q7",
    text: "Which sorting algorithm has average O(n log n)?",
    category: "technical",
    options: ["Bubble sort", "Merge sort", "Selection sort", "Insertion sort"],
    correctAnswer: "Merge sort",
  },
  {
    id: "q8",
    text: "What comes next: 1, 4, 9, 16, ?",
    category: "logical",
    options: ["20", "24", "25", "30"],
    correctAnswer: "25",
  },
  {
    id: "q9",
    text: "A conflict happens in your team. What is the best response?",
    category: "behavioral",
    options: [
      "Avoid discussion",
      "Resolve calmly",
      "Blame others",
      "Escalate immediately",
    ],
    correctAnswer: "Resolve calmly",
  },
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];

  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    const temp = arr[i];
    arr[i] = arr[j];
    arr[j] = temp;
  }

  return arr;
}

export default function MockInterviewMCQ({ isOpen, onClose, studentProfile }: MockInterviewMCQProps) {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const shuffledQuestions = shuffleArray(questionBank).map((q) => ({
      ...q,
      options: shuffleArray(q.options),
    }));

    setQuestions(shuffledQuestions);
    setSelectedOptions(Array(shuffledQuestions.length).fill(""));
  }, []);

  const selectOption = (option: string) => {
    const updated = [...selectedOptions];
    updated[currentIndex] = option;
    setSelectedOptions(updated);
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const calculateScore = () => {
    let score = 0;

    questions.forEach((q, index) => {
      if (selectedOptions[index] === q.correctAnswer) {
        score++;
      }
    });

    return score;
  };

  const handleClose = () => {
    setSubmitted(false);
    setCurrentIndex(0);
    setSelectedOptions([]);
    onClose();
  };

  if (questions.length === 0) return null;

  const question = questions[currentIndex];
  const score = submitted ? calculateScore() : 0;
  const percentage = submitted ? ((score / questions.length) * 100).toFixed(2) : "0";

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {submitted ? "Test Completed" : `Mock Interview - ${studentProfile.name}`}
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <div className="space-y-4">
            <div className="text-center py-4">
              <h2 className="text-2xl font-bold">
                Score: {score} / {questions.length}
              </h2>
              <h3 className="text-lg text-muted-foreground">Accuracy: {percentage}%</h3>
            </div>

            {questions.map((q, i) => (
              <div key={q.id} className="p-4 border rounded-lg">
                <p className="font-medium">{q.text}</p>
                <p className="mt-2 text-sm">
                  <span className="text-muted-foreground">Your Answer: </span>
                  <span className={selectedOptions[i] === q.correctAnswer ? "text-green-600" : "text-red-600"}>
                    {selectedOptions[i]}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Correct Answer: <span className="text-green-600">{q.correctAnswer}</span>
                </p>
              </div>
            ))}

            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold">
                Question {currentIndex + 1} / {questions.length}
              </h2>
              <p className="text-muted-foreground text-sm capitalize">{question.category}</p>
            </div>

            <p className="text-base">{question.text}</p>

            <div className="space-y-2">
              {question.options.map((opt, index) => (
                <button
                  key={index}
                  onClick={() => selectOption(opt)}
                  className={`w-full p-3 text-left rounded-lg border transition-colors ${
                    selectedOptions[currentIndex] === opt
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : "bg-gray-50 hover:bg-gray-100 border-gray-200"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={prevQuestion}
                disabled={currentIndex === 0}
              >
                Previous
              </Button>

              {currentIndex === questions.length - 1 ? (
                <Button onClick={() => setSubmitted(true)}>
                  Submit Test
                </Button>
              ) : (
                <Button onClick={nextQuestion}>
                  Next
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}