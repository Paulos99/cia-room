(function () {
  'use strict';

  const SERVICE_ORDER = ['remote', 'measurement', 'design', 'special', 'industrial'];
  const START_NODE = 'q1_signal';

  const SERVICE_META = {
    remote: {
      num: '01',
      title: 'Дистанционная инженерная оценка',
      resultPromise: 'инженерную гипотезу, разбор по вашим данным и рекомендацию следующего шага',
      helpClose: 'Поможем собрать недостающие сведения и понять, нужен ли выезд или проект — без лишних затрат на старте.',
      cta: 'Отправить данные объекта',
    },
    measurement: {
      num: '02',
      title: 'Акустический замер и обследование помещения',
      resultPromise: 'выезд эксперта, карту источников и путей передачи, рекомендации по зонам',
      helpClose: 'Поможем разобраться на объекте и подскажем следующий шаг по результатам обследования.',
      cta: 'Обсудить обследование',
      alternativeNote: 'без подробного плана мероприятий и подбора материалов',
    },
    design: {
      num: '03',
      title: 'Инженерное акустическое проектирование',
      resultPromise: 'обследование, проект узлов и материалов, прогноз результата и контрольный замер после монтажа',
      helpClose: 'Проведём через проектный цикл — от диагностики до подтверждения результата на объекте.',
      cta: 'Обсудить проект объекта',
    },
    special: {
      num: '04',
      title: 'Разработка специальных проектов',
      resultPromise: 'ТЗ под сценарий, проект акустики помещения и контроль результата замером',
      helpClose: 'Поможем спроектировать решение под ваш объект и сценарий — и подтвердить результат замером.',
      cta: 'Обсудить спецпроект',
    },
    industrial: {
      num: '05',
      title: 'Промышленное акустическое проектирование',
      resultPromise: 'обследование источника, проект локализации шума и вибрации, контрольные замеры',
      helpClose: 'Разберёмся с промышленным источником системно — от диагностики до подтверждения снижения шума.',
      cta: 'Обсудить промышленный объект',
    },
  };

  const NODE_CHAIN = [
    'q1_signal',
    'q2_route',
    'q2_scenario',
    'q2_where',
    'q3_object',
    'q4_stage',
    'q5_source',
    'q6_access',
    'q7_data',
    'q8_goal',
    'q9_attempts',
  ];

  const NODES = {
    q1_signal: {
      id: 'q1_signal',
      label: 'Что беспокоит',
      question: 'Что беспокоит сильнее всего?',
      options: [
        { id: 'neighbors', label: 'Шум от соседей', detail: 'Разговоры, музыка, телевизор', next: 'q2_route', tags: ['external'], scores: { measurement: 3, design: 1 }, hint: 'Поможет понять, откуда приходит звук.' },
        { id: 'street', label: 'Уличный шум', detail: 'Машины, голоса, стройка', next: 'q2_route', tags: ['external'], scores: { measurement: 3, design: 1 }, hint: 'Уточним, как шум попадает в помещение.' },
        { id: 'leak', label: 'Хочу приватности (меня не слышно снаружи)', detail: 'Важно, чтобы звук оставался внутри комнаты', next: 'q2_route', tags: ['leak'], scores: { design: 3, special: 1 }, hint: 'Важно понять, куда уходит звук.' },
        { id: 'impact', label: 'Ударный шум и вибрация (топот, удары)', detail: 'Топот и удары сверху, снизу или по полу', next: 'q2_route', tags: ['impact'], scores: { measurement: 2, design: 2 }, hint: 'Такой шум часто идёт через перекрытия и стены.' },
        { id: 'equipment', label: 'Гул оборудования/вентиляции', detail: 'Вентиляция, кондиционеры, насосы, станки', next: 'q3_object', tags: ['equipment'], scores: { industrial: 5 }, hint: 'Разберёмся с источником и режимом работы.' },
        { id: 'acoustics', label: 'Эхо в помещении', detail: 'Гул и эхо внутри комнаты, плохо слышно речь', next: 'q2_scenario', tags: ['room-acoustics'], scores: { special: 4 }, hint: 'Это про звук внутри помещения, а не только про стены.' },
        { id: 'unknown', label: 'Причина неясна', detail: 'Что-то мешает, но непонятно откуда', next: 'q2_where', tags: ['unknown'], scores: { remote: 2, measurement: 2 }, hint: 'Сначала поймём, где проблема проявляется сильнее.' },
      ],
    },
    q2_route: {
      id: 'q2_route',
      label: 'Откуда шум',
      question: 'Откуда к вам приходит шум?',
      options: [
        { id: 'top', label: 'Сверху', detail: 'Соседи на этаже выше: топот, разговоры', next: 'q3_object', tags: ['route-top'], scores: { measurement: 2, design: 1 }, hint: 'Иногда звук идёт не только через потолок — учтём и это.' },
        { id: 'side', label: 'Сбоку, через стену', detail: 'Соседняя квартира, комната или офис', next: 'q3_object', tags: ['route-side'], scores: { measurement: 2, design: 2 }, hint: 'Стена — не всегда единственный путь звука.' },
        { id: 'floor', label: 'Снизу', detail: 'Соседи снизу: топот, удары по полу', next: 'q3_object', tags: ['route-floor'], scores: { measurement: 2, design: 2 }, hint: 'Важно, из чего сделаны перекрытия.' },
        { id: 'holes', label: 'Через щели и отверстия', detail: 'Вентиляция, трубы, розетки, проходки', next: 'q3_object', tags: ['route-holes'], scores: { measurement: 3 }, hint: 'Такие места часто упускают из виду.' },
        { id: 'inside-out', label: 'Звук уходит в другие комнаты', detail: 'Слышно в коридоре, у соседей или на кухне', next: 'q3_object', tags: ['route-out'], scores: { design: 3, special: 1 }, hint: 'Задача — удержать звук внутри.' },
        { id: 'unsure', label: 'Не могу определить', detail: 'Слышно, но откуда — непонятно', next: 'q3_object', tags: ['route-unsure'], scores: { measurement: 3, remote: 1 }, hint: 'Так бывает часто — разберёмся на объекте.' },
      ],
    },
    q2_scenario: {
      id: 'q2_scenario',
      label: 'Как пользуетесь',
      question: 'Для чего в основном нужно помещение?',
      options: [
        { id: 'speech', label: 'Чтобы хорошо слышать речь', detail: 'Переговоры, совещания, лекции', next: 'q3_object', tags: ['scenario-speech'], scores: { special: 3 }, hint: 'От сценария зависит, что именно улучшать.' },
        { id: 'media', label: 'Музыка и кино', detail: 'Домашний кинотеатр, прослушивание', next: 'q3_object', tags: ['scenario-media'], scores: { special: 4 }, hint: 'Важны и тишина снаружи, и звук внутри.' },
        { id: 'guests', label: 'Комфорт для гостей', detail: 'Ресторан, кафе, зал, лобби', next: 'q3_object', tags: ['scenario-guests'], scores: { special: 3 }, hint: 'Нужен комфорт для людей в помещении.' },
        { id: 'record', label: 'Запись звука', detail: 'Студия, подкаст, стрим, эфир', next: 'q3_object', tags: ['scenario-record'], scores: { special: 5 }, hint: 'Потребуется отдельный проект под задачу.' },
      ],
    },
    q2_where: {
      id: 'q2_where',
      label: 'Где слышно',
      question: 'Где проблема заметнее всего?',
      options: [
        { id: 'one-room', label: 'В одной комнате', detail: 'Только в спальне, кабинете или зале', next: 'q3_object', tags: ['where-one'], scores: { measurement: 2 }, hint: 'Поможет сузить поиск причины.' },
        { id: 'multi-room', label: 'В нескольких комнатах', detail: 'Проявляется в разных комнатах', next: 'q3_object', tags: ['where-multi'], scores: { measurement: 2, remote: 1 }, hint: 'Возможен общий путь, по которому идёт звук.' },
        { id: 'whole', label: 'Повсюду', detail: 'Слышно или мешает во всей квартире или доме', next: 'q3_object', tags: ['where-whole'], scores: { measurement: 1, design: 1 }, hint: 'Нужно смотреть на объект целиком.' },
        { id: 'time', label: 'По-разному в разное время', detail: 'Днём или ночью, не постоянно', next: 'q3_object', tags: ['where-time'], scores: { measurement: 2, remote: 1 }, hint: 'Важно понять, когда источник активен.' },
      ],
    },
    q3_object: {
      id: 'q3_object',
      label: 'Ваш объект',
      question: 'Что за помещение?',
      options: [
        { id: 'apartment', label: 'Квартира', detail: 'Жильё в многоквартирном доме', next: 'q4_stage', tags: ['obj-apartment'], scores: { measurement: 2, design: 1 }, hint: 'От этапа ремонта зависит, с чего начать.' },
        { id: 'house', label: 'Частный дом', detail: 'Дом, таунхаус, несколько этажей', next: 'q4_stage', tags: ['obj-house'], scores: { special: 2, design: 1 }, hint: 'Важно, как вы пользуетесь разными зонами.' },
        { id: 'office', label: 'Офис или кабинеты', detail: 'Рабочие места, переговорные, кабинеты', next: 'q4_stage', tags: ['obj-office'], scores: { design: 2, measurement: 1 }, hint: 'Часто важны перегородки и потолок.' },
        { id: 'studio', label: 'Студия, ресторан, зал', detail: 'Для гостей, записи, мероприятий', next: 'q4_stage', tags: ['obj-studio'], scores: { special: 5 }, hint: 'Обычно нужен отдельный проект.' },
        { id: 'industrial', label: 'Производство, насосная, бойлерная', detail: 'Техпомещение с оборудованием', next: 'q4_stage', tags: ['obj-industrial'], scores: { industrial: 6 }, hint: 'Отдельный формат для таких объектов.' },
        { id: 'other', label: 'Другое помещение', detail: 'Нестандартный или смешанный тип', next: 'q4_stage', tags: ['obj-other'], scores: { remote: 1, measurement: 1 }, hint: 'Сначала уточним исходные данные.' },
      ],
    },
    q4_stage: {
      id: 'q4_stage',
      label: 'Стадия ремонта',
      question: 'На каком этапе у вас ремонт?',
      options: [
        { id: 'idea', label: 'Только планирую', detail: 'Ремонт ещё не начинали', next: 'q5_source', tags: ['stage-idea'], scores: { remote: 2, design: 1 }, hint: 'Сейчас проще всё спланировать заранее.' },
        { id: 'before', label: 'Перед ремонтом', detail: 'Стены и перекрытия ещё можно менять', next: 'q5_source', tags: ['stage-before'], scores: { design: 3 }, hint: 'Удобное время заложить решение в проект.' },
        { id: 'during', label: 'Ремонт уже идёт', detail: 'Работы в процессе, нужно решить сейчас', next: 'q5_source', tags: ['stage-during'], scores: { measurement: 2, design: 2 }, hint: 'Важно не закрепить ошибку в конструкциях.' },
        { id: 'ready', label: 'Уже живём / работаем', detail: 'Ремонт сделан, проблема при использовании', next: 'q5_source', tags: ['stage-ready'], scores: { measurement: 3 }, hint: 'Нужно проверить причину на месте.' },
      ],
    },
    q5_source: {
      id: 'q5_source',
      label: 'Источник',
      question: 'Понятно ли, что именно шумит?',
      options: [
        { id: 'yes', label: 'Да, знаю что именно', detail: 'Источник понятен', next: 'q6_access', tags: ['source-yes'], scores: { design: 1 }, hint: 'Так проще подобрать формат работ.' },
        { id: 'partial', label: 'Есть догадка', detail: 'Примерно понимаю, но не уверен', next: 'q6_access', tags: ['source-partial'], scores: { measurement: 2 }, hint: 'На объекте можно подтвердить или опровергнуть.' },
        { id: 'no', label: 'Непонятно, откуда', detail: 'Источник пока не ясен', next: 'q6_access', tags: ['source-no'], scores: { measurement: 3, remote: 1 }, hint: 'Без проверки легко потратить деньги впустую.' },
      ],
    },
    q6_access: {
      id: 'q6_access',
      label: 'Доступ',
      question: 'Можно ли трогать стены, пол и потолок?',
      options: [
        { id: 'full', label: 'Да, можно вскрывать', detail: 'Снимать обои, плитку, открывать стены и пол', next: 'q7_data', tags: ['access-full'], scores: { design: 2 }, hint: 'Больше вариантов для решения.' },
        { id: 'finish', label: 'Только поверх (обои, плитка)', detail: 'Глубоко в стену и перекрытия нельзя', next: 'q7_data', tags: ['access-finish'], scores: { measurement: 2 }, hint: 'Учтём ограничения при рекомендациях.' },
        { id: 'unknown', label: 'Пока не знаю', detail: 'Ещё не решил, насколько можно вмешиваться', next: 'q7_data', tags: ['access-unknown'], scores: { measurement: 1, remote: 1 }, hint: 'Уточним на обследовании объекта.' },
      ],
    },
    q7_data: {
      id: 'q7_data',
      label: 'Материалы',
      question: 'Что можете прислать нам сейчас?',
      options: [
        { id: 'description', label: 'Только опишу словами', detail: 'Без фото и планов', next: 'q8_goal', tags: ['data-desc'], scores: { remote: 3 }, hint: 'Подскажем, какие данные ещё собрать.' },
        { id: 'media', label: 'Есть фото или набросок плана', detail: 'Снимки помещения или эскиз', next: 'q8_goal', tags: ['data-media'], scores: { remote: 2, measurement: 1 }, hint: 'Уже можно точнее оценить задачу.' },
        { id: 'drawings', label: 'Есть планы помещения', detail: 'Планировка, схема стен, пола или потолка', next: 'q8_goal', tags: ['data-drawings'], scores: { design: 2 }, hint: 'Это ближе к проектной работе.' },
        { id: 'complete', label: 'Фото, планы и описание — всё есть', detail: 'Полный набор для оценки или проекта', next: 'q8_goal', tags: ['data-complete'], scores: { design: 3, special: 2 }, hint: 'Достаточно для проекта или точной оценки.' },
      ],
    },
    q8_goal: {
      id: 'q8_goal',
      label: 'Цель',
      question: 'Что вы хотите получить от ЦИА?',
      options: [
        { id: 'understand', label: 'Сначала понять причину', detail: 'Разобраться, откуда шум и как он передаётся', next: 'q9_attempts', tags: ['goal-understand'], scores: { remote: 1, measurement: 3 }, hint: 'Диагностика без лишних работ.' },
        { id: 'treatment', label: 'Получить рекомендации эксперта', detail: 'Что усилить и в каких зонах — без полного проекта', next: 'q9_attempts', tags: ['goal-treatment'], scores: { measurement: 4 }, hint: 'Выезд или разбор по данным с конкретными советами.' },
        { id: 'project', label: 'Получить готовый акустический проект', detail: 'Решение с материалами для передачи строителям', next: 'q9_attempts', tags: ['goal-project'], scores: { design: 4, special: 2 }, hint: 'Узлы, материалы и прогноз результата.' },
        { id: 'measurement', label: 'Сделать замеры акустики на объекте', detail: 'Выезд специалиста, замеры и карта источников шума', next: 'q9_attempts', tags: ['goal-measurement'], scores: { measurement: 5 }, hint: 'Замеры на месте — без проектных работ на старте.' },
      ],
    },
    q9_attempts: {
      id: 'q9_attempts',
      label: 'Опыт',
      question: 'Уже пробовали что-то делать со звуком?',
      options: [
        { id: 'none', label: 'Ничего не делали', detail: 'Работ по звукоизоляции ещё не было', next: 'result', tags: ['attempt-none'], scores: {}, hint: 'Подберём оптимальный старт автоматически.' },
        { id: 'no-effect', label: 'Делали — не помогло', detail: 'Звукоизоляцию или отделку уже пробовали', next: 'result', tags: ['attempt-fail'], scores: { measurement: 2 }, hint: 'Нужно проверить причину и путь звука.' },
        { id: 'worse', label: 'Стало хуже', detail: 'После работ стало только хуже', next: 'result', tags: ['attempt-worse'], scores: { measurement: 3, design: 1 }, hint: 'Важно найти ошибку в диагностике или монтаже.' },
      ],
    },
    q10_start: {
      id: 'q10_start',
      label: 'Старт',
      question: 'Как удобнее начать?',
      options: [
        { id: 'remote', label: 'Сначала дистанционно', detail: 'По описанию и материалам, без выезда', next: 'result', tags: ['start-remote'], scores: { remote: 4 }, hint: 'Быстрый первый шаг без выезда.' },
        { id: 'visit', label: 'Нужен выезд', detail: 'Специалист приедет на объект', next: 'result', tags: ['start-visit'], scores: { measurement: 4 }, hint: 'Замеры и карта передачи на месте.' },
        { id: 'project', label: 'Сразу к проекту', detail: 'Данных достаточно для проектных работ', next: 'result', tags: ['start-project'], scores: { design: 3, special: 2, industrial: 2 }, hint: 'Если материалов хватает для ТЗ.' },
      ],
    },
  };

  const OUTCOMES = {
    'industrial-equipment-project': {
      service: 'industrial',
      title: 'Промышленный проект под ваш источник',
      explain: 'Шум от оборудования на техобъекте и запрос на проектное решение — задача для промышленного формата ЦИА: источник, режимы работы и вибрация рассматриваются вместе.',
      includes: 'Обследование источника, проект локализации шума и вибрации, контрольные замеры.',
      excludes: 'Бытовые форматы 01–03 без промышленного источника здесь не подойдут.',
      alternative: null,
      priority: 100,
      match: (c) => c.has('equipment') && c.has('goal-project'),
    },
    'industrial-equipment-visit': {
      service: 'industrial',
      title: 'Выезд к промышленному источнику',
      explain: 'Оборудование — главный источник задачи. Сначала нужно увидеть объект и режимы работы, затем выбрать проектный трек.',
      includes: 'Обследование источника, карту шума и вибрации, рекомендации по следующему шагу.',
      excludes: 'Без проекта и прогноза на этом этапе — только диагностика источника.',
      alternative: null,
      priority: 99,
      match: (c) => c.has('equipment') && c.has('start-visit'),
    },
    'industrial-object-core': {
      service: 'industrial',
      title: 'Промышленный формат для техобъекта',
      explain: 'Промышленный или технический объект требует отдельной методики: работаем с источником, а не только с помещением, где шум слышен.',
      includes: 'Обследование, проект решения, подтверждение результата замерами.',
      excludes: 'Квартирные и офисные форматы без промышленного источника не применяем.',
      alternative: null,
      priority: 98,
      match: (c) => c.ans('q3_object') === 'industrial',
    },
    'special-studio-project': {
      service: 'special',
      title: 'Спецпроект для вашего сценария',
      explain: 'Студия или HoReCa с задачей на проект — это не типовая изоляция. Нужен сценарий помещения и системное акустическое решение.',
      includes: 'ТЗ, сценарий акустики, проект решений, контрольный замер.',
      excludes: 'Общие рекомендации без привязки к сценарию будут недостаточны.',
      alternative: 'measurement',
      priority: 95,
      match: (c) => c.has('obj-studio') && c.has('goal-project'),
    },
    'special-acoustics-studio': {
      service: 'special',
      title: 'Спецпроект внутренней акустики',
      explain: 'Гул, эхо или речь в специальном помещении — задача внутренней акустики и сценария использования, а не только шумоизоляции.',
      includes: 'Совместное ТЗ, проект акустики помещения, контроль результата.',
      excludes: 'Формат 02 даст рекомендации, но не заменит спецпроект.',
      alternative: null,
      priority: 94,
      match: (c) => c.has('room-acoustics') && c.has('obj-studio'),
    },
    'special-acoustics-house': {
      service: 'special',
      title: 'Акустика зон в частном доме',
      explain: 'В доме важны сценарии разных зон — тихие и активные. Решение проектируется под использование, а не под одну стену.',
      includes: 'Сценарий зон, проект акустики и изоляции, контрольный замер.',
      excludes: 'Типовой проект квартиры без учёта зон не подойдёт.',
      alternative: 'design',
      priority: 88,
      match: (c) => c.has('room-acoustics') && c.ans('q3_object') === 'house',
    },
    'special-record-scenario': {
      service: 'special',
      title: 'Проект под запись звука',
      explain: 'Запись звука требует точного сценария: изоляция, внутренняя акустика и инженерные ограничения помещения учитываются вместе.',
      includes: 'ТЗ под запись, проект решений, контрольный замер.',
      excludes: 'Без сценария записи типовой проект не даст нужный результат.',
      alternative: null,
      priority: 93,
      match: (c) => c.has('scenario-record'),
    },
    'design-before-project': {
      service: 'design',
      title: 'Проект до монтажа конструкций',
      explain: 'Объект до ремонта и запрос на проект — удобный момент заложить решение в конструкцию без лишних переделок.',
      includes: 'Обследование, узлы, материалы, прогноз, контрольный замер.',
      excludes: 'Только рекомендации без проекта в этот формат не входят.',
      alternative: null,
      priority: 90,
      match: (c) => (c.has('stage-before') || c.has('stage-idea')) && c.has('goal-project'),
    },
    'design-during-project': {
      service: 'design',
      title: 'Проект в ходе ремонта',
      explain: 'Ремонт уже идёт — важно быстро зафиксировать инженерное решение, пока не закрыли конструкции отделкой.',
      includes: 'Обследование, проект узлов и материалов, прогноз результата.',
      excludes: 'Без проекта останутся только точечные рекомендации.',
      alternative: 'measurement',
      priority: 89,
      match: (c) => c.has('stage-during') && c.has('goal-project'),
    },
    'design-leak-office': {
      service: 'design',
      title: 'Проект на удержание звука в офисе',
      explain: 'Звук уходит из переговорной или офиса — нужен проект с учётом перегородок, потолка и обходных путей, а не разовая рекомендация.',
      includes: 'Обследование, проект конструкций, материалоёмкость, прогноз.',
      excludes: 'Дистанционная оценка не заменит проект для офиса.',
      alternative: null,
      priority: 87,
      match: (c) => c.has('leak') && c.has('obj-office') && c.has('goal-project'),
    },
    'measurement-explicit-goal': {
      service: 'measurement',
      title: 'Замеры акустики на объекте',
      explain: 'Вы хотите замеры на месте — выезд специалиста, карта источников и путей передачи звука, рекомендации по следующему шагу.',
      includes: 'Выезд, замеры, карту источников, рекомендации по зонам.',
      excludes: 'Проект узлов и материалов на этом этапе не входит.',
      alternative: 'design',
      priority: 87,
      match: (c) => c.has('goal-measurement'),
    },
    'design-drawings-ready': {
      service: 'design',
      title: 'Проект по имеющимся чертежам',
      explain: 'Чертежи и запрос на проект позволяют перейти к узлам и материалам быстрее, чем с нуля по описанию.',
      includes: 'Проект решений, материалоёмкость, прогноз, контрольный замер.',
      excludes: 'Без обследования на объекте прогноз может быть ограничен.',
      alternative: null,
      priority: 85,
      match: (c) => c.has('data-drawings') && c.has('goal-project') && c.has('start-project'),
    },
    'measurement-worse-after': {
      service: 'measurement',
      title: 'Диагностика после неудачного монтажа',
      explain: 'Если после работ стало хуже — сначала нужно понять, где ошибка: в диагностике, проекте или исполнении. Обследование даст опору для решения.',
      includes: 'Выезд, карту путей, замеры, рекомендации по исправлению.',
      excludes: 'Новый проект без диагностики может повторить ошибку.',
      alternative: 'design',
      priority: 92,
      match: (c) => c.has('attempt-worse'),
    },
    'measurement-no-effect': {
      service: 'measurement',
      title: 'Проверить, почему не сработало',
      explain: 'Предыдущие меры не дали эффекта — значит, неверно определили источник или путь. Нужно обследование, а не новый материал вслепую.',
      includes: 'Выезд, источники и пути передачи, рекомендации по зонам.',
      excludes: 'Проект без диагностики в этой ситуации преждевременен.',
      alternative: null,
      priority: 91,
      match: (c) => c.has('attempt-fail'),
    },
    'measurement-external-ready': {
      service: 'measurement',
      title: 'Обследование готового объекта с внешним шумом',
      explain: 'Готовое помещение, внешний шум и неясный источник — типичный случай для выезда: без замеров легко усилить не ту конструкцию.',
      includes: 'Выезд, карту источников, замеры, рекомендации по обработке.',
      excludes: 'Проект и прогноз результата на этом этапе не входят.',
      alternative: null,
      priority: 84,
      match: (c) => c.has('external') && c.has('stage-ready') && (c.has('source-no') || c.has('route-unsure')),
    },
    'measurement-external-treatment': {
      service: 'measurement',
      title: 'Рекомендации по зонам на объекте',
      explain: 'Вам нужны рекомендации по обработке без полного проекта — для этого сначала фиксируем источник и пути на выезде.',
      includes: 'Выезд, карту передачи, замеры, рекомендации по зонам.',
      excludes: 'Узлы, материалоёмкость и прогноз — в формате 03.',
      alternative: null,
      priority: 83,
      match: (c) => c.has('goal-treatment') && c.has('start-visit'),
    },
    'measurement-holes-route': {
      service: 'measurement',
      title: 'Проверить слабые точки и проходки',
      explain: 'Шум через отверстия и инженерные каналы — частая ловушка: без обследования можно усилить стену, а путь останется прежним.',
      includes: 'Выезд, поиск слабых точек, замеры, рекомендации.',
      excludes: 'Проектные узлы — следующий шаг после обследования.',
      alternative: null,
      priority: 82,
      match: (c) => c.has('route-holes'),
    },
    'measurement-impact-ready': {
      service: 'measurement',
      title: 'Разобраться с ударным шумом',
      explain: 'Удары и вибрация на готовом объекте часто идут через конструкции — нужны замеры и карта передачи, а не только догадки.',
      includes: 'Выезд, замеры ударного шума, рекомендации по конструкциям.',
      excludes: 'Полный проект — если понадобится, после обследования.',
      alternative: 'design',
      priority: 81,
      match: (c) => c.has('impact') && c.has('stage-ready'),
    },
    'measurement-unknown-local': {
      service: 'measurement',
      title: 'Локализовать неясную проблему',
      explain: 'Причина неясна, проблема локальна — выезд поможет отделить источник от обходных путей и предложить следующий шаг.',
      includes: 'Выезд, диагностику, замеры, рекомендации.',
      excludes: 'Дистанционно надёжно локализовать не всегда возможно.',
      alternative: 'remote',
      priority: 80,
      match: (c) => c.has('unknown') && (c.has('where-one') || c.has('source-no')) && c.has('start-visit'),
    },
    'remote-early-idea': {
      service: 'remote',
      title: 'Дистанционная оценка на ранней стадии',
      explain: 'На стадии идеи и с минимумом данных логично начать дистанционно: соберём гипотезу и список того, что подготовить до выезда или проекта.',
      includes: 'Инженерную гипотезу, рекомендации по данным, следующий шаг.',
      excludes: 'Выезд, замеры на объекте и проект в этот формат не входят.',
      alternative: null,
      priority: 83,
      match: (c) => (c.has('stage-idea') || c.has('stage-before')) && c.has('data-desc') && c.has('start-remote'),
    },
    'remote-unknown-minimal': {
      service: 'remote',
      title: 'Первичный разбор без выезда',
      explain: 'Источник неясен, данных пока мало — дистанционная оценка поможет понять, что собрать и нужен ли выезд.',
      includes: 'Гипотезу, перечень данных, рекомендацию следующего шага.',
      excludes: 'Замеры на объекте и проект не входят.',
      alternative: 'measurement',
      priority: 84,
      match: (c) => c.has('unknown') && c.has('data-desc') && c.has('start-remote'),
    },
    'remote-media-start': {
      service: 'remote',
      title: 'Разбор по фото и плану',
      explain: 'Есть фото или план — можно начать дистанционно и понять, достаточно ли данных для выезда или сразу для проекта.',
      includes: 'Инженерный разбор материалов, гипотезу, план действий.',
      excludes: 'Подтверждение на объекте и проект — при необходимости следующим шагом.',
      alternative: 'measurement',
      priority: 77,
      match: (c) => c.has('data-media') && c.has('start-remote') && c.has('goal-understand'),
    },
    'design-general-project': {
      service: 'design',
      title: 'Инженерный проект решения',
      explain: 'По ответам задача уже требует проектного решения: конструкции, материалы и прогноз результата, а не только рекомендаций.',
      includes: 'Обследование, узлы, материалы, прогноз, контрольный замер.',
      excludes: 'Студии, HoReCa и промышленные источники — в форматах 04–05.',
      alternative: null,
      priority: 50,
      match: (c) => c.has('goal-project'),
    },
    'measurement-general-visit': {
      service: 'measurement',
      title: 'Начните с обследования на объекте',
      explain: 'Выезд даст карту источников и путей передачи — это опора для рекомендаций или проекта без ошибки в направлении работ.',
      includes: 'Выезд, замеры, карту передачи, рекомендации по обработке.',
      excludes: 'Проект, материалоёмкость и прогноз — в формате 03.',
      alternative: null,
      priority: 40,
      match: (c) => c.has('start-visit'),
    },
    'remote-general': {
      service: 'remote',
      title: 'Дистанционная инженерная оценка',
      explain: 'По вашим ответам разумно начать с дистанционного разбора: поймёте причину и следующий шаг без лишнего выезда.',
      includes: 'Гипотезу, рекомендации, список данных для следующего этапа.',
      excludes: 'Выезд, замеры и проект не входят.',
      alternative: 'measurement',
      priority: 10,
      match: () => true,
    },
  };

  const GAUGE_RADIUS = 52;
  const GAUGE_CIRCUMFERENCE = 2 * Math.PI * GAUGE_RADIUS;

  const NODE_WEIGHT = {
    q1_signal: 15,
    q2_route: 10,
    q2_scenario: 10,
    q2_where: 10,
    q3_object: 12,
    q4_stage: 11,
    q5_source: 9,
    q6_access: 8,
    q7_data: 11,
    q8_goal: 13,
    q9_attempts: 11,
    q10_start: 5,
  };

  const WEAK_READINESS = new Set([
    'unknown', 'unsure', 'description', 'access-unknown', 'other', 'time', 'no', 'partial', 'none', 'idea',
  ]);

  const STRONG_READINESS = new Set([
    'complete', 'drawings', 'project', 'industrial', 'studio', 'yes', 'before', 'record',
    'visit', 'treatment', 'measurement', 'full', 'media', 'worse', 'fail',
  ]);

  const app = document.getElementById('diagnose-app');
  if (!app) return;

  const els = {
    counter: document.getElementById('diagnose-counter'),
    progressBar: document.getElementById('diagnose-progress-bar'),
    progressTrack: app.querySelector('.diagnose__progress-track'),
    topline: app.querySelector('.diagnose__topline'),
    layout: app.querySelector('.diagnose__layout'),
    flow: app.querySelector('.diagnose__flow'),
    stepLabel: document.getElementById('diagnose-step-label'),
    question: document.getElementById('diagnose-question'),
    lead: document.getElementById('diagnose-lead'),
    options: document.getElementById('diagnose-options'),
    hint: document.getElementById('diagnose-hint'),
    back: document.getElementById('diagnose-back'),
    next: document.getElementById('diagnose-next'),
    result: document.getElementById('diagnose-result'),
    readiness: document.getElementById('diagnose-readiness'),
    gaugeFill: document.getElementById('diagnose-gauge-fill'),
    gaugeValue: document.getElementById('diagnose-gauge-value'),
    gaugeNote: document.getElementById('diagnose-gauge-note'),
    gaugeLog: document.getElementById('diagnose-gauge-log'),
  };

  if (els.gaugeFill) {
    els.gaugeFill.style.strokeDasharray = String(GAUGE_CIRCUMFERENCE);
    els.gaugeFill.style.strokeDashoffset = String(GAUGE_CIRCUMFERENCE);
  }

  const state = {
    currentNode: START_NODE,
    path: [],
    tags: [],
    scores: {},
    selectedId: null,
    finished: false,
  };

  function emptyScores() {
    return SERVICE_ORDER.reduce((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
  }

  function buildContext() {
    const answers = {};
    state.path.forEach((entry) => {
      answers[entry.nodeId] = entry.optionId;
    });
    if (state.selectedId && state.currentNode) {
      answers[state.currentNode] = state.selectedId;
    }

    const tags = new Set(state.tags);
    const node = NODES[state.currentNode];
    if (node && state.selectedId) {
      const opt = node.options.find((o) => o.id === state.selectedId);
      (opt?.tags || []).forEach((t) => tags.add(t));
    }

    return {
      answers,
      tags,
      scores: { ...state.scores },
      has: (tag) => tags.has(tag),
      ans: (nodeId) => answers[nodeId],
      label: (nodeId) => {
        const entry = state.path.find((p) => p.nodeId === nodeId);
        if (entry) return entry.label;
        if (nodeId === state.currentNode && state.selectedId) {
          const n = NODES[nodeId];
          return n?.options.find((o) => o.id === state.selectedId)?.label || '';
        }
        return '';
      },
    };
  }

  function buildContextFromEntries(entries) {
    const answers = {};
    const tags = [];
    entries.forEach((entry) => {
      answers[entry.nodeId] = entry.optionId;
      const opt = getOption(entry.nodeId, entry.optionId);
      (opt?.tags || []).forEach((tag) => {
        if (!tags.includes(tag)) tags.push(tag);
      });
    });
    return {
      answers,
      tags: new Set(tags),
      has: (tag) => tags.includes(tag),
      ans: (nodeId) => answers[nodeId],
    };
  }

  function getEntriesForReadiness(includePending) {
    const entries = state.path.map((entry) => ({ ...entry }));
    if (includePending && state.selectedId && state.currentNode && !state.finished) {
      const pending = entries.some((e) => e.nodeId === state.currentNode);
      if (!pending) {
        const opt = getOption(state.currentNode, state.selectedId);
        entries.push({
          nodeId: state.currentNode,
          optionId: state.selectedId,
          label: opt?.label || '',
        });
      }
    }
    return entries;
  }

  function simulateFullPathNodeIds(entries) {
    if (!entries.length) return [START_NODE];

    const simEntries = entries.map((entry) => ({ ...entry }));
    let last = simEntries[simEntries.length - 1];
    let opt = getOption(last.nodeId, last.optionId);
    if (!opt) return simEntries.map((e) => e.nodeId);

    let ctx = buildContextFromEntries(simEntries);
    let next = resolveNext(last.nodeId, opt, ctx);

    while (next && next !== 'result' && simEntries.length < 12) {
      const node = NODES[next];
      if (!node) break;
      const defaultOpt = node.options[0];
      simEntries.push({ nodeId: next, optionId: defaultOpt.id });
      ctx = buildContextFromEntries(simEntries);
      next = resolveNext(next, defaultOpt, ctx);
    }

    return simEntries.map((e) => e.nodeId);
  }

  function getOptionReadinessPoints(nodeId, optionId) {
    const weight = NODE_WEIGHT[nodeId] || 8;
    if (WEAK_READINESS.has(optionId)) return Math.round(weight * 0.52);
    if (STRONG_READINESS.has(optionId)) return weight;
    return Math.round(weight * 0.84);
  }

  function getReadinessNote(percent) {
    if (percent >= 100) return 'Рекомендация сформирована по вашим ответам.';
    if (percent >= 78) return 'Почти готовы дать конкретную рекомендацию формата.';
    if (percent >= 52) return 'Формат работы определяется всё точнее.';
    if (percent >= 28) return 'Картина задачи проясняется — продолжайте отвечать.';
    return 'Пока мало данных для точной рекомендации.';
  }

  function getReadiness(includePending = true) {
    if (state.finished) return { percent: 100, current: 0, max: 0 };

    const entries = getEntriesForReadiness(includePending);
    const current = entries.reduce(
      (sum, entry) => sum + getOptionReadinessPoints(entry.nodeId, entry.optionId),
      0,
    );
    const fullPathNodes = simulateFullPathNodeIds(entries);
    const max = fullPathNodes.reduce((sum, nodeId) => sum + (NODE_WEIGHT[nodeId] || 8), 0);
    const percent = max ? Math.min(99, Math.max(0, Math.round((current / max) * 100))) : 0;

    return { percent, current, max, entries };
  }

  function renderReadiness() {
    if (!els.gaugeFill || !els.gaugeValue) return;

    const { percent, entries } = getReadiness(true);
    const offset = GAUGE_CIRCUMFERENCE * (1 - percent / 100);

    els.gaugeFill.style.strokeDashoffset = String(offset);
    els.gaugeValue.textContent = `${percent}%`;
    if (els.gaugeNote) els.gaugeNote.textContent = getReadinessNote(percent);

    if (els.readiness) {
      els.readiness.classList.toggle('is-ready', percent >= 78);
      els.readiness.hidden = state.finished;
    }

    if (els.gaugeLog) {
      const { max } = getReadiness(true);
      const committed = state.path.map((entry) => {
        const node = NODES[entry.nodeId];
        const pts = getOptionReadinessPoints(entry.nodeId, entry.optionId);
        const share = max ? Math.round((pts / max) * 100) : 0;
        return `<li class="diagnose__gauge-log-item is-done"><span>${node?.label || entry.nodeId}</span><strong>+${share}%</strong></li>`;
      });

      if (state.selectedId && state.currentNode && !state.finished) {
        const node = NODES[state.currentNode];
        const pts = getOptionReadinessPoints(state.currentNode, state.selectedId);
        const share = max ? Math.round((pts / max) * 100) : 0;
        committed.push(`<li class="diagnose__gauge-log-item is-pending"><span>${node?.label || state.currentNode}</span><strong>+${share}%</strong></li>`);
      }

      els.gaugeLog.innerHTML = committed.join('');
    }
  }

  function isIndustrialPath(ctx) {
    return ctx.has('equipment') || ctx.ans('q3_object') === 'industrial';
  }

  function shouldSkipNode(nodeId, ctx) {
    if (nodeId === 'q5_source') {
      if (isIndustrialPath(ctx)) return true;
      if (ctx.has('room-acoustics')) return true;
      if (ctx.has('equipment')) return true;
      if (ctx.ans('q1_signal') === 'unknown') return true;
    }
    if (nodeId === 'q6_access') {
      if (ctx.ans('q3_object') === 'studio' || isIndustrialPath(ctx)) return true;
      const stage = ctx.ans('q4_stage');
      if (stage === 'idea' || stage === 'before') return true;
      if (ctx.ans('q3_object') === 'apartment' && stage === 'ready') return true;
    }
    if (nodeId === 'q9_attempts' && isIndustrialPath(ctx)) return true;
    return false;
  }

  function filterOptions(nodeId, options, ctx) {
    const stage = ctx.ans('q4_stage');
    const signal = ctx.ans('q1_signal');

    return options.filter((opt) => {
      if (nodeId === 'q2_route' && ctx.has('impact') && opt.id === 'holes') return false;

      if (nodeId === 'q5_source') {
        if (opt.id === 'yes' && (signal === 'unknown' || ctx.has('route-unsure'))) return false;
      }

      if (nodeId === 'q8_goal') {
        if (
          opt.id === 'project'
          && ctx.has('data-desc')
          && !ctx.has('data-drawings')
          && !ctx.has('data-complete')
        ) return false;
      }

      if (nodeId === 'q9_attempts') {
        if ((opt.id === 'worse' || opt.id === 'no-effect') && stage !== 'ready' && stage !== 'during') {
          return false;
        }
      }

      return true;
    });
  }

  function getNodeCopy(nodeId, ctx) {
    const node = NODES[nodeId];
    if (!node) return { label: '', question: '', lead: '' };

    let { label, question } = node;
    let lead = '';

    if (nodeId === 'q2_route') {
      if (ctx.has('leak')) {
        question = 'Куда уходит звук из комнаты?';
        lead = 'Куда слышно снаружи — в коридор, соседям, на кухню';
      } else if (ctx.ans('q1_signal') === 'street') {
        question = 'Откуда к вам попадает уличный шум?';
        lead = 'Окна, стены, вентиляция — выберите, что ближе';
      } else if (ctx.has('external')) {
        question = 'Откуда к вам приходит шум?';
        lead = 'Сверху, сбоку, снизу или через щели';
      } else if (ctx.has('impact')) {
        question = 'Откуда доходят топот и удары?';
        lead = 'Чаще всего — сверху, сбоку или снизу';
      }
    }

    if (nodeId === 'q2_scenario') {
      lead = 'От этого зависит, что улучшать — тишину снаружи или звук внутри';
    }

    if (nodeId === 'q2_where') {
      lead = 'Поможет понять, локальная ли это проблема';
    }

    if (nodeId === 'q3_object') {
      question = 'Что за помещение?';
    }

    if (nodeId === 'q4_stage') {
      question = 'На каком этапе у вас ремонт?';
      lead = 'От этого зависит, можно ли менять конструкции';
    }

    if (nodeId === 'q5_source') {
      question = 'Понятно ли, что именно шумит?';
      lead = 'Не обязательно точно — достаточно догадки';
    }

    if (nodeId === 'q6_access') {
      question = 'Можно ли трогать стены, пол и потолок?';
      lead = 'Снимать обои и плитку, вскрывать перегородки';
    }

    if (nodeId === 'q7_data') {
      question = 'Что можете прислать нам сейчас?';
      lead = 'Фото, планы, описание — всё, что уже есть';
    }

    if (nodeId === 'q8_goal') {
      question = 'Что вы хотите получить от ЦИА?';
      lead = 'Диагностика, рекомендации, проект или замеры на объекте';
    }

    if (nodeId === 'q9_attempts') {
      question = 'Уже пробовали что-то делать со звуком?';
    }

    return { label, question, lead };
  }

  function inferStartPreference(ctx) {
    const goal = ctx.ans('q8_goal');
    const stage = ctx.ans('q4_stage');
    const signal = ctx.ans('q1_signal');
    const source = ctx.ans('q5_source');
    const startOpts = NODES.q10_start.options;

    if (goal === 'project' && (ctx.has('data-drawings') || ctx.has('data-complete'))) {
      return startOpts.find((o) => o.id === 'project');
    }

    if (goal === 'measurement') {
      return startOpts.find((o) => o.id === 'visit');
    }

    if (goal === 'understand' || source === 'no' || signal === 'unknown') {
      if (stage === 'ready' || stage === 'during') {
        return startOpts.find((o) => o.id === 'visit');
      }
      return startOpts.find((o) => o.id === 'remote');
    }

    if (goal === 'treatment' || stage === 'ready') {
      return startOpts.find((o) => o.id === 'visit');
    }

    if (ctx.has('data-desc') && stage === 'idea') {
      return startOpts.find((o) => o.id === 'remote');
    }

    if (stage === 'idea' || stage === 'before') {
      return startOpts.find((o) => o.id === 'remote');
    }

    return startOpts.find((o) => o.id === 'visit');
  }

  function applyInferredStart(ctx) {
    if (state.path.some((p) => p.nodeId === 'q10_start')) return;
    const option = inferStartPreference(ctx);
    if (!option) return;
    applyOptionScores(option);
    state.path.push({
      nodeId: 'q10_start',
      optionId: option.id,
      label: option.label,
      short: option.label.length > 28 ? `${option.label.slice(0, 26)}…` : option.label,
    });
  }

  function isLastStep(nodeId, ctx) {
    const node = NODES[nodeId];
    if (!node) return false;
    return node.options.every((opt) => resolveNext(nodeId, opt, ctx) === 'result');
  }

  function skipForward(nodeId, ctx) {
    let id = nodeId;
    while (id && id !== 'result' && shouldSkipNode(id, ctx)) {
      const idx = NODE_CHAIN.indexOf(id);
      id = NODE_CHAIN[idx + 1] || 'result';
    }
    return id;
  }

  function resolveNext(nodeId, option, ctx) {
    let next = option.next;
    if (nodeId === 'q4_stage' && isIndustrialPath(ctx)) {
      next = 'q7_data';
    }
    return skipForward(next, ctx);
  }

  function applyOptionScores(option) {
    Object.entries(option.scores || {}).forEach(([service, score]) => {
      state.scores[service] = (state.scores[service] || 0) + score;
    });
    (option.tags || []).forEach((tag) => {
      if (!state.tags.includes(tag)) state.tags.push(tag);
    });
  }

  function getOption(nodeId, optionId) {
    return NODES[nodeId]?.options.find((o) => o.id === optionId);
  }

  function getSelectedOption() {
    if (!state.selectedId) return null;
    return getOption(state.currentNode, state.selectedId);
  }

  function simulateRemaining(ctx, fromNodeId, pathLen) {
    let nodeId = fromNodeId;
    let steps = 0;
    const simTags = [...ctx.tags];
    const simAnswers = { ...ctx.answers };
    const maxSteps = 12;

    while (nodeId && nodeId !== 'result' && steps < maxSteps) {
      const node = NODES[nodeId];
      if (!node) break;
      const option = node.options[0];
      (option.tags || []).forEach((t) => simTags.push(t));
      simAnswers[nodeId] = option.id;
      const simCtx = {
        answers: simAnswers,
        tags: new Set(simTags),
        has: (t) => simTags.includes(t),
        ans: (id) => simAnswers[id],
      };
      nodeId = resolveNext(nodeId, option, simCtx);
      steps += 1;
    }
    return pathLen + steps;
  }

  function getProgress() {
    const ctx = buildContext();
    const answered = state.path.length;
    const total = state.finished
      ? answered
      : simulateRemaining(ctx, state.currentNode, answered + (state.selectedId ? 1 : 0));
    const current = state.finished ? answered : answered + 1;
    return { current: Math.min(current, total), total: Math.max(total, current) };
  }

  function scoreFromPath() {
    const scores = emptyScores();
    state.path.forEach((entry) => {
      const opt = getOption(entry.nodeId, entry.optionId);
      Object.entries(opt?.scores || {}).forEach(([service, score]) => {
        scores[service] += score;
      });
    });
    return scores;
  }

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pathAnswer(path, nodeId) {
    const entry = path.find((p) => p.nodeId === nodeId);
    return entry ? { id: entry.optionId, label: entry.label } : null;
  }

  const SIMPLE_CONCERN = {
    neighbors: 'мешает шум от соседей',
    street: 'мешает уличный шум',
    leak: 'важна приватность — звук уходит из помещения наружу',
    impact: 'беспокоят топот, удары и вибрация',
    acoustics: 'в помещении эхо и гул',
    equipment: 'гудит вентиляция или оборудование',
    unknown: 'есть проблема со звуком, но причина пока не ясна',
  };

  const OBJECT_OPENING = {
    apartment: 'В квартире',
    house: 'В частном доме',
    office: 'В офисе',
    studio: 'В студии, ресторане или зале',
    industrial: 'На производственном объекте',
    other: 'В помещении',
  };

  const SCENARIO_NOTE = {
    speech: 'Важно, чтобы речь была хорошо слышна.',
    media: 'Важен комфорт при музыке и кино.',
    guests: 'Нужен комфорт для гостей.',
    record: 'Нужна тишина для записи звука.',
  };

  const START_NOTE = {
    remote: 'Начнём дистанционно — по вашим данным.',
    visit: 'Начнём с выезда на объект.',
    project: 'Можно сразу переходить к проекту.',
  };

  const SERVICE_PROMISE = {
    remote: 'Инженер разберёт задачу по вашим данным и скажет, что делать дальше.',
    measurement: 'Инженер приедет, снимет замеры и подскажет, что улучшить.',
    design: 'Сделаем проект с конкретными решениями и прогнозом результата.',
    special: 'Спроектируем акустику под ваш сценарий и проверим результат замером.',
    industrial: 'Разберёмся с промышленным источником и подтвердим снижение шума замерами.',
  };

  function objectOpening(ctx, objectId) {
    if (objectId === 'studio' && ctx.has('scenario-guests')) return 'В вашем заведении';
    if (objectId === 'studio') return 'В студии';
    return OBJECT_OPENING[objectId] || 'У вас';
  }

  function buildOpeningSentence(path, ctx) {
    const signal = pathAnswer(path, 'q1_signal');
    const object = pathAnswer(path, 'q3_object');
    const concern = signal?.id ? SIMPLE_CONCERN[signal.id] : null;

    if (object?.id && concern) {
      return `${objectOpening(ctx, object.id)} ${concern}.`;
    }
    if (concern) return `У вас ${concern}.`;
    return 'По вашим ответам задача понятна.';
  }

  function buildScenarioSentence(path) {
    const scenario = pathAnswer(path, 'q2_scenario');
    return scenario?.id ? SCENARIO_NOTE[scenario.id] || null : null;
  }

  function buildSituationSentence(path, ctx) {
    if (!shouldSkipNode('q9_attempts', ctx) && ctx.has('attempt-worse')) {
      return 'Вы уже пробовали что-то делать — стало только хуже.';
    }
    if (!shouldSkipNode('q9_attempts', ctx) && ctx.has('attempt-fail')) {
      return 'Вы уже пробовали решать проблему — эффекта не было.';
    }

    const source = pathAnswer(path, 'q5_source');
    if (!shouldSkipNode('q5_source', ctx) && source?.id === 'no') {
      return 'Пока непонятно, откуда именно идёт шум.';
    }
    if (!shouldSkipNode('q5_source', ctx) && source?.id === 'partial') {
      return 'Источник шума понятен лишь частично.';
    }

    const stage = pathAnswer(path, 'q4_stage');
    if (stage?.id === 'before' || stage?.id === 'idea') {
      return 'Ремонт ещё впереди — хорошее время всё спланировать.';
    }

    return null;
  }

  function buildServiceSentence(meta, service) {
    const promise = SERVICE_PROMISE[service] || 'Подскажем следующий шаг по вашей задаче.';
    return `Рекомендуем услугу ${meta.num} «${meta.title}». ${promise}`;
  }

  function buildClosingSentence(service, ctx, path) {
    const object = pathAnswer(path, 'q3_object');
    const start = pathAnswer(path, 'q10_start');
    const startNote = start?.id ? START_NOTE[start.id] : null;

    if (startNote) return startNote;

    if (service === 'special') {
      if (object?.id === 'house') return 'Поможем настроить акустику зон дома под ваш образ жизни.';
      if (object?.id === 'apartment') return 'Найдём решение под вашу квартиру, а не «усилить стену» вслепую.';
      if (object?.id === 'studio' || ctx.has('scenario-record')) return 'Соберём ТЗ под ваш сценарий и доведём до результата.';
      return 'Разберёмся вместе — без шаблонных советов.';
    }

    if (service === 'measurement' && (ctx.has('attempt-fail') || ctx.has('attempt-worse'))) {
      return 'Разберёмся, что пошло не так, и подскажем, что делать дальше.';
    }

    if (service === 'remote' && object?.id === 'house') {
      return 'Наметим план по дому и честно скажем, где без выезда не обойтись.';
    }

    if (service === 'remote') return 'Это быстрый первый шаг — без лишних затрат на старте.';
    if (service === 'measurement') return 'На объекте станет ясно, что именно мешает и как это исправить.';
    if (service === 'design') return 'Проведём от обследования до проверки результата после монтажа.';
    if (service === 'industrial') return 'Разберёмся с источником шума и подтвердим результат замерами.';

    return 'Напишите нам — разберём задачу вместе.';
  }

  function buildUnifiedNarrative(outcome, meta, path, ctx) {
    const sentences = [buildOpeningSentence(path, ctx)];

    const scenario = buildScenarioSentence(path);
    if (scenario) sentences.push(scenario);

    const situation = buildSituationSentence(path, ctx);
    if (situation) sentences.push(situation);

    sentences.push(buildServiceSentence(meta, outcome.service));
    sentences.push(buildClosingSentence(outcome.service, ctx, path));

    return sentences.slice(0, 5).join(' ');
  }

  function buildResultNarrative(outcome) {
    const path = state.path;
    const ctx = buildContextFromEntries(path);
    const meta = SERVICE_META[outcome.service];
    return { text: buildUnifiedNarrative(outcome, meta, path, ctx) };
  }

  function resolveOutcome() {
    const ctx = buildContext();
    const rules = Object.values(OUTCOMES).sort((a, b) => b.priority - a.priority);
    for (const outcome of rules) {
      if (outcome.match(ctx)) return outcome;
    }
    const scores = scoreFromPath();
    const top = SERVICE_ORDER.map((s) => ({ service: s, score: scores[s] })).sort((a, b) => b.score - a.score)[0];
    const meta = SERVICE_META[top.service];
    return {
      service: top.service,
      title: `Рекомендуем: ${meta.title}`,
      explain: 'По совокупности ответов этот формат ЦИА даёт оптимальный следующий шаг.',
      includes: 'Состав работ уточнит инженер после заявки.',
      excludes: 'Точный объём зависит от объекта.',
      alternative: null,
    };
  }

  function getPathSummaryData() {
    const ctx = buildContextFromEntries(state.path);
    const answers = state.path
      .filter((entry) => entry.nodeId !== 'q10_start')
      .map((entry) => {
        const node = NODES[entry.nodeId];
        const copy = getNodeCopy(entry.nodeId, ctx);
        return {
          step: copy.label || node?.label || entry.nodeId,
          answer: entry.label,
        };
      });
    const goalEntry = state.path.find((p) => p.nodeId === 'q8_goal');
    const startEntry = state.path.find((p) => p.nodeId === 'q10_start');
    const startLabels = {
      remote: 'Сначала дистанционно',
      visit: 'Нужен выезд эксперта',
      project: 'Сразу к проекту',
    };
    const startLabel = startEntry
      ? (startLabels[startEntry.optionId] || startEntry.label)
      : null;
    return {
      answers,
      goalLabel: goalEntry?.label || null,
      startLabel,
    };
  }

  function renderPathSummaryHtml() {
    const { answers, goalLabel, startLabel } = getPathSummaryData();
    if (!answers.length) return '';

    const items = answers.map(
      (entry) => `<li><span class="diagnose__summary-step">${escapeHtml(entry.step)}:</span> ${escapeHtml(entry.answer)}</li>`,
    ).join('');

    const meta = [
      goalLabel ? `<p class="diagnose__summary-meta"><strong>Нужный результат:</strong> ${escapeHtml(goalLabel)}.</p>` : '',
      startLabel ? `<p class="diagnose__summary-meta"><strong>Формат старта:</strong> ${escapeHtml(startLabel)}.</p>` : '',
    ].filter(Boolean).join('');

    return `
      <section class="diagnose__summary" aria-labelledby="diagnose-summary-title">
        <h4 class="diagnose__narrative-title" id="diagnose-summary-title">Ответы проблемомера</h4>
        <ul class="diagnose__summary-list">${items}</ul>
        ${meta}
      </section>
    `;
  }

  function buildLeadPrefill(outcome) {
    const ctx = buildContextFromEntries(state.path);
    const { answers, goalLabel, startLabel } = getPathSummaryData();
    const pathEntriesForPrefill = state.path
      .filter((entry) => entry.nodeId !== 'q10_start')
      .map((entry) => {
        const node = NODES[entry.nodeId];
        const copy = getNodeCopy(entry.nodeId, ctx);
        return {
          nodeId: entry.nodeId,
          step: copy.label || node?.label || entry.nodeId,
          question: copy.question || node?.question || '',
          answerId: entry.optionId,
          answer: entry.label,
        };
      });

    const objectEntry = state.path.find((p) => p.nodeId === 'q3_object');
    const stageEntry = state.path.find((p) => p.nodeId === 'q4_stage');

    const OBJECT_MAP = {
      apartment: 'apartment',
      house: 'house',
      office: 'office',
      studio: ctx.has('scenario-guests') ? 'horeca' : 'studio',
      industrial: 'industrial',
      other: 'other',
    };

    const STAGE_MAP = {
      idea: 'design-project',
      before: 'before',
      during: 'during',
      ready: 'ready',
    };

    const answerLines = answers.map((entry) => `• ${entry.step}: ${entry.answer}`);
    const narrative = buildResultNarrative(outcome);
    const taskParts = [
      'Заявка после подбора формата на сайте.',
      '',
      `Рекомендация ЦИА: ${outcome.title} (услуга ${SERVICE_META[outcome.service].num} «${SERVICE_META[outcome.service].title}»).`,
      '',
      narrative.text,
      '',
      'Ответы проблемомера:',
      ...answerLines,
    ];

    if (goalLabel) taskParts.push('', `Нужный результат: ${goalLabel}.`);
    if (startLabel) taskParts.push(`Формат старта: ${startLabel}.`);

    return {
      source: 'diagnose',
      serviceType: outcome.service,
      objectType: objectEntry ? OBJECT_MAP[objectEntry.optionId] || '' : '',
      projectStage: stageEntry ? STAGE_MAP[stageEntry.optionId] || '' : '',
      task: taskParts.join('\n'),
      outcome: {
        title: outcome.title,
        service: outcome.service,
        serviceNum: SERVICE_META[outcome.service].num,
      },
      path: pathEntriesForPrefill,
    };
  }

  function scrollToElement(el, block = 'nearest') {
    if (!el) return;
    if (window.CIA_SCROLL_TO_ELEMENT) {
      window.CIA_SCROLL_TO_ELEMENT(el, { anchor: block === 'start' || block === 'nearest' });
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block });
  }

  function applyToLead(outcome) {
    const resolved = outcome || state.lastOutcome || resolveOutcome();
    const prefill = buildLeadPrefill(resolved);
    window.__CIA_DIAGNOSE_PREFILL = prefill;

    if (window.CIA_APPLY_LEAD_PREFILL) {
      window.CIA_APPLY_LEAD_PREFILL(prefill);
    } else {
      setServiceType(prefill.serviceType);
      const objectType = document.getElementById('objectType');
      const projectStage = document.getElementById('projectStage');
      const task = document.getElementById('task');
      if (objectType && prefill.objectType) objectType.value = prefill.objectType;
      if (projectStage && prefill.projectStage) projectStage.value = prefill.projectStage;
      if (task && prefill.task) task.value = prefill.task;
    }

    const lead = document.getElementById('lead');
    if (lead) scrollToElement(lead, 'start');
  }

  function setServiceType(service) {
    const select = document.getElementById('serviceType');
    if (!select) return;
    if (select.querySelector(`option[value="${service}"]`)) {
      select.value = service;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function openService(service) {
    if (window.CIA_SET_SERVICE) window.CIA_SET_SERVICE(service);
    const panel = document.getElementById(`service-${service}`);
    if (panel) scrollToElement(panel, 'start');
  }

  function renderProgress() {
    const { current, total } = getProgress();
    els.counter.textContent = state.finished ? 'Готово' : `Вопрос ${current} из ${total}`;
    if (els.progressBar) {
      const pct = total ? Math.round((current / total) * 100) : 0;
      els.progressBar.style.width = `${state.finished ? 100 : pct}%`;
    }
  }

  function setWizardVisible(visible) {
    if (els.flow) els.flow.hidden = !visible;
    if (els.topline) els.topline.hidden = !visible;
    if (els.progressTrack) els.progressTrack.hidden = !visible;
    if (els.layout) els.layout.classList.toggle('is-result', !visible);
    app.classList.toggle('is-finished', !visible);
  }

  function renderStep() {
    setWizardVisible(true);
    const node = NODES[state.currentNode];
    if (!node) return;

    const selected = state.selectedId;
    const option = selected ? getOption(state.currentNode, selected) : null;
    const ctx = buildContext();
    const copy = getNodeCopy(state.currentNode, ctx);

    app.dataset.currentNode = state.currentNode;
    els.stepLabel.textContent = copy.label || node.label;
    els.question.textContent = copy.question || node.question;

    if (els.lead) {
      const leadText = copy.lead || '';
      els.lead.textContent = leadText;
      els.lead.hidden = !leadText;
    }

    els.back.disabled = state.path.length === 0;
    els.next.disabled = !selected;

    const isLast = isLastStep(state.currentNode, ctx);
    els.next.innerHTML = isLast
      ? 'Показать рекомендацию <span class="btn__arrow" aria-hidden="true">→</span>'
      : 'Далее <span class="btn__arrow" aria-hidden="true">→</span>';

    const filteredOptions = filterOptions(state.currentNode, node.options, ctx);

    els.options.innerHTML = filteredOptions.map((opt) => `
      <button
        type="button"
        class="diagnose__chip ${selected === opt.id ? 'is-selected' : ''}"
        aria-pressed="${selected === opt.id ? 'true' : 'false'}"
        data-option="${opt.id}"
        title="${escapeHtml(opt.detail)}"
        onclick="window.CIA_DIAGNOSE_SELECT && window.CIA_DIAGNOSE_SELECT('${opt.id}')"
      >${opt.label}</button>
    `).join('');

    const hintText = selected && option ? (option.hint || option.detail || '') : '';
    els.hint.textContent = hintText;
    els.hint.classList.toggle('is-visible', Boolean(hintText));

    renderProgress();
    renderReadiness();
  }

  function buildAlternativeLine(serviceId, meta) {
    if (meta.alternativeNote) {
      return `Альтернатива: ${meta.title}, ${meta.alternativeNote}.`;
    }
    return `Альтернатива: ${meta.title}.`;
  }

  function renderResult() {
    const outcome = resolveOutcome();
    const meta = SERVICE_META[outcome.service];
    const altMeta = outcome.alternative ? SERVICE_META[outcome.alternative] : null;
    const margin = (() => {
      const sorted = Object.entries(scoreFromPath()).sort((a, b) => b[1] - a[1]);
      return sorted[0][1] - (sorted[1]?.[1] || 0);
    })();
    const clarity = margin >= 4 ? 'Рекомендация однозначная' : 'Есть близкий альтернативный формат';
    const narrative = buildResultNarrative(outcome);
    const summaryHtml = renderPathSummaryHtml();

    state.finished = true;
    state.lastOutcome = outcome;
    setWizardVisible(false);
    els.result.hidden = false;

    els.result.innerHTML = `
      <div class="diagnose__result-card">
        <button
          type="button"
          class="diagnose__service-pick diagnose__service-pick--action"
          data-diagnose-open-service="${outcome.service}"
          aria-label="Открыть услугу: ${escapeHtml(meta.title)}"
        >
          <span class="diagnose__service-num" aria-hidden="true">${meta.num}</span>
          <div class="diagnose__service-pick-body">
            <p class="diagnose__service-pick-kicker">Рекомендуемый формат ЦИА</p>
            <h3 class="diagnose__service-pick-title">${escapeHtml(meta.title)}</h3>
            <p class="diagnose__service-pick-sub">${escapeHtml(outcome.title)}</p>
          </div>
          <span class="diagnose__result-badge">${clarity}</span>
        </button>

        ${summaryHtml}

        <section class="diagnose__narrative diagnose__narrative--unified" aria-labelledby="diagnose-narrative-title">
          <h4 class="diagnose__narrative-title" id="diagnose-narrative-title">Ваш результат</h4>
          <p class="diagnose__narrative-text">${escapeHtml(narrative.text)}</p>
        </section>

        ${altMeta ? `<p class="diagnose__alternative">${escapeHtml(buildAlternativeLine(outcome.alternative, altMeta))}</p>` : ''}
        <div class="diagnose__result-actions">
          <a href="#lead" class="btn btn--primary" data-diagnose-lead="${outcome.service}" onclick="event.preventDefault(); window.CIA_DIAGNOSE_APPLY_LEAD && window.CIA_DIAGNOSE_APPLY_LEAD()">Оставить заявку <span class="btn__arrow" aria-hidden="true">→</span></a>
          <button type="button" class="diagnose__restart" data-diagnose-restart onclick="window.CIA_DIAGNOSE_RESTART && window.CIA_DIAGNOSE_RESTART()">Пройти заново</button>
        </div>
      </div>
    `;

    renderProgress();
    renderReadiness();
    requestAnimationFrame(() => scrollToElement(els.result, 'nearest'));
  }

  function selectOption(value) {
    const node = NODES[state.currentNode];
    if (!node) return;
    const option = node.options.find((o) => o.id === value);
    if (!option) return;
    state.selectedId = value;
    state.finished = false;
    els.result.hidden = true;
    renderStep();
  }

  function commitStep() {
    const node = NODES[state.currentNode];
    const option = getSelectedOption();
    if (!node || !option) return;

    applyOptionScores(option);
    state.path.push({
      nodeId: state.currentNode,
      optionId: option.id,
      label: option.label,
      short: option.label.length > 28 ? `${option.label.slice(0, 26)}…` : option.label,
    });

    const ctx = buildContext();
    const next = resolveNext(state.currentNode, option, ctx);

    state.selectedId = null;

    if (next === 'result') {
      applyInferredStart(buildContext());
      renderResult();
      return;
    }

    state.currentNode = next;
    renderStep();
  }

  function rebuildFromPath() {
    state.tags = [];
    state.scores = emptyScores();
    state.path.forEach((entry) => {
      const opt = getOption(entry.nodeId, entry.optionId);
      if (!opt) return;
      (opt.tags || []).forEach((tag) => {
        if (!state.tags.includes(tag)) state.tags.push(tag);
      });
      Object.entries(opt.scores || {}).forEach(([service, score]) => {
        state.scores[service] = (state.scores[service] || 0) + score;
      });
    });
  }

  function prevStep() {
    if (state.path.length === 0) return;
    const last = state.path.pop();
    rebuildFromPath();
    state.currentNode = last.nodeId;
    state.selectedId = last.optionId;
    state.finished = false;
    els.result.hidden = true;
    renderStep();
  }

  function restart() {
    state.currentNode = START_NODE;
    state.path = [];
    state.tags = [];
    state.scores = emptyScores();
    state.selectedId = null;
    state.lastOutcome = null;
    state.finished = false;
    els.result.hidden = true;
    renderStep();
  }

  window.CIA_DIAGNOSE_SELECT = selectOption;
  window.CIA_DIAGNOSE_NEXT = commitStep;
  window.CIA_DIAGNOSE_BACK = prevStep;
  window.CIA_DIAGNOSE_RESTART = restart;
  window.CIA_DIAGNOSE_OPEN_SERVICE = openService;
  window.CIA_DIAGNOSE_APPLY_LEAD = applyToLead;
  window.CIA_DIAGNOSE_SET_SERVICE_TYPE = setServiceType;

  els.options.addEventListener('click', (event) => {
    const button = event.target.closest('[data-option]');
    if (!button) return;
    selectOption(button.dataset.option);
  });

  els.next.addEventListener('click', commitStep);
  els.back.addEventListener('click', prevStep);

  els.result.addEventListener('click', (event) => {
    const serviceLink = event.target.closest('[data-diagnose-open-service]');
    if (serviceLink) {
      event.preventDefault();
      openService(serviceLink.getAttribute('data-diagnose-open-service'));
      return;
    }
    const leadLink = event.target.closest('[data-diagnose-lead]');
    if (leadLink) {
      event.preventDefault();
      applyToLead();
      return;
    }
    const restartButton = event.target.closest('[data-diagnose-restart]');
    if (restartButton) restart();
  });

  state.scores = emptyScores();
  renderStep();
})();
