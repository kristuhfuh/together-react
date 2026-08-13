export interface Verse {
  ref: string
  text: string
}

export interface ScriptureTopic {
  id: string
  title: string
  subtitle: string
  discussion: string
  verses: Verse[]
}

export const SCRIPTURE_TOPICS: ScriptureTopic[] = [
  {
    id: 'patience',
    title: 'Patience',
    subtitle: 'Waiting well, together',
    discussion: 'Where in our relationship do we most need patience right now — and what would it look like to practice it?',
    verses: [
      { ref: 'Romans 8:25', text: 'But if we hope for what we do not yet have, we wait for it patiently.' },
      { ref: 'James 1:3–4', text: 'Because you know that the testing of your faith produces perseverance. Let perseverance finish its work so that you may be mature and complete, not lacking anything.' },
      { ref: 'Psalm 37:7', text: 'Be still before the Lord and wait patiently for him; do not fret when people succeed in their ways.' },
      { ref: 'Isaiah 40:31', text: 'But those who hope in the Lord will renew their strength. They will soar on wings like eagles; they will run and not grow weary, they will walk and not be faint.' },
      { ref: 'Lamentations 3:25', text: 'The Lord is good to those whose hope is in him, to the one who seeks him.' },
    ],
  },
  {
    id: 'love',
    title: 'Love',
    subtitle: 'The kind that endures',
    discussion: 'Which quality from 1 Corinthians 13 do you feel most in our relationship right now, and which do you want us to grow in?',
    verses: [
      { ref: '1 Corinthians 13:4–7', text: 'Love is patient, love is kind. It does not envy, it does not boast, it is not proud. It does not dishonour others, it is not self-seeking, it is not easily angered, it keeps no record of wrongs.' },
      { ref: 'John 15:12', text: 'My command is this: Love each other as I have loved you.' },
      { ref: '1 John 4:7', text: 'Dear friends, let us love one another, for love comes from God. Everyone who loves has been born of God and knows God.' },
      { ref: 'Romans 13:10', text: 'Love does no harm to a neighbour. Therefore love is the fulfilment of the law.' },
      { ref: 'Colossians 3:14', text: 'And over all these virtues put on love, which binds them all together in perfect unity.' },
    ],
  },
  {
    id: 'hope',
    title: 'Hope',
    subtitle: 'Holding on to the unseen',
    discussion: "What future are you hoping for most right now — and how does our faith shape that hope?",
    verses: [
      { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
      { ref: 'Jeremiah 29:11', text: 'For I know the plans I have for you, declares the Lord, plans to prosper you and not to harm you, plans to give you hope and a future.' },
      { ref: 'Hebrews 11:1', text: 'Now faith is confidence in what we hope for and assurance about what we do not see.' },
      { ref: 'Psalm 62:5', text: 'Yes, my soul, find rest in God; my hope comes from him.' },
      { ref: 'Lamentations 3:22–23', text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness." },
    ],
  },
  {
    id: 'peace',
    title: 'Peace',
    subtitle: 'Stillness in the storm',
    discussion: 'What is stealing your peace most right now, and how can we pray for each other about it?',
    verses: [
      { ref: 'Philippians 4:6–7', text: 'Do not be anxious about anything, but in every situation, by prayer and petition, with thanksgiving, present your requests to God. And the peace of God, which transcends all understanding, will guard your hearts and your minds in Christ Jesus.' },
      { ref: 'John 14:27', text: 'Peace I leave with you; my peace I give you. I do not give to you as the world gives. Do not let your hearts be troubled and do not be afraid.' },
      { ref: 'Isaiah 26:3', text: 'You will keep in perfect peace those whose minds are steadfast, because they trust in you.' },
      { ref: 'Romans 5:1', text: 'Therefore, since we have been justified through faith, we have peace with God through our Lord Jesus Christ.' },
      { ref: 'Colossians 3:15', text: 'Let the peace of Christ rule in your hearts, since as members of one body you were called to peace. And be thankful.' },
    ],
  },
  {
    id: 'prayer',
    title: 'Prayer',
    subtitle: 'Talking to God together',
    discussion: "What's one thing you've been meaning to bring to God that you haven't yet — can we pray about it together right now?",
    verses: [
      { ref: 'Matthew 18:20', text: 'For where two or three gather in my name, there am I with them.' },
      { ref: 'James 5:16', text: 'Therefore confess your sins to each other and pray for each other so that you may be healed. The prayer of a righteous person is powerful and effective.' },
      { ref: '1 Thessalonians 5:16–18', text: "Rejoice always, pray continually, give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
      { ref: 'Matthew 6:6', text: 'But when you pray, go into your room, close the door and pray to your Father, who is unseen. Then your Father, who sees what is done in secret, will reward you.' },
      { ref: 'Psalm 34:17–18', text: 'The righteous cry out, and the Lord hears them; he delivers them from all their troubles. The Lord is close to the broken-hearted and saves those who are crushed in spirit.' },
    ],
  },
  {
    id: 'strength',
    title: 'Strength',
    subtitle: 'Power in weakness',
    discussion: "Where do you feel weakest or most stretched right now — and what would it mean for God's strength to show up there?",
    verses: [
      { ref: 'Philippians 4:13', text: 'I can do all this through him who gives me strength.' },
      { ref: '2 Corinthians 12:9', text: "But he said to me, \"My grace is sufficient for you, for my power is made perfect in weakness.\" Therefore I will boast all the more gladly about my weaknesses, so that Christ's power may rest on me." },
      { ref: 'Psalm 46:1', text: 'God is our refuge and strength, an ever-present help in trouble.' },
      { ref: 'Isaiah 41:10', text: 'So do not fear, for I am with you; do not be dismayed, for I am your God. I will strengthen you and help you; I will uphold you with my righteous right hand.' },
      { ref: 'Ephesians 6:10', text: 'Finally, be strong in the Lord and in his mighty power.' },
    ],
  },
  {
    id: 'forgiveness',
    title: 'Forgiveness',
    subtitle: 'Releasing what we hold',
    discussion: 'Is there anything between us — or in your own heart — that needs to be released today?',
    verses: [
      { ref: 'Ephesians 4:32', text: 'Be kind and compassionate to one another, forgiving each other, just as in Christ God forgave you.' },
      { ref: 'Colossians 3:13', text: 'Bear with each other and forgive one another if any of you has a grievance against someone. Forgive as the Lord forgave you.' },
      { ref: 'Matthew 6:14', text: 'For if you forgive other people when they sin against you, your heavenly Father will also forgive you.' },
      { ref: '1 John 1:9', text: 'If we confess our sins, he is faithful and just and will forgive us our sins and purify us from all unrighteousness.' },
      { ref: 'Psalm 103:12', text: 'As far as the east is from the west, so far has he removed our transgressions from us.' },
    ],
  },
  {
    id: 'faithfulness',
    title: 'Faithfulness',
    subtitle: 'Steady through every season',
    discussion: 'How have you seen faithfulness — in God, in each other — over the past few months?',
    verses: [
      { ref: 'Lamentations 3:22–23', text: "Because of the Lord's great love we are not consumed, for his compassions never fail. They are new every morning; great is your faithfulness." },
      { ref: 'Deuteronomy 7:9', text: 'Know therefore that the Lord your God is God; he is the faithful God, keeping his covenant of love to a thousand generations of those who love him and keep his commandments.' },
      { ref: '2 Timothy 2:13', text: 'If we are faithless, he remains faithful, for he cannot disown himself.' },
      { ref: 'Proverbs 3:3–4', text: 'Let love and faithfulness never leave you; bind them around your neck, write them on the tablet of your heart. Then you will win favour and a good name in the sight of God and man.' },
      { ref: 'Psalm 36:5', text: "Your love, Lord, reaches to the heavens, your faithfulness to the skies." },
    ],
  },
  {
    id: 'gratitude',
    title: 'Gratitude',
    subtitle: 'Thankfulness in every season',
    discussion: 'What is one thing — big or small — that you can genuinely thank God for today, even if this season is hard?',
    verses: [
      { ref: '1 Thessalonians 5:18', text: "Give thanks in all circumstances; for this is God's will for you in Christ Jesus." },
      { ref: 'Psalm 100:4', text: 'Enter his gates with thanksgiving and his courts with praise; give thanks to him and praise his name.' },
      { ref: 'Colossians 3:17', text: 'And whatever you do, whether in word or deed, do it all in the name of the Lord Jesus, giving thanks to God the Father through him.' },
      { ref: 'Psalm 107:1', text: 'Give thanks to the Lord, for he is good; his love endures forever.' },
      { ref: 'Ephesians 5:20', text: 'Always giving thanks to God the Father for everything, in the name of our Lord Jesus Christ.' },
    ],
  },
  {
    id: 'wisdom',
    title: 'Wisdom',
    subtitle: 'Growing in godly understanding',
    discussion: 'Where in your life right now do you most need wisdom — and have you asked God for it?',
    verses: [
      { ref: 'James 1:5', text: 'If any of you lacks wisdom, you should ask God, who gives generously to all without finding fault, and it will be given to you.' },
      { ref: 'Proverbs 3:5–6', text: 'Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.' },
      { ref: 'Proverbs 9:10', text: 'The fear of the Lord is the beginning of wisdom, and knowledge of the Holy One is understanding.' },
      { ref: 'Colossians 1:9', text: 'We continually ask God to fill you with the knowledge of his will through all the wisdom and understanding that the Spirit gives.' },
      { ref: 'Ecclesiastes 7:12', text: 'Wisdom is a shelter as money is a shelter, but the advantage of knowledge is this: wisdom preserves those who have it.' },
    ],
  },
  {
    id: 'humility',
    title: 'Humility',
    subtitle: 'The posture of the servant',
    discussion: 'Is there an area where pride has been quietly keeping you from growth — or from God?',
    verses: [
      { ref: 'Philippians 2:3–4', text: 'Do nothing out of selfish ambition or vain conceit. Rather, in humility value others above yourselves, not looking to your own interests but each of you to the interests of the others.' },
      { ref: 'James 4:10', text: 'Humble yourselves before the Lord, and he will lift you up.' },
      { ref: 'Micah 6:8', text: 'He has shown you, O mortal, what is good. And what does the Lord require of you? To act justly and to love mercy and to walk humbly with your God.' },
      { ref: 'Proverbs 22:4', text: 'Humility is the fear of the Lord; its wages are riches and honour and life.' },
      { ref: '1 Peter 5:6', text: "Humble yourselves, therefore, under God's mighty hand, that he may lift you up in due time." },
    ],
  },
  {
    id: 'worship',
    title: 'Worship',
    subtitle: 'Bringing your whole self to God',
    discussion: 'What does your personal worship look like beyond Sundays — and what could it look like?',
    verses: [
      { ref: 'John 4:24', text: 'God is spirit, and his worshippers must worship in the Spirit and in truth.' },
      { ref: 'Romans 12:1', text: "Therefore, I urge you, brothers and sisters, in view of God's mercy, to offer your bodies as a living sacrifice, holy and pleasing to God — this is your true and proper worship." },
      { ref: 'Psalm 95:6', text: 'Come, let us bow down in worship, let us kneel before the Lord our Maker.' },
      { ref: 'Psalm 150:6', text: 'Let everything that has breath praise the Lord. Praise the Lord.' },
      { ref: 'Hebrews 12:28', text: 'Therefore, since we are receiving a kingdom that cannot be shaken, let us be thankful, and so worship God acceptably with reverence and awe.' },
    ],
  },
  {
    id: 'identity',
    title: 'Identity',
    subtitle: 'Who God says you are',
    discussion: 'What lie about yourself — your worth, your past, or your future — do you need to let God replace with truth?',
    verses: [
      { ref: '2 Corinthians 5:17', text: 'Therefore, if anyone is in Christ, the new creation has come: the old has gone, the new is here!' },
      { ref: 'Psalm 139:14', text: 'I praise you because I am fearfully and wonderfully made; your works are wonderful, I know that full well.' },
      { ref: 'Galatians 2:20', text: 'I have been crucified with Christ and I no longer live, but Christ lives in me.' },
      { ref: 'Ephesians 2:10', text: "For we are God's handiwork, created in Christ Jesus to do good works, which God prepared in advance for us to do." },
      { ref: '1 John 3:1', text: 'See what great love the Father has lavished on us, that we should be called children of God! And that is what we are!' },
    ],
  },
  {
    id: 'purpose',
    title: 'Purpose',
    subtitle: 'Called and equipped for more',
    discussion: 'Do you feel like you are living in your calling right now — and if not, what might be in the way?',
    verses: [
      { ref: 'Romans 8:28', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.' },
      { ref: 'Jeremiah 1:5', text: 'Before I formed you in the womb I knew you, before you were born I set you apart.' },
      { ref: '1 Corinthians 12:4–6', text: "There are different kinds of gifts, but the same Spirit distributes them. There are different kinds of service, but the same Lord. There are different kinds of working, but in all of them and in everyone it is the same God at work." },
      { ref: 'Matthew 5:16', text: 'In the same way, let your light shine before others, that they may see your good deeds and glorify your Father in heaven.' },
      { ref: 'Philippians 1:6', text: 'Being confident of this, that he who began a good work in you will carry it on to completion until the day of Christ Jesus.' },
    ],
  },
  {
    id: 'generosity',
    title: 'Generosity',
    subtitle: 'Open hands, open heart',
    discussion: 'What would it look like to be more generous — not just with money, but with your time, energy, and attention?',
    verses: [
      { ref: '2 Corinthians 9:7', text: 'Each of you should give what you have decided in your heart to give, not reluctantly or under compulsion, for God loves a cheerful giver.' },
      { ref: 'Luke 6:38', text: 'Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap.' },
      { ref: 'Proverbs 11:25', text: 'A generous person will prosper; whoever refreshes others will be refreshed.' },
      { ref: '1 Timothy 6:18', text: 'Command them to do good, to be rich in good deeds, and to be generous and willing to share.' },
      { ref: 'Matthew 6:21', text: 'For where your treasure is, there your heart will be also.' },
    ],
  },
  {
    id: 'courage',
    title: 'Courage',
    subtitle: 'Walking through fear with faith',
    discussion: 'What is God calling you toward that you have been afraid to step into — and what would it look like to trust him there?',
    verses: [
      { ref: 'Joshua 1:9', text: 'Have I not commanded you? Be strong and courageous. Do not be afraid; do not be discouraged, for the Lord your God will be with you wherever you go.' },
      { ref: 'Psalm 27:1', text: 'The Lord is my light and my salvation — whom shall I fear? The Lord is the stronghold of my life — of whom shall I be afraid?' },
      { ref: '2 Timothy 1:7', text: 'For the Spirit God gave us does not make us timid, but gives us power, love and self-discipline.' },
      { ref: 'Deuteronomy 31:6', text: 'Be strong and courageous. Do not be afraid or terrified because of them, for the Lord your God goes with you; he will never leave you nor forsake you.' },
      { ref: 'Psalm 56:3', text: 'When I am afraid, I put my trust in you.' },
    ],
  },
  {
    id: 'joy',
    title: 'Joy',
    subtitle: 'Deeper than your circumstances',
    discussion: 'What is the difference between happiness and joy to you — and where can you find joy even in this season?',
    verses: [
      { ref: 'Nehemiah 8:10', text: 'Do not grieve, for the joy of the Lord is your strength.' },
      { ref: 'Psalm 16:11', text: 'You make known to me the path of life; you will fill me with joy in your presence, with eternal pleasures at your right hand.' },
      { ref: 'John 15:11', text: 'I have told you this so that my joy may be in you and that your joy may be complete.' },
      { ref: 'James 1:2–3', text: 'Consider it pure joy, my brothers and sisters, whenever you face trials of many kinds, because you know that the testing of your faith produces perseverance.' },
      { ref: 'Romans 15:13', text: 'May the God of hope fill you with all joy and peace as you trust in him, so that you may overflow with hope by the power of the Holy Spirit.' },
    ],
  },
  {
    id: 'holy-spirit',
    title: 'Holy Spirit',
    subtitle: 'The Helper within you',
    discussion: "How aware are you of the Holy Spirit's presence in your daily life — and what would it look like to lean on him more?",
    verses: [
      { ref: 'John 14:26', text: 'But the Advocate, the Holy Spirit, whom the Father will send in my name, will teach you all things and will remind you of everything I have said to you.' },
      { ref: 'Galatians 5:22–23', text: 'But the fruit of the Spirit is love, joy, peace, forbearance, kindness, goodness, faithfulness, gentleness and self-control. Against such things there is no law.' },
      { ref: 'Romans 8:26', text: 'In the same way, the Spirit helps us in our weakness. We do not know what we ought to pray for, but the Spirit himself intercedes for us through wordless groans.' },
      { ref: 'Acts 1:8', text: 'But you will receive power when the Holy Spirit comes on you; and you will be my witnesses in Jerusalem, and in all Judea and Samaria, and to the ends of the earth.' },
      { ref: 'Ephesians 5:18', text: 'And do not get drunk on wine, which leads to debauchery. Instead, be filled with the Spirit.' },
    ],
  },
  {
    id: 'scripture',
    title: "God's Word",
    subtitle: 'Living by every word',
    discussion: 'Is the Bible a regular part of your daily life — and what would it look like to engage with it more deeply?',
    verses: [
      { ref: 'Psalm 119:105', text: 'Your word is a lamp for my feet, a light on my path.' },
      { ref: '2 Timothy 3:16–17', text: "All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work." },
      { ref: 'Hebrews 4:12', text: 'For the word of God is alive and active. Sharper than any double-edged sword, it penetrates even to dividing soul and spirit, joints and marrow.' },
      { ref: 'Matthew 4:4', text: 'Man shall not live on bread alone, but on every word that comes from the mouth of God.' },
      { ref: 'Joshua 1:8', text: 'Keep this Book of the Law always on your lips; meditate on it day and night, so that you may be careful to do everything written in it. Then you will be prosperous and successful.' },
    ],
  },
  {
    id: 'rest',
    title: 'Rest',
    subtitle: 'The gift God intended',
    discussion: 'Are you genuinely resting — in God and in life — or running on empty? What does true rest look like for you?',
    verses: [
      { ref: 'Matthew 11:28–30', text: 'Come to me, all you who are weary and burdened, and I will give you rest. Take my yoke upon you and learn from me, for I am gentle and humble in heart, and you will find rest for your souls.' },
      { ref: 'Psalm 23:2–3', text: 'He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.' },
      { ref: 'Exodus 20:8', text: 'Remember the Sabbath day by keeping it holy.' },
      { ref: 'Psalm 127:2', text: 'In vain you rise early and stay up late, toiling for food to eat — for he grants sleep to those he loves.' },
      { ref: 'Hebrews 4:9–10', text: "There remains, then, a Sabbath-rest for the people of God; for anyone who enters God's rest also rests from their works, just as God did from his." },
    ],
  },
  {
    id: 'integrity',
    title: 'Integrity',
    subtitle: 'Being the same in the dark',
    discussion: 'Is the person you are in private the same as who you are in public — and what is God asking you to align?',
    verses: [
      { ref: 'Proverbs 10:9', text: 'Whoever walks in integrity walks securely, but whoever takes crooked paths will be found out.' },
      { ref: 'Psalm 15:1–2', text: 'Lord, who may dwell in your sacred tent? Who may live on your holy mountain? The one whose walk is blameless, who does what is righteous, who speaks the truth from their heart.' },
      { ref: 'Colossians 3:23', text: 'Whatever you do, work at it with all your heart, as working for the Lord, not for human masters.' },
      { ref: 'Luke 16:10', text: 'Whoever can be trusted with very little can also be trusted with much, and whoever is dishonest with very little will also be dishonest with much.' },
      { ref: 'Proverbs 11:3', text: 'The integrity of the upright guides them, but the unfaithful are destroyed by their duplicity.' },
    ],
  },
]
