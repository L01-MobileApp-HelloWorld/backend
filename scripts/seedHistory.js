require('dotenv').config();

const mongoose = require('mongoose');
const History = require('../src/models/History');
const User = require('../src/models/User');
const quizScoringService = require('../src/services/quizScoringService');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ban_hay_luoi';
const TARGET_USER_ID = '6a0534e546e1b8dc38a8eb3b';

const QUESTION_GROUPS = {
  1: 'energy',
  2: 'energy',
  3: 'work',
  4: 'work',
  5: 'psychology',
  6: 'environment',
  7: 'energy',
  8: 'work',
  9: 'psychology',
  10: 'environment'
};

const HISTORY_BLUEPRINTS = [
  {
    label: 'Exhausted after multiple late nights',
    options: [1, 1, 2, 2, 1, 2, 1, 1, 1, 2],
    meta: {
      completionTime: 171,
      deviceInfo: 'iPhone 15 Pro / iOS 18.1',
      appVersion: '1.0.0'
    }
  },
  {
    label: 'Tired during a long weekday',
    options: [2, 2, 2, 1, 3, 2, 2, 2, 2, 2],
    meta: {
      completionTime: 138,
      deviceInfo: 'Samsung Galaxy S24 / Android 15',
      appVersion: '1.0.0'
    }
  },
  {
    label: 'Low energy but deadline is close',
    options: [2, 2, 4, 4, 2, 3, 2, 4, 2, 2],
    meta: {
      completionTime: 124,
      deviceInfo: 'Xiaomi 14 / Android 14',
      appVersion: '1.0.1'
    }
  },
  {
    label: 'Ready for a productive session',
    options: [3, 3, 3, 3, 3, 2, 3, 2, 3, 3],
    meta: {
      completionTime: 102,
      deviceInfo: 'iPhone 13 / iOS 17.6',
      appVersion: '1.0.1'
    }
  },
  {
    label: 'High focus and good momentum',
    options: [4, 4, 4, 4, 4, 3, 4, 3, 4, 4],
    meta: {
      completionTime: 91,
      deviceInfo: 'iPad Air / iPadOS 18.0',
      appVersion: '1.0.2'
    }
  },
  {
    label: 'Decent energy but low motivation',
    options: [3, 3, 1, 1, 2, 3, 3, 1, 2, 3],
    meta: {
      completionTime: 149,
      deviceInfo: 'Google Pixel 9 / Android 15',
      appVersion: '1.0.2'
    }
  },
  {
    label: 'Recovered a bit but still tired',
    options: [2, 3, 2, 2, 2, 2, 2, 1, 2, 3],
    meta: {
      completionTime: 133,
      deviceInfo: 'iPhone 14 / iOS 18.0',
      appVersion: '1.0.3'
    }
  },
  {
    label: 'Deadline pressure again',
    options: [2, 2, 4, 3, 2, 2, 2, 4, 2, 3],
    meta: {
      completionTime: 116,
      deviceInfo: 'OnePlus 12 / Android 14',
      appVersion: '1.0.3'
    }
  },
  {
    label: 'Balanced and stable day',
    options: [3, 3, 3, 2, 3, 3, 3, 3, 3, 2],
    meta: {
      completionTime: 97,
      deviceInfo: 'iPhone 15 / iOS 18.1',
      appVersion: '1.0.4'
    }
  },
  {
    label: 'Best day of the streak',
    options: [4, 4, 4, 3, 4, 4, 4, 4, 4, 3],
    meta: {
      completionTime: 88,
      deviceInfo: 'Samsung Galaxy Tab S9 / Android 14',
      appVersion: '1.0.4'
    }
  }
];

function buildAnswers(options) {
  return options.map((selectedOption, index) => {
    const questionId = index + 1;

    return {
      questionId,
      group: QUESTION_GROUPS[questionId],
      selectedOption,
      score: selectedOption
    };
  });
}

function buildHistories() {
  const now = new Date();

  return HISTORY_BLUEPRINTS.map((blueprint, index) => {
    const answers = buildAnswers(blueprint.options);
    const result = quizScoringService.processQuiz(answers);
    const createdAt = new Date(now);

    createdAt.setDate(now.getDate() - (HISTORY_BLUEPRINTS.length - 1 - index));
    createdAt.setHours(8 + (index % 5), 10 + (index * 3), 0, 0);

    return {
      userId: new mongoose.Types.ObjectId(TARGET_USER_ID),
      answers,
      scores: result.scores,
      state: result.state,
      stateDetails: result.stateDetails,
      meta: {
        ...blueprint.meta,
        note: blueprint.label
      },
      createdAt
    };
  });
}

async function ensureUserExists() {
  const existingUser = await User.findById(TARGET_USER_ID);

  if (existingUser) {
    return existingUser;
  }

  return User.create({
    _id: new mongoose.Types.ObjectId(TARGET_USER_ID),
    username: 'seeded_huynguyen',
    email: 'seeded.huynguyen@example.com',
    password: 'Password1',
    displayName: 'Seeded Huy Nguyen'
  });
}

async function syncUserStats(histories) {
  const user = await User.findById(TARGET_USER_ID);

  if (!user) {
    return;
  }

  const sorted = [...histories].sort((a, b) => a.createdAt - b.createdAt);

  user.stats.totalQuizzes = histories.length;
  user.stats.currentStreak = histories.length;
  user.stats.longestStreak = histories.length;
  user.stats.lastQuizDate = sorted[sorted.length - 1].createdAt;

  await user.save();
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  try {
    await ensureUserExists();

    const histories = buildHistories();
    const inserted = await History.insertMany(histories, { ordered: true });

    await syncUserStats(histories);

    console.log(`Seeded ${inserted.length} history items for user ${TARGET_USER_ID}`);
    inserted.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.createdAt.toISOString()} | ${item.state} | total=${item.scores.total}`
      );
    });
  } finally {
    await mongoose.disconnect();
  }
}

run().catch((error) => {
  console.error('History seeding failed:', error);
  process.exit(1);
});
