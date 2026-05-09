const quizScoringService = require('../../src/services/quizScoringService');

describe('QuizScoringService', () => {
  describe('calculateGroupScores', () => {
    it('should calculate scores for each group correctly', () => {
      const answers = [
        { questionId: 1, group: 'energy', selectedOption: 2, score: 4 },
        { questionId: 2, group: 'energy', selectedOption: 1, score: 2 },
        { questionId: 3, group: 'energy', selectedOption: 3, score: 5 },
        { questionId: 4, group: 'work', selectedOption: 2, score: 3 },
        { questionId: 5, group: 'work', selectedOption: 3, score: 4 },
        { questionId: 6, group: 'psychology', selectedOption: 1, score: 2 },
        { questionId: 7, group: 'psychology', selectedOption: 2, score: 3 },
        { questionId: 8, group: 'environment', selectedOption: 3, score: 4 },
        { questionId: 9, group: 'environment', selectedOption: 2, score: 3 },
        { questionId: 10, group: 'energy', selectedOption: 4, score: 5 }
      ];

      const scores = quizScoringService.calculateGroupScores(answers);

      expect(scores.energy).toBe(80); // Average of 4,2,5,5 = 4 * 20 = 80
      expect(scores.work).toBe(70);   // Average of 3,4 = 3.5 * 20 = 70
      expect(scores.psychology).toBe(50); // Average of 2,3 = 2.5 * 20 = 50
      expect(scores.environment).toBe(70); // Average of 4,3 = 3.5 * 20 = 70
    });

    it('should handle empty groups', () => {
      const answers = [
        { questionId: 1, group: 'energy', selectedOption: 2, score: 4 }
      ];

      const scores = quizScoringService.calculateGroupScores(answers);

      expect(scores.energy).toBeGreaterThan(0);
      expect(scores.work).toBe(0);
      expect(scores.psychology).toBe(0);
      expect(scores.environment).toBe(0);
    });
  });

  describe('determineState', () => {
    it('should identify exhausted state', () => {
      const scores = {
        energy: 10,
        work: 30,
        psychology: 20,
        environment: 15
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('exhausted');
      expect(result.details.emoji).toBe('😫');
    });

    it('should identify tired state', () => {
      const scores = {
        energy: 30,
        work: 40,
        psychology: 45,
        environment: 50
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('tired');
    });

    it('should identify lazy with deadline state', () => {
      const scores = {
        energy: 30,
        work: 70,
        psychology: 40,
        environment: 50
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('lazy_with_deadline');
    });

    it('should identify ready state', () => {
      const scores = {
        energy: 60,
        work: 55,
        psychology: 60,
        environment: 65
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('ready');
    });

    it('should identify focused state', () => {
      const scores = {
        energy: 80,
        work: 75,
        psychology: 85,
        environment: 70
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('focused');
    });

    it('should identify unmotivated state', () => {
      const scores = {
        energy: 55,
        work: 30,
        psychology: 35,
        environment: 40
      };

      const result = quizScoringService.determineState(scores);
      expect(result.state).toBe('unmotivated');
    });
  });

  describe('processQuiz', () => {
    it('should process full quiz and return complete result', () => {
      const answers = [
        { questionId: 1, group: 'energy', selectedOption: 3, score: 5 },
        { questionId: 2, group: 'energy', selectedOption: 3, score: 5 },
        { questionId: 3, group: 'energy', selectedOption: 3, score: 5 },
        { questionId: 4, group: 'work', selectedOption: 3, score: 5 },
        { questionId: 5, group: 'work', selectedOption: 3, score: 5 },
        { questionId: 6, group: 'psychology', selectedOption: 3, score: 5 },
        { questionId: 7, group: 'psychology', selectedOption: 3, score: 5 },
        { questionId: 8, group: 'environment', selectedOption: 3, score: 5 },
        { questionId: 9, group: 'environment', selectedOption: 3, score: 5 },
        { questionId: 10, group: 'work', selectedOption: 3, score: 5 }
      ];

      const result = quizScoringService.processQuiz(answers);

      expect(result).toHaveProperty('scores');
      expect(result).toHaveProperty('state');
      expect(result).toHaveProperty('stateDetails');
      expect(result.stateDetails).toHaveProperty('recommendations');
      expect(result.stateDetails.recommendations.length).toBeGreaterThan(0);
    });
  });
});