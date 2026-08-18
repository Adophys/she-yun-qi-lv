// pages/index/index.js
Page({
  data: {
    activeTab: 'village', // 'village' | 'explore' | 'scan' | 'wardrobe' | 'profile'
    
    // 用户信息
    user: {
      name: '阿渺 (A-Miao)',
      title: '畲寨非遗守护者',
      level: 5,
      points: 1280,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      collectedCards: 28,
      totalCards: 100,
      arDiscovered: 8,
      streak: 7
    },

    // 每日灵签
    dailySign: {
      title: '凤鸣朝阳',
      poetry: '山哈欢歌穿翠竹，彩带翻飞结同心。',
      meaning: '今日适宜探访织锦坊，感悟千年彩带之美。',
      revealed: false
    },

    // 寨落建筑
    buildings: [
      {
        id: 'museum',
        name: '畲族历史博物馆',
        tag: '文脉寻根',
        icon: '🏛️',
        desc: '探索盘瓠传说与千年山哈迁徙史诗',
        hot: true,
        progress: '12/15 遗珠'
      },
      {
        id: 'silver',
        name: '非遗银雕工坊',
        tag: '匠心百炼',
        icon: '✨',
        desc: '聆听银锤叮当，赏双凤朝阳银冠之华',
        hot: false,
        progress: '8/10 遗珠'
      },
      {
        id: 'weaving',
        name: '凤凰彩带织坊',
        tag: '指尖生花',
        icon: '🧵',
        desc: '经纬交错，编织寓意吉祥的字带与鸟兽纹',
        hot: true,
        progress: '15/20 遗珠'
      },
      {
        id: 'singing',
        name: '山哈对歌长廊',
        tag: '天籁传情',
        icon: '🎵',
        desc: '依歌而生，三月三对唱叙事古调',
        hot: false,
        progress: '6/10 遗珠'
      },
      {
        id: 'tea',
        name: '惠明禅茶寮',
        tag: '古法茶韵',
        icon: '🍵',
        desc: '云雾生灵叶，体验宋代御贡茶制作技艺',
        hot: false,
        progress: '9/10 遗珠'
      }
    ],

    // 探索关卡
    stages: [
      { id: 1, title: '第一回：初入凤凰山', desc: '相传畲民自凤凰山迁徙而来，解开山门图腾', unlocked: true, completed: true, stars: 3 },
      { id: 2, title: '第二回：五彩编织韵', desc: '收集彩带字模，拼合定情信物密码', unlocked: true, completed: true, stars: 3 },
      { id: 3, title: '第三回：银饰百凤朝', desc: '熔银为丝，锻造守护神凤项圈', unlocked: true, completed: false, stars: 2 },
      { id: 4, title: '第四回：三月三盛宴', desc: '乌米饭飘香，踏响竹竿舞的欢快节拍', unlocked: false, completed: false, stars: 0 },
      { id: 5, title: '第五回：神木盘瓠语', desc: '探秘深山古木，揭晓古老的图腾长卷', unlocked: false, completed: false, stars: 0 }
    ],

    // 答题互动
    quizVisible: false,
    currentQuizIndex: 0,
    quizScore: 0,
    quizFinished: false,
    quizQuestions: [
      {
        question: '畲族传统节日中，最隆重且被称为“乌饭节”的是哪个节日？',
        options: ['二月二龙抬头', '三月三', '五月初五端午', '九月初九重阳'],
        answer: 1,
        selected: null,
        explained: '“三月三”是畲族最重要的传统节日，又称“乌饭节”，畲民食乌米饭、对山歌、缅怀祖先。'
      },
      {
        question: '畲族国家级非物质文化遗产中，女性婚嫁必戴的华丽头饰是？',
        options: ['凤冠银钗', '金雀摇簪', '红顶珠帕', '苗银牛角'],
        answer: 0,
        selected: null,
        explained: '畲族凤冠是畲族妇女最珍贵的头饰，以纯银雕刻凤凰、流苏及宝塔，象征吉祥如意。'
      },
      {
        question: '畲族“彩带”在传统习俗中常作为什么使用？',
        options: ['货币流通', '定情信物与腰带', '狩猎绳索', '烹饪工具'],
        answer: 1,
        selected: null,
        explained: '畲族彩带是姑娘们手工挑织的字带或花带，常在定情时赠与意中人，亦作为盛装腰带。'
      }
    ],

    // 拼图游戏状态
    puzzlePieces: [
      { id: 0, pos: 0, correct: 0, bg: 'linear-gradient(135deg, #1e3a8a, #3b82f6)' },
      { id: 1, pos: 1, correct: 1, bg: 'linear-gradient(135deg, #b45309, #f59e0b)' },
      { id: 2, pos: 2, correct: 2, bg: 'linear-gradient(135deg, #047857, #10b981)' },
      { id: 3, pos: 3, correct: 3, bg: 'linear-gradient(135deg, #7c3aed, #a855f7)' }
    ],
    selectedPieceIndex: null,
    puzzleSolved: true,

    // 换装系统
    wardrobeCategory: 'clothes', // 'clothes' | 'headwear' | 'accessories'
    equippedItems: {
      clothes: 'w-c1',
      headwear: 'w-h1',
      accessories: 'w-a2'
    },
    wardrobeList: [
      {
        id: 'w-c1',
        name: '凤凰盛装华服',
        category: 'clothes',
        rarity: '传世',
        desc: '衣襟绣五彩凤凰与云水纹，高贵端庄',
        color: '#dc2626',
        isLocked: false
      },
      {
        id: 'w-c2',
        name: '青靛织蓝襦裙',
        category: 'clothes',
        rarity: '稀有',
        desc: '天然蓝草染制，配畲彩几何滚边',
        color: '#2563eb',
        isLocked: false
      },
      {
        id: 'w-c3',
        name: '山野踏青布装',
        category: 'clothes',
        rarity: '普通',
        desc: '轻便麻布短褂，适宜山林劳作采茶',
        color: '#059669',
        isLocked: false
      },
      {
        id: 'w-h1',
        name: '双凤朝阳银冠',
        category: 'headwear',
        rarity: '传世',
        desc: '顶立银凤，流苏垂肩，走动环佩叮当',
        color: '#cbd5e1',
        isLocked: false
      },
      {
        id: 'w-h2',
        name: '精编五彩花斗笠',
        category: 'headwear',
        rarity: '稀有',
        desc: '发丝细篾编织，嵌红黄绿各色彩线',
        color: '#d97706',
        isLocked: false
      },
      {
        id: 'w-a1',
        name: '玲珑宝塔银耳坠',
        category: 'accessories',
        rarity: '稀有',
        desc: '纯银精细镂空雕琢，步履轻摇生韵',
        color: '#94a3b8',
        isLocked: false
      },
      {
        id: 'w-a2',
        name: '盘瓠图腾御守项圈',
        category: 'accessories',
        rarity: '传世',
        desc: '非遗银雕宗师手作，铭刻福寿吉祥符',
        color: '#e2e8f0',
        isLocked: false
      }
    ],

    // 识别扫描宝物
    scannedArtifacts: [
      { id: 'a1', name: '畲家乌米饭甑', score: 98, tag: '饮食文化', time: '刚刚识别', desc: '用乌稔树叶汁浸泡优质糯米蒸熟而成，香气清远' },
      { id: 'a2', name: '千年字带织机', score: 95, tag: '工艺非遗', time: '今日', desc: '腰机织带法，以手为综，经纬分明' },
      { id: 'a3', name: '九连环银腰链', score: 91, tag: '银雕非遗', time: '昨天', desc: '九节纯银活扣环环相扣，护佑平安' }
    ],
    isScanning: false,
    selectedBuilding: null
  },

  onLoad() {
    console.log('畲韵奇旅 微信小程序原生主页初始化');
  },

  // 切换主底部 Tab
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({ activeTab: tab });
  },

  // 抽取每日灵签
  drawDailySign() {
    if (this.data.dailySign.revealed) {
      wx.showToast({ title: '今日已求得吉签~', icon: 'success' });
      return;
    }
    wx.showLoading({ title: '虔心问卦中...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({
        'dailySign.revealed': true,
        'user.points': this.data.user.points + 50
      });
      wx.showToast({ title: '修为 +50 点！', icon: 'none' });
    }, 600);
  },

  // 查看建筑详情
  openBuildingDetail(e) {
    const item = e.currentTarget.dataset.item;
    this.setData({ selectedBuilding: item });
  },

  closeBuildingDetail() {
    this.setData({ selectedBuilding: null });
  },

  // 开始趣味答题
  startQuiz() {
    this.setData({
      quizVisible: true,
      currentQuizIndex: 0,
      quizScore: 0,
      quizFinished: false,
      'quizQuestions[0].selected': null,
      'quizQuestions[1].selected': null,
      'quizQuestions[2].selected': null
    });
  },

  closeQuiz() {
    this.setData({ quizVisible: false });
  },

  // 选择答题选项
  chooseOption(e) {
    const optIdx = e.currentTarget.dataset.index;
    const qIdx = this.data.currentQuizIndex;
    const currentQ = this.data.quizQuestions[qIdx];
    
    if (currentQ.selected !== null) return; // 已选过

    const isCorrect = optIdx === currentQ.answer;
    const updatedQuestions = [...this.data.quizQuestions];
    updatedQuestions[qIdx].selected = optIdx;

    let newScore = this.data.quizScore + (isCorrect ? 100 : 0);

    this.setData({
      quizQuestions: updatedQuestions,
      quizScore: newScore
    });

    if (isCorrect) {
      wx.showToast({ title: '回答正确 +100', icon: 'success' });
    } else {
      wx.showToast({ title: '回答有误，仔细看解析哦', icon: 'none' });
    }
  },

  nextQuestion() {
    const nextIdx = this.data.currentQuizIndex + 1;
    if (nextIdx < this.data.quizQuestions.length) {
      this.setData({ currentQuizIndex: nextIdx });
    } else {
      this.setData({
        quizFinished: true,
        'user.points': this.data.user.points + this.data.quizScore
      });
    }
  },

  // 换装切换
  switchWardrobeCategory(e) {
    const cat = e.currentTarget.dataset.cat;
    this.setData({ wardrobeCategory: cat });
  },

  equipItem(e) {
    const item = e.currentTarget.dataset.item;
    const cat = item.category;
    const currentEquipped = { ...this.data.equippedItems };
    currentEquipped[cat] = item.id;
    
    this.setData({
      equippedItems: currentEquipped
    });

    wx.showToast({
      title: `已换上【${item.name}】`,
      icon: 'success'
    });
  },

  // 模拟 AR 扫描
  triggerARScan() {
    this.setData({ isScanning: true });
    wx.showLoading({ title: 'AI 识物解析中...' });
    setTimeout(() => {
      wx.hideLoading();
      this.setData({ isScanning: false });
      const newItems = [
        {
          id: 'a' + Date.now(),
          name: '畲族盘瓠石刻',
          score: 99,
          tag: '图腾石刻',
          time: '刚刚识别',
          desc: '镌刻着山哈祖先的古老图腾，象征坚韧不拔的拓荒精神。'
        },
        ...this.data.scannedArtifacts
      ];
      this.setData({
        scannedArtifacts: newItems,
        'user.arDiscovered': this.data.user.arDiscovered + 1,
        'user.points': this.data.user.points + 80
      });
      wx.showModal({
        title: '🌟 成功解锁新遗珠！',
        content: '您发现了【畲族盘瓠石刻】，获得 80 文化修为点并收录至山哈图鉴！',
        showCancel: false,
        confirmText: '收入囊中'
      });
    }, 1500);
  },

  // 打乱拼图
  shufflePuzzle() {
    const shuffled = [...this.data.puzzlePieces].sort(() => Math.random() - 0.5);
    shuffled.forEach((p, idx) => { p.pos = idx; });
    this.setData({
      puzzlePieces: shuffled,
      puzzleSolved: false,
      selectedPieceIndex: null
    });
    wx.showToast({ title: '已打乱碎片，点击互换位置还原', icon: 'none' });
  },

  // 点击拼图块交换
  tapPiece(e) {
    const idx = e.currentTarget.dataset.index;
    if (this.data.selectedPieceIndex === null) {
      this.setData({ selectedPieceIndex: idx });
    } else {
      const first = this.data.selectedPieceIndex;
      const second = idx;
      if (first !== second) {
        const pieces = [...this.data.puzzlePieces];
        const temp = pieces[first];
        pieces[first] = pieces[second];
        pieces[second] = temp;

        // 检查是否还原
        const isSolved = pieces.every((p, i) => p.id === i);

        this.setData({
          puzzlePieces: pieces,
          selectedPieceIndex: null,
          puzzleSolved: isSolved
        });

        if (isSolved) {
          wx.showModal({
            title: '🎉 拼图大功告成！',
            content: '您还原了【彩带织凤图案】，获得 150 点修为！',
            showCancel: false
          });
          this.setData({
            'user.points': this.data.user.points + 150
          });
        }
      } else {
        this.setData({ selectedPieceIndex: null });
      }
    }
  },

  onShareAppMessage() {
    return {
      title: '畲韵奇旅 - 一起探索千年非遗文化！',
      path: '/pages/index/index'
    };
  }
});
