import type { Dict } from './id'

/**
 * Kamus Bahasa Inggris — bertipe `Dict` sehingga TypeScript memaksa
 * setiap key Bahasa Indonesia memiliki padanan dengan signature yang sama.
 */
const en: Dict = {
  // Navigation
  'tab.home': 'Home',
  'tab.levels': 'Learn',
  'tab.practice': 'Practice',
  'tab.achievements': 'Awards',
  'nav.mainAria': 'Main navigation',
  'nav.bottomAria': 'Bottom navigation',
  'header.back': 'Back',
  'header.muteSound': 'Turn sound off',
  'header.unmuteSound': 'Turn sound on',

  // Home
  'home.askName': "Hi! I'm Asya. First things first — what's your name?",
  'home.greetingNoName':
    "Hi! I'm Asya. Let's learn column math! Start with the ones place, then move to the tens.",
  'home.greetingName': (p: { name: string }) =>
    `Hi, ${p.name}! Let's learn column math! Start with the ones place, then move to the tens.`,
  'home.greetingEdit': (p: { name: string }) =>
    `Hi, ${p.name}! Want to change your name? Write the new one below.`,
  'home.editName': '✏️ Change name',
  'home.summaryAria': 'Progress summary',
  'home.levelsDone': 'Levels done',
  'home.dayStreak': 'Day streak',
  'home.correctCount': 'Correct answers',
  'home.actionsAria': 'Main actions',
  'home.continueWithLevel': (p: { level: string }) => `▶ Continue: ${p.level}`,
  'home.continueNone': '▶ Continue (start with level one first)',
  'home.startLearning': '📚 Start Learning',
  'home.practice': '✏️ Practice',
  'home.recentAchievements': 'Recent achievements 🏆',

  // Child name form
  'form.label': "What's your name?",
  'form.placeholder': 'Nickname',
  'form.ariaLabel': "Child's nickname",
  'form.save': 'Save Name',
  'form.skip': 'Skip for now',
  'form.deviceNote': 'Your name stays on this device only.',
  'form.errorEmpty': 'Please write your name first.',

  // Settings
  'settings.title': 'Settings',
  'settings.nameSection': "Child's Name ✏️",
  'settings.nameDesc':
    'The nickname is used in greetings and on achievement cards when shared. Optional.',
  'settings.deleteName': '🗑️ Remove name',
  'settings.languageSection': 'Language 🌐',
  'settings.languageDesc': 'Changes apply across the whole app instantly.',
  'settings.sound': 'Sound 🔊',
  'settings.soundDesc': 'Friendly sounds for correct or wrong answers',
  'settings.animations': 'Animations ✨',
  'settings.animationsDesc':
    'Small delightful animations (also follows your device setting when off)',
  'settings.dataSection': 'Reset Progress',
  'settings.dataDesc':
    'All levels, scores, and achievements will be removed from this device. This cannot be undone.',
  'settings.deleteProgress': '🗑️ Reset Progress',
  'settings.privacyNote':
    '🔒 Asharu Math stores progress only on this device (localStorage) and never collects names, photos, or any other personal data of children.',
  'dialog.deleteTitle': 'Erase all progress?',
  'dialog.deleteDesc':
    'Completed levels, scores, and achievements will be gone. You can always start learning again from scratch.',
  'dialog.confirmDelete': 'Yes, erase',
  'dialog.cancel': 'Cancel',
  'dialog.yes': 'Yes',

  // Level select
  'levels.bubble':
    'Pick a level! Finish levels in order to unlock the next one. You can replay old levels anytime.',
  'levelCard.numbered': (p: { number: number; name: string }) => `Level ${p.number}: ${p.name}`,
  'levelCard.challenge': (p: { name: string }) => `Challenge: ${p.name}`,
  'levelCard.start': 'Start',
  'levelCard.repeat': 'Replay',
  'levelCard.examplePrefix': 'Example:',
  'levelCard.questionSuffix': (p: { n: number }) => `${p.n} questions`,
  'levelCard.notFinished': 'Not finished yet',
  'levelCard.lockedHint': 'Finish the previous level first',

  // Achievements & share
  'ach.bubble': (p: { count: number; total: number }) =>
    `You've unlocked ${p.count} out of ${p.total} achievements. Collect them all!`,
  'ach.unlockedAt': (p: { date: string }) => `Unlocked on ${p.date}`,
  'share.open': '🔗 Share',
  'share.title': 'Share Achievement 🎉',
  'share.closePanel': 'Close share panel',
  'share.preparing': 'Preparing image…',
  'share.imageAlt': (p: { name: string; child: string | null }) =>
    p.child ? `${p.name} achievement card of ${p.child}` : `${p.name} achievement card`,
  'share.sendImage': '📤 Share Image',
  'share.downloadImage': '⬇️ Download Image',
  'share.viaDevice': '🔗 Share via device',
  'share.copyText': '📋 Copy Text',
  'share.sharedOk': 'Achievement shared successfully!',
  'share.downloadOk': 'Achievement card downloaded!',
  'share.copyOk': 'Achievement text copied!',
  'share.shareFail': "Can't share right now. Try downloading the image instead.",
  'share.copyFail': "Can't copy right now.",
  'share.template': (p: { intro: string; achievement: string; url: string }) =>
    `${p.intro}I just earned the '${p.achievement}' badge on Asharu Math! Come learn math with me at ${p.url}`,
  'share.introWithName': (p: { name: string }) => `My name is ${p.name}. `,
  'ach.cardLabel': 'A C H I E V E M E N T',
  'ach.greet': (p: { name: string | null }) => (p.name ? `Great job, ${p.name}!` : 'Great job!'),

  // Session result
  'result.titleSuffix': (p: { title: string }) => `${p.title} complete! 🎉`,
  'result.starsAria': (p: { stars: number }) => `You got ${p.stars} out of 3 stars`,
  'result.totalQuestions': 'Questions',
  'result.firstTry': 'Correct first try',
  'result.recovered': 'Fixed',
  'result.newAchievements': 'New achievements! 🏆',
  'result.nextActionsAria': 'Next actions',
  'result.practiceAgain': '🔁 Practice Again',
  'result.retryLevel': '🔁 Replay Level',
  'result.nextLevel': 'Next Level →',
  'result.goHome': '🏠 Home',

  // Learn mode
  'learn.sessionAria': 'Session progress',
  'learn.questionOf': (p: { current: number; total: number }) =>
    `Question ${p.current} of ${p.total}`,
  'learn.progressLabel': (p: { current: number; total: number }) =>
    `Learning progress, question ${p.current} of ${p.total}`,
  'learn.finishedTitle': "Done! You're amazing! 🎉",
  'learn.preparingResult': 'Preparing your results…',
  'learn.exitTitle': 'Leave the level?',
  'learn.exitDesc':
    "This level isn't finished yet, so it won't be saved. Keep going to unlock the next one!",
  'learn.exitConfirm': 'Yes, leave',
  'learn.exitCancel': 'Keep Learning',

  // Step instructions (translated at render time)
  'steps.introAdd': (p: { first: number; second: number }) =>
    `Let's add ${p.first} + ${p.second}! We start from the ones column. Press Next to begin.`,
  'steps.introSub': (p: { first: number; second: number }) =>
    `Let's subtract ${p.second} from ${p.first}! We start from the ones column. Press Next to begin.`,
  'steps.writeCarryAnswer': (p: { carryIn: number; place: string }) =>
    `Write the carried ${p.carryIn} into the ${p.place} answer box.`,
  'steps.interimFirst': (p: { a: number; b: number }) =>
    `Start with the ones. What is ${p.a} + ${p.b}? Type it in the Counting Box, then press the green Check button.`,
  'steps.interimNext': (p: { sumText: string }) =>
    `Now compute ${p.sumText}. Type it in the Counting Box, then press the green Check button.`,
  'steps.answerFromSum': (p: { rawSum: number; digit: number; place: string }) =>
    `That makes ${p.rawSum}. Write ${p.digit} in the ${p.place} answer box.`,
  'steps.writeCarryBox': (p: { carryOut: number; place: string }) =>
    `Carry the ${p.carryOut} into the ${p.place} carry box.`,
  'steps.writeAnswerPlain': (p: { digit: number; place: string }) =>
    `Write ${p.digit} in the ${p.place} answer box.`,
  'steps.reviewAdd': (p: { first: number; second: number; result: number }) =>
    `Awesome! ${p.first} + ${p.second} = ${p.result}.`,
  'steps.reviewSub': (p: { first: number; second: number; result: number }) =>
    `Awesome! ${p.first} − ${p.second} = ${p.result}.`,
  'steps.borrowQuestion': (p: { top: number; bottom: number }) =>
    `Can ${p.top} take away ${p.bottom}?`,
  'steps.borrowExplainChain': (p: { top: number; bottom: number }) =>
    `${p.top} isn't enough to take away ${p.bottom}, and the column on the left is a 0. The borrow travels until it finds a column that can lend. Watch the changes, then press Next.`,
  'steps.borrowExplainSimple': (p: { top: number; bottom: number; leftPlace: string }) =>
    `${p.top} isn't enough to take away ${p.bottom}. Let's borrow 10 from the ${p.leftPlace} column. Watch the changes, then press Next.`,
  'steps.subtractAfterBorrow': (p: { topAfter: number; bottom: number; place: string }) =>
    `Now what is ${p.topAfter} − ${p.bottom}? Write it in the ${p.place} box.`,
  'steps.subtractChainMid': (p: { topAfter: number; bottom: number; place: string }) =>
    `Remember, that 0 was borrowed from and then borrowed 10, so it became ${p.topAfter}. What is ${p.topAfter} − ${p.bottom}? Write it in the ${p.place} box.`,
  'steps.subtractPlain': (p: {
    original: number
    effective: number
    bottom: number
    place: string
  }) => {
    const reminder =
      p.effective !== p.original
        ? `Remember, ${p.original} lent 1 so it became ${p.effective}. `
        : ''
    return `${reminder}What is ${p.effective} − ${p.bottom}? Write it in the ${p.place} box.`
  },

  // Place values
  'answer.aria': (p: { place: string; value: number | null }) =>
    p.value === null
      ? `${p.place} answer box, empty`
      : `${p.place} answer box, contains ${p.value}`,
  'carry.aria': (p: { place: string; value: number | null }) =>
    p.value === null ? `${p.place} carry box, empty` : `${p.place} carry box, contains ${p.value}`,
  'borrow.newValueAria': (p: { place: string; after: number }) =>
    `New value for the ${p.place} column: ${p.after}`,
  'borrow.becomes': (p: { place: string; after: number }) => `${p.place} becomes ${p.after}`,
  'learn.adhocTitle': 'Step-by-Step Learning',
  'practice.sessionTitle': 'Practice Session',
  'practice.customSessionTitle': 'Your Own Question',
  'mascot.aria': 'Asya, Asharu Math mascot',
  'place.units': 'ones',
  'place.tens': 'tens',
  'place.hundreds': 'hundreds',
  'place.thousands': 'thousands',
  'join.and': ' and ',

  // Practice hints
  'hint.genericRight': 'Remember, start from the right side.',
  'hint.genericUnits': 'Check the ones column first.',
  'hint.genericSlow': 'Take it slow, one column at a time.',
  'hint.places': (p: { places: string }) => `Almost! Check the ${p.places} column again.`,
  'hint.carry': 'Is there a digit that needs carrying? Try counting again starting from the ones.',
  'hint.borrow':
    'Look at the borrow box. If the top digit is too small, borrow 10 from the column on the left.',
  'hint.columnwise': 'Add each column from the right, then match them one by one.',
  'hint.guided': "Let's learn it step by step together — it's easier!",

  // Practice mode
  'practice.bubble':
    'What would you like to practice today? Pick a question type, or make your own!',
  'practice.configTitle': 'Practice Settings',
  'practice.operationLabel': 'Question type',
  'practice.op.addition': 'Addition only',
  'practice.op.subtraction': 'Subtraction only',
  'practice.op.mixed': 'Mixed',
  'practice.digitsLabel': 'Number of digits',
  'practice.digitOption': (p: { n: number }) => `${p.n} digits`,
  'practice.countLabel': 'Number of questions',
  'practice.countOption': (p: { n: number }) => `${p.n} questions`,
  'practice.carryLabel': 'Difficulty',
  'practice.carry.none': 'No carrying / borrowing',
  'practice.carry.required': 'With carrying / borrowing',
  'practice.carry.any': 'Mixed',
  'practice.start': 'Start Practice',
  'practice.customTitle': 'Make Your Own ✏️',
  'practice.customDesc': 'Type two numbers (up to 4 digits), then solve them in columns here!',
  'practice.topNumber': 'Top number',
  'practice.bottomNumber': 'Bottom number',
  'practice.topAria': 'Top number for your own question',
  'practice.bottomAria': 'Bottom number for your own question',
  'practice.addBtn': '+ Add',
  'practice.subBtn': '− Subtract',
  'practice.groupAria': 'Choose operation',
  'practice.doIt': 'Solve This One',
  'practice.progressAria': 'Practice progress',
  'practice.hintFooter': 'Tap an answer box to pick a column. Fill from the right (ones) first!',
  'practice.offerGuided': 'Want to learn this one step by step with Asya?',
  'practice.guidedYes': "Yes, let's learn!",
  'practice.guidedNo': "I'll keep trying myself",
  'practice.praise1': 'Correct! Great!',
  'practice.praise2': 'Very good!',
  'practice.praise3': 'You did it!',
  'practice.praise4': 'Amazing!',
  'feedback.wrongPractice': 'Not quite. Check the hint below.',
  'feedback.nextProblem': 'Nice! On to the next question!',

  // Keypad & guide
  'keypad.groupAria': 'Number keyboard',
  'keypad.digit': (p: { digit: number }) => `Digit ${p.digit}`,
  'keypad.backspace': 'Delete one digit',
  'keypad.checkDefault': 'Check',
  'guide.sectionAria': 'Step guide',
  'guide.next': 'Next →',
  'guide.back': '← Back',
  'guide.repeat': '↻ Repeat Explanation',
  'guide.countingBox': 'Counting box:',
  'guide.canBorrow': 'Yes',
  'guide.cannotBorrow': 'No',
  'guide.interimAria': (p: { value: string | null }) =>
    p.value === null
      ? 'Temporary counting box, empty'
      : `Temporary counting box, contains ${p.value}`,

  // Install button
  'install.button': '📲 Install App',
  'install.iosPre': '📲 Install on iPhone: tap the',
  'install.iosShare': 'Share',
  'install.iosMid': 'button in Safari, then choose',
  'install.iosAdd': 'Add to Home Screen',
  'install.dismissAria': 'Dismiss install hint',
}

export default en
