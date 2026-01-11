// ... (keep existing imports)

  // Update the interviewRounds state to match the InterviewRound type
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>(() => {
    const state = location.state as { rounds?: InterviewRound[] } | null;
    if (state?.rounds) {
      return state.rounds;
    }

    // Define ONLY the required rounds for all companies and roles with proper types
    return [
      { id: "technical", name: "Technical Interview", description: "In-depth technical questions related to your role", status: "not-started" },
      { id: "hr", name: "HR / Behavioral", description: "Personality and cultural fit assessment", status: "not-started" },
      { id: "gd", name: "Group Discussion (GD)", description: "Collaborative discussion with AI participants", status: "not-started" }
    ];
  });

  // ... (keep rest of the code the same)