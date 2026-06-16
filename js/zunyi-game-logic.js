// 遵义会议游戏逻辑 - 红色文化实践探索版

// 页面加载完成后隐藏加载屏幕（备用方案）
window.addEventListener('load', function() {
    setTimeout(function() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen && !loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
            setTimeout(function() {
                loadingScreen.style.display = 'none';
            }, 800);
        }
    }, 1500);
});

let gameState = {
    currentScene: 0,
    score: 0,
    correctDecisions: 0,
    morale: 100,
    spiritPoints: 0,
    answered: false,
    achievements: []
};

// Start Game
function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('game-container').style.display = 'block';
    loadScene(0);
}

// Load Scene
function loadScene(sceneIndex) {
    const scene = gameScenes[sceneIndex];
    gameState.answered = false;

  	speechSynthesis.cancel(); // 清空队列
    
    const utterance = new SpeechSynthesisUtterance(scene.description);
  	utterance.rate = 1.3;
    speechSynthesis.speak(utterance);
    // Update stats
    document.getElementById('current-scene').textContent = sceneIndex + 1;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('correct-decisions').textContent = gameState.correctDecisions;
    document.getElementById('morale').textContent = gameState.morale;
    document.getElementById('spirit-points').textContent = gameState.spiritPoints;

    // Update progress
    const progress = ((sceneIndex) / gameScenes.length) * 100;
    document.getElementById('progress-fill').style.width = progress + '%';
    document.getElementById('progress-text').textContent = Math.round(progress) + '%';

    // Update scene content
    document.getElementById('scene-indicator').textContent = `场景 ${sceneIndex + 1}/${gameScenes.length}`;
    document.getElementById('scene-title').textContent = scene.title;
    document.getElementById('scene-image').src = scene.img;
    document.getElementById('scene-description').textContent = scene.description;
    document.getElementById('historical-quote').textContent = scene.quote;

    // Update practice exploration panel
    updatePracticePanel(scene);

    // Generate decision options
    const optionsContainer = document.getElementById('decision-options');
    optionsContainer.innerHTML = '';

    scene.options.forEach((option, index) => {
        const btn = document.createElement('button');
        btn.className = 'decision-btn';
        btn.textContent = option.text;
        btn.onclick = () => makeDecision(index);
        optionsContainer.appendChild(btn);
    });

    // Hide feedback panel
    document.getElementById('feedback-panel').classList.remove('show');
}

// Update Practice Exploration Panel
function updatePracticePanel(scene) {
    const tagsContainer = document.getElementById('spirit-tags');
    tagsContainer.innerHTML = scene.spiritTags.map(tag => 
        `<span class="spirit-tag">${tag}</span>`
    ).join('');

    document.getElementById('knowledge-content').textContent = scene.knowledge;
    document.getElementById('value-content').textContent = scene.contemporaryValue;
}

// Make Decision
function makeDecision(optionIndex) {
    if (gameState.answered) return;
    gameState.answered = true;

    const scene = gameScenes[gameState.currentScene];
    const option = scene.options[optionIndex];
    const buttons = document.querySelectorAll('.decision-btn');

    buttons.forEach(btn => btn.disabled = true);

    if (option.correct) {
        buttons[optionIndex].classList.add('correct');
        gameState.score += 100;
        gameState.correctDecisions++;
        gameState.spiritPoints += 10;
        gameState.morale = Math.min(100, gameState.morale + option.moraleChange);
        addAchievement(scene.spiritTags[0]);
    } else {
        buttons[optionIndex].classList.add('wrong');
        scene.options.forEach((opt, idx) => {
            if (opt.correct) buttons[idx].classList.add('correct');
        });
        gameState.morale = Math.max(0, gameState.morale + option.moraleChange);
    }

    document.getElementById('score').textContent = gameState.score;
    document.getElementById('correct-decisions').textContent = gameState.correctDecisions;
    document.getElementById('morale').textContent = gameState.morale;
    document.getElementById('spirit-points').textContent = gameState.spiritPoints;

    const feedbackPanel = document.getElementById('feedback-panel');
    const feedbackTitle = document.getElementById('feedback-title');
    const feedbackContent = document.getElementById('feedback-content');
    const insightContent = document.getElementById('insight-content');

    feedbackTitle.textContent = option.correct ? '✓ 正确决策！' : '✗ 需要反思';
    feedbackTitle.className = 'feedback-title ' + (option.correct ? 'correct' : 'wrong');
    feedbackContent.textContent = option.feedback;
    insightContent.textContent = option.insight;

    feedbackPanel.classList.add('show');

    if (gameState.currentScene === gameScenes.length - 1) {
        document.getElementById('next-btn').textContent = '查看成果 →';
    }
}

// Add Achievement
function addAchievement(spirit) {
    if (!gameState.achievements.includes(spirit)) {
        gameState.achievements.push(spirit);
    }
}

// Next Scene
function nextScene() {
    gameState.currentScene++;
    if (gameState.currentScene >= gameScenes.length) {
        showEndScreen();
    } else {
        loadScene(gameState.currentScene);
    }
}

// Show End Screen
function showEndScreen() {
    const endScreen = document.getElementById('end-screen');
    const finalScore = document.getElementById('final-score');
    const endMessage = document.getElementById('end-message');
    const correctCount = document.getElementById('correct-count');
    const accuracyRate = document.getElementById('accuracy-rate');
    const spiritScore = document.getElementById('spirit-score');
    const achievementGrid = document.getElementById('achievement-grid');

    const accuracy = Math.round((gameState.correctDecisions / gameScenes.length) * 100);

    finalScore.textContent = gameState.score;
    correctCount.textContent = gameState.correctDecisions;
    accuracyRate.textContent = accuracy + '%';
    spiritScore.textContent = gameState.spiritPoints;

    const achievementData = [
        { icon: '🎯', name: '实事求是', desc: '坚持从实际出发，理论联系实际' },
        { icon: '💡', name: '独立自主', desc: '走自己的路，不盲从他人' },
        { icon: '🤝', name: '团结协作', desc: '顾全大局，维护党的团结统一' },
        { icon: '📚', name: '思想引领', desc: '用科学理论武装头脑、指导实践' },
        { icon: '⚡', name: '灵活机动', desc: '因势利导，精准施策' },
        { icon: '✨', name: '创新精神', desc: '勇于突破，开拓进取' }
    ];

    achievementGrid.innerHTML = achievementData.map(ach => {
        const unlocked = gameState.achievements.some(a => a.includes(ach.name) || ach.name.includes(a));
        return `
            <div class="achievement-item" style="opacity: ${unlocked ? 1 : 0.4};">
                <div class="achievement-icon">${ach.icon}</div>
                <div class="achievement-name">${ach.name} ${unlocked ? '✓' : '🔒'}</div>
                <div class="achievement-desc">${ach.desc}</div>
            </div>
        `;
    }).join('');

    if (accuracy >= 80) {
        endMessage.innerHTML = '<p><strong>🏆 优秀！</strong>你对遵义会议的历史有着深刻的理解，充分展现了红色文化实践探索的成果。</p><p>正如历史所展示的，遵义会议是中国共产党历史上一个生死攸关的转折点。</p><p><strong>实践探索成果：</strong></p><p>• 深刻理解了实事求是的思想路线<br>• 掌握了独立自主的革命精神<br>• 领悟了团结协作的优良作风<br>• 认识到了创新思维的当代价值</p><p>遵义会议的精神告诉我们：必须坚持实事求是的思想路线，必须把马克思主义基本原理同中国具体实际相结合，必须维护党中央的权威和集中统一领导。</p>';
      	speechSynthesis.cancel(); // 清空队列
    
    	const utterance = new SpeechSynthesisUtterance("你对遵义会议的历史有着深刻的理解，充分展现了红色文化实践探索的成果。正如历史所展示的，遵义会议是中国共产党历史上一个生死攸关的转折点。通过这次实践探索，你一定深刻理解了实事求是的思想路线，掌握了独立自主的革命精神，领悟了团结协作的优良作风，认识到了创新思维的当代价值。遵义会议的精神告诉我们：必须坚持实事求是的思想路线，必须把马克思主义基本原理同中国具体实际相结合，必须维护党中央的权威和集中统一领导。");
  		utterance.rate = 1.3;
    	speechSynthesis.speak(utterance);
    } else if (accuracy >= 60) {
        endMessage.innerHTML = '<p><strong>👍 良好！</strong>你对遵义会议有一定的了解，但还需要深入学习。</p><p>遵义会议的伟大意义在于：它确立了毛泽东同志在党中央和红军的领导地位。</p><p><strong>建议继续探索：</strong></p><p>• 重温党史，特别是遵义会议的背景、过程和意义<br>• 深入理解红色精神的内涵和当代价值<br>• 将理论学习与实践探索相结合</p>';
      	speechSynthesis.cancel(); // 清空队列
    
    	const utterance = new SpeechSynthesisUtterance("你对遵义会议有一定的了解，但还需要深入学习。遵义会议的伟大意义在于：它确立了毛泽东同志在党中央和红军的领导地位。建议继续探索：重温党史，特别是遵义会议的背景、过程和意义，深入理解红色精神的内涵和当代价值，将理论学习与实践探索相结合。");
  		utterance.rate = 1.3;
    	speechSynthesis.speak(utterance);
    } else {
        endMessage.innerHTML = '<p><strong>📖 继续努力！</strong>遵义会议的历史值得你深入了解。</p><p>这次会议在最危急关头挽救了党、挽救了红军、挽救了中国革命。</p><p><strong>学习建议：</strong></p><p>• 认真学习党史，特别是遵义会议的历史背景<br>• 理解红色文化的深刻内涵和精神实质<br>• 思考红色精神的当代价值和现实意义</p>';
      	speechSynthesis.cancel(); // 清空队列
    
    	const utterance = new SpeechSynthesisUtterance("遵义会议的历史值得你深入了解。这次会议在最危急关头挽救了党、挽救了红军、挽救了中国革命。学习建议：认真学习党史，特别是遵义会议的历史背景，理解红色文化的深刻内涵和精神实质，思考红色精神的当代价值和现实意义。");
  		utterance.rate = 1.3;
    	speechSynthesis.speak(utterance);
    }

    endScreen.classList.add('show');
}

// Restart Game
function restartGame() {
    gameState = {
        currentScene: 0,
        score: 0,
        correctDecisions: 0,
        morale: 100,
        spiritPoints: 0,
        answered: false,
        achievements: []
    };
    document.getElementById('end-screen').classList.remove('show');
    document.getElementById('next-btn').textContent = '下一场景 →';
    loadScene(0);
}

// Mobile optimizations - Prevent zoom on double tap
document.addEventListener('dblclick', function(event) {
    event.preventDefault();
}, { passive: false });

// Smooth scrolling for mobile
if ('scrollBehavior' in document.documentElement.style) {
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Handle orientation change
window.addEventListener('orientationchange', function() {
    setTimeout(function() {
        window.scrollTo(0, 0);
    }, 100);
});

