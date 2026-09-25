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
  'home.levelsPerGrade': (p: { k1: number; k1Total: number; k2: number; k2Total: number }) =>
    `G1 ${p.k1}/${p.k1Total} · G2 ${p.k2}/${p.k2Total}`,
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
    'Pick any level! You are free to try any level. You can replay old levels anytime.',
  'levels.grade1': 'Grade 1 — Basics',
  'levels.grade2': 'Grade 2 — Columns',
  'levelCard.numbered': (p: { number: number; name: string }) => `Level ${p.number}: ${p.name}`,
  'levelCard.challenge': (p: { name: string }) => `Challenge: ${p.name}`,
  'levelCard.start': 'Start',
  'levelCard.repeat': 'Replay',
  'levelCard.examplePrefix': 'Example:',
  'levelCard.questionSuffix': (p: { n: number }) => `${p.n} questions`,
  'levelCard.notFinished': 'Not finished yet',
  'levelCard.neverTried': '✨ Never tried',
  'levelCard.perfect': '🏆 Perfect!',

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
    "This level isn't finished yet, so it won't be saved. Keep going to collect the stars!",
  'learn.exitConfirm': 'Yes, leave',
  'learn.exitCancel': 'Keep Learning',

  // Step instructions (translated at render time)
  'steps.introAdd': (p: { first: number; second: number }) =>
    `Let's add ${p.first} + ${p.second}! We start from the ones column. Press Next to begin.`,
  'steps.introSub': (p: { first: number; second: number }) =>
    `Let's subtract ${p.second} from ${p.first}! We start from the ones column. Press Next to begin.`,
  'steps.interimFirst': (p: { a: number; b: number }) =>
    `Start with the ones. What is ${p.a} + ${p.b}? Type it in the Counting Box — the answer fills in by itself.`,
  'steps.interimNext': (p: { sumText: string }) =>
    `Now compute ${p.sumText}. Type it in the Counting Box — the answer fills in by itself.`,
  'steps.carryDown': (p: { digit: number; place: string }) =>
    `The carried ${p.digit} comes down into the ${p.place} answer box.`,
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
  'concept.countPrompt': (p: { icon: string }) => `How many ${p.icon} do you see below?`,
  'concept.comparePrompt': (p: { left: number; right: number }) =>
    `Which is bigger, ${p.left} or ${p.right}? Or are they equal?`,
  'concept.placePrompt': (p: { number: number; place: string }) =>
    `In the number ${p.number}, what digit is in the ${p.place} place?`,
  'concept.choiceGreater': 'Left is bigger',
  'concept.choiceLess': 'Right is bigger',
  'concept.choiceEqual': 'Equal',
  'concept.iconApple': 'apples',
  'concept.iconStar': 'stars',
  'concept.iconDot': 'dots',
  'concept.countingAria': 'Counting picture',
  'concept.countingAriaWithCount': (p: { count: number }) => `Counting picture: ${p.count} items`,
  'concept.correctFeedback': 'Correct! Great!',
  'concept.wrongFeedback': 'Not quite. Try again!',
  'concept.revealedFeedback': (p: { answer: string }) => `The correct answer is ${p.answer}.`,
  // Story (word problems) — 47 keys
  'story.stem-f0-add': (p: { name: string; item: string; a: number; b: number }) =>
    `${p.name} has ${p.a} ${p.item}s. Friends gave ${p.name} ${p.b} more ${p.item}s. How many ${p.item}s does ${p.name} have now?`,
  'story.stem-f0-sub': (p: { name: string; item: string; a: number; b: number }) =>
    `${p.name} has ${p.a} ${p.item}s. ${p.b} ${p.item}s were given away. How many ${p.item}s does ${p.name} have now?`,
  'story.stem-f1-diff': (p: { nameA: string; nameB: string; item: string; x: number; y: number }) =>
    `${p.nameA} has ${p.x} ${p.item}s, which is ${p.y} more than ${p.nameB}.`,
  'story.stem-f2-transfer-color': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    p: number
    q: number
    r: number
    s: number
  }) =>
    `${p.nameA} has ${p.x} ${p.item}s. ${p.p} are red and ${p.q} are blue. ${p.nameB} has ${p.s} yellow ${p.item}s. How many ${p.item}s changed hands?`,
  'story.stem-f2-transfer-size': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    p: number
    q: number
    r: number
    s: number
  }) =>
    `${p.nameA} has ${p.x} ${p.item}s. ${p.p} are big and ${p.q} are small. ${p.nameB} has ${p.s} medium ${p.item}s. How many ${p.item}s changed hands?`,
  'story.stem-f3-chain': (p: {
    nameA: string
    nameB: string
    nameC: string
    item: string
    m: number
    n: number
  }) =>
    `${p.nameC} has ${p.n} ${p.item}s. ${p.nameB} has ${p.m} more ${p.item}s than ${p.nameC}. ${p.nameA} has as many ${p.item}s as ${p.nameB}.`,
  'story.stem-f4-join3': (p: {
    nameA: string
    nameB: string
    nameC: string
    item: string
    x: number
    y: number
    z: number
  }) =>
    `${p.nameA} has ${p.x} ${p.item}s, ${p.nameB} has ${p.y} ${p.item}s, and ${p.nameC} has ${p.z} ${p.item}s.`,
  'story.stem-f5-tiered': (p: {
    nameA: string
    nameB: string
    item: string
    x: number
    y: number
    z: number
  }) =>
    `${p.nameA} has ${p.x} ${p.item}s. ${p.nameB} took ${p.y} ${p.item}s. Then ${p.nameA} got ${p.z} more ${p.item}s.`,
  'story.part-f1-b': (p: { nameB: string; item: string }) =>
    `How many ${p.item}s does ${p.nameB} have?`,
  'story.part-f1-total': (p: { nameA: string; nameB: string; item: string }) =>
    `How many ${p.item}s do ${p.nameA} and ${p.nameB} have together?`,
  'story.part-f2-p-r': (p: { nameA: string; item: string }) =>
    `How many ${p.item}s does ${p.nameA} have after moving?`,
  'story.part-f2-x-r': (p: { nameA: string; item: string }) =>
    `How many ${p.item}s does ${p.nameA} have left?`,
  'story.part-f2-s+r': (p: { nameB: string; item: string }) =>
    `How many ${p.item}s does ${p.nameB} have after receiving?`,
  'story.part-f3-b': (p: { nameB: string; item: string }) =>
    `How many ${p.item}s does ${p.nameB} have?`,
  'story.part-f3-a': (p: { nameA: string; item: string }) =>
    `How many ${p.item}s does ${p.nameA} have?`,
  'story.part-f3-total': (p: { nameA: string; nameB: string; nameC: string; item: string }) =>
    `What is the total ${p.item}s among all three?`,
  'story.part-f4-total3': (p: { nameA: string; nameB: string; nameC: string; item: string }) =>
    `How many ${p.item}s do they have in total?`,
  'story.part-f4-totalAC': (p: { nameA: string; nameC: string; item: string }) =>
    `How many ${p.item}s do ${p.nameA} and ${p.nameC} have together?`,
  'story.part-f5-rest': (p: { nameA: string; item: string }) =>
    `How many ${p.item}s does ${p.nameA} have left?`,
  'story.part-f5-final': (p: { nameA: string; item: string }) =>
    `How many ${p.item}s does ${p.nameA} have now?`,
  'story.item-marbles': 'marbles',
  'story.item-apples': 'apples',
  'story.item-books': 'books',
  'story.item-fish': 'fish',
  'story.item-cakes': 'cakes',
  'story.item-pencils': 'pencils',
  'story.item-candies': 'candies',
  'story.item-balls': 'balls',
  'story.item-flowers': 'flowers',
  'story.item-birds': 'birds',
  'story.partOf': (p: { current: number; total: number }) => `Part ${p.current} of ${p.total}`,
  'story.tryColumn': '📐 Learn in Columns',
  'practice.sessionTitle': 'Practice Session',
  'practice.customSessionTitle': 'Your Own Question',
  'practice.modeLabel': 'Presentation type',
  'practice.modeColumn': 'Columns',
  'practice.modeStory': 'Story problems',
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

  // Legal documents & footer
  'legal.privacyTitle': 'Privacy Policy',
  'legal.termsTitle': 'Terms of Service',
  'legal.openFromSettings': 'Open full document',
  'settings.legalSection': '⚖️ Legal',
  'home.footerRights': (p: { year: number }) => `© ${p.year} Asharu Math`,
  'home.version': (p: { version: string }) => `v${p.version}`,
  'settings.version': (p: { version: string }) => `Version v${p.version}`,

  // Ads
  'ads.label': 'Advertisement',

  // Magic Apple Garden
  'garden.title': 'Magic Apple Garden 🍎',
  'garden.subtitle': 'Learn tens & ones in the apple garden!',
  'garden.startUnit': 'We start from the ones column.',
  'garden.combineHint': 'Combine the ones apples. Count them all!',
  'garden.tenToBasket': 'Ten ones apples can be exchanged for one tens basket.',
  'garden.openBasket': 'One tens basket can be opened into ten ones apples.',
  'garden.countTens': 'Now count the tens column.',
  'garden.notEnough': 'Not enough apples. Let us exchange one tens basket.',
  'garden.successCarry': 'Great! You exchanged ten ones for one ten.',
  'garden.successBorrow': 'Nice! You exchanged one ten for ten ones.',
  'garden.correctGeneral': 'Great, your answer is correct!',
  'garden.tryAgain': 'Not quite — count the ones apples again.',
  'garden.hintOnes': 'Check the apples in the ones column again.',
  'garden.hintTens': 'Check the baskets in the tens column again.',
  'garden.narrationFallback': 'Instruction is shown on screen.',
  'garden.basketLabel': 'Tens basket',
  'garden.appleLabel': 'Ones apple',
  'garden.tensArea': 'Tens Area',
  'garden.onesArea': 'Ones Area',
  'garden.unitsColor': 'Ones: amber',
  'garden.tensColor': 'Tens: emerald',
  'garden.exchangeAction': 'Exchange 10 apples for 1 basket',
  'garden.openAction': 'Open 1 basket into 10 apples',
  'garden.enterOnes': 'Enter ones answer',
  'garden.enterTens': 'Enter tens answer',
  'garden.enterHundreds': 'Enter hundreds answer',
  'garden.hintHundreds': 'Check the crates in the hundreds column again.',
  'garden.hundredsArea': 'Hundreds Area',
  'garden.hundredsColor': 'Hundreds: violet purple',
  'garden.crateLabel': 'Hundreds crate of 100 apples',
  'garden.exchangeHundredAction': 'Exchange 10 baskets for 1 crate',
  'garden.openHundredAction': 'Open 1 crate into 10 baskets',
  'garden.tenTensToHundred': 'Ten tens baskets can be exchanged for one hundreds crate.',
  'garden.countHundreds': 'Now count the hundreds column.',
  'garden.successCarryHundred': 'Great! Ten baskets became one hundreds crate.',
  'garden.soundOn': 'Sound on',
  'garden.soundOff': 'Sound off',
  'garden.repeatHint': 'Repeat Hint',
  'garden.check': 'Check',
  'garden.reset': 'Retry',
  'garden.next': 'Next Question',
  'garden.progress': (p: { current: number; total: number }) =>
    `Question ${p.current} of ${p.total}`,
  'garden.resultTitle': 'Garden Complete! 🎉',
  'garden.tryGarden': '🍎 Try Apple Garden',
  'garden.level1Name': 'Garden: Add Without Carrying',
  'garden.level2Name': 'Garden: Add With Carrying',
  'garden.level3Name': 'Garden: Subtract Without Trading',
  'garden.level4Name': 'Garden: Subtract With Trading',
  'garden.level1Goal': 'Add 2-digit numbers without carrying via the garden',
  'garden.level2Goal': 'Add 2-digit numbers with carrying via the garden',
  'garden.level3Goal': 'Subtract 2-digit numbers without trading via the garden',
  'garden.level4Goal': 'Subtract 2-digit numbers with trading via the garden',

  // Cheerful Fish Aquarium
  'aquarium.title': 'Cheerful Fish Aquarium 🐠',
  'aquarium.subtitle': 'Learn tens & ones with cheerful fish!',
  'aquarium.startUnit': 'We start from the ones column.',
  'aquarium.combineHint': 'Combine the ones fish. Count them all!',
  'aquarium.tenToGroup': 'Ten ones fish can form one tens group.',
  'aquarium.splitGroup': 'One tens group can split into ten ones fish.',
  'aquarium.countTens': 'Now count the tens column.',
  'aquarium.notEnough': 'Not enough fish. Let us exchange one tens group.',
  'aquarium.successCarry': 'Great! You turned ten ones into one ten.',
  'aquarium.successBorrow': 'Nice! You exchanged one ten for ten ones.',
  'aquarium.correctGeneral': 'Great, your answer is correct!',
  'aquarium.tryAgain': 'Not quite — count the ones fish again.',
  'aquarium.hintOnes': 'Check the fish in the ones column again.',
  'aquarium.hintTens': 'Check the groups in the tens column again.',
  'aquarium.fishLabel': 'Ones fish',
  'aquarium.groupLabel': 'Tens group',
  'aquarium.tensArea': 'Tens Area',
  'aquarium.onesArea': 'Ones Area',
  'aquarium.unitsColor': 'Ones: amber',
  'aquarium.tensColor': 'Tens: sky blue',
  'aquarium.formGroupAction': 'Form 10 fish into 1 group',
  'aquarium.splitGroupAction': 'Split 1 group into 10 fish',
  'aquarium.enterOnes': 'Enter ones answer',
  'aquarium.enterTens': 'Enter tens answer',
  'aquarium.enterHundreds': 'Enter hundreds answer',
  'aquarium.hintHundreds': 'Check the tanks in the hundreds column again.',
  'aquarium.hundredsArea': 'Hundreds Area',
  'aquarium.hundredsColor': 'Hundreds: violet purple',
  'aquarium.tankLabel': 'Hundreds tank',
  'aquarium.formHundredAction': 'Form 10 groups into 1 tank',
  'aquarium.splitHundredAction': 'Split 1 tank into 10 groups',
  'aquarium.tenGroupsToHundred': 'Ten tens groups can be exchanged for one hundreds tank.',
  'aquarium.countHundreds': 'Now count the hundreds column.',
  'aquarium.successCarryHundred': 'Great! Ten groups became one hundreds tank.',
  'aquarium.soundOn': 'Sound on',
  'aquarium.soundOff': 'Sound off',
  'aquarium.repeatHint': 'Repeat Hint',
  'aquarium.check': 'Check',
  'aquarium.reset': 'Retry',
  'aquarium.next': 'Next Question',
  'aquarium.progress': (p: { current: number; total: number }) =>
    `Question ${p.current} of ${p.total}`,
  'aquarium.resultTitle': 'Aquarium Complete! 🎉',
  'aquarium.tryAquarium': '🐠 Try Fish Aquarium',
  'aquarium.level1Name': 'Aquarium: Add Without Carrying',
  'aquarium.level2Name': 'Aquarium: Add With Carrying',
  'aquarium.level3Name': 'Aquarium: Subtract Without Trading',
  'aquarium.level4Name': 'Aquarium: Subtract With Trading',
  'aquarium.level1Goal': 'Add 2-digit numbers without carrying via the aquarium',
  'aquarium.level2Goal': 'Add 2-digit numbers with carrying via the aquarium',
  'aquarium.level3Goal': 'Subtract 2-digit numbers without trading via the aquarium',
  'aquarium.level4Goal': 'Subtract 2-digit numbers with trading via the aquarium',

  // Install button
  'install.button': '📲 Install App',
  'install.iosPre': '📲 Install on iPhone: tap the',
  'install.iosShare': 'Share',
  'install.iosMid': 'button in Safari, then choose',
  'install.iosAdd': 'Add to Home Screen',
  'install.dismissAria': 'Dismiss install hint',

  // Number Train
  'train.chooseBranchAria': (p: { answer: string }) => `Choose the track with answer ${p.answer}`,
  'train.correct': 'Great! Your answer is correct.',
  'train.fallbackMsg': 'This device does not support 3D. You can still play in 2D mode.',
  'train.grade1': 'Grade 1',
  'train.grade2': 'Grade 2',
  'train.grade3': 'Grade 3',
  'train.hintTitle': 'Hint',
  'train.musicMute': 'Turn music off',
  'train.musicUnmute': 'Turn music on',
  'train.mute': 'Turn sound off',
  'train.paused': 'Paused',
  'train.questionOf': (p: { n: number; total: number }) => `Question ${p.n} of ${p.total}`,
  'train.repeatNarration': 'Repeat narration',
  'train.quit': 'Exit',
  'train.restart': 'Restart',
  'train.resume': 'Resume',
  'train.resumeSession': (p: { gradeLabel: string; n: number; total: number }) =>
    `▶ Continue journey (${p.gradeLabel}, question ${p.n}/${p.total})`,
  'train.retry': 'Almost there, try again.',
  'train.selectGrade': 'Choose grade',
  'train.sessionDone': 'Journey complete!',
  'train.start': '🚂 All aboard!',
  'train.starsAria': (p: { stars: number }) => `Stars: ${p.stars}`,
  'train.startNewHint': 'Starting a new grade will clear the saved session.',
  'train.station': 'Station 🎉',
  'train.stationShort': 'STATION',
  'train.subtitle': 'Help the train reach the station!',
  'train.title': 'Number Train Adventure',
  'train.unmute': 'Turn sound on',
  'train.voiceMute': 'Turn narration off',
  'train.voiceUnmute': 'Turn narration on',
}

export default en
