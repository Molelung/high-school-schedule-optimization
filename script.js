let currentSlide = 0;
        let isAnimating = false;
        let slideElements = [];
        
        document.addEventListener('DOMContentLoaded', function() {
            slideElements = document.querySelectorAll('.slide-wrapper');
            
            // 生成页面导航列表
            const pageNames = ['就绪', '封面', '目录', '研究背景', '文献综述', '研究问题', '研究方法', '结果分析', '结果讨论', '研究结论', '反思与展望', '答辩', '感谢聆听'];
            const sidebar = document.getElementById('pageSidebar');
            pageNames.forEach((name, index) => {
                const item = document.createElement('div');
                item.className = 'page-sidebar-item' + (index === 0 ? ' active' : '');
                item.textContent = (index + 1) + '. ' + name;
                item.addEventListener('click', () => jumpToSlide(index));
                sidebar.appendChild(item);
            });
            
            // 给所有slide添加几何装饰元素
            document.querySelectorAll('.slide').forEach(slide => {
                const decos = ['circle-1', 'circle-2', 'rect-1', 'rect-2', 'line-1', 'line-2'];
                decos.forEach(cls => {
                    const el = document.createElement('div');
                    el.className = 'geo-deco ' + cls;
                    slide.appendChild(el);
                });
            });
            
            setupEventListeners();
            updateUI();
        });
        
        // 跳转到指定页面并重置动画
        function jumpToSlide(index) {
            // 重置所有动画状态
            resetAnimations();
            
            // 关闭侧边栏
            document.getElementById('pageSidebar').classList.remove('open');
            
            // 跳转
            goToSlide(index);
        }
        
        // 重置所有动画状态
        function resetAnimations() {
            // 重置打字效果
            typingStarted = false;
            const textEl = document.getElementById('typing-text');
            const cursorEl = document.getElementById('typing-cursor');
            if (textEl) textEl.textContent = '';
            if (cursorEl) cursorEl.style.display = 'inline-block';
            document.getElementById('slide-info').style.opacity = '0';
            document.getElementById('slide-info').style.transform = 'translateX(-50px)';
            document.getElementById('slide-members').style.opacity = '0';
            document.getElementById('slide-members').style.transform = 'translateX(50px)';
            
            // 重置目录页
            tocClickCount = 0;
            tocComplete = false;
            document.querySelectorAll('.toc-item').forEach(item => item.classList.remove('show'));
            
            // 重置研究背景页
            bgClickCount = 0;
            bgComplete = false;
            bgAnimating = false;
            document.querySelectorAll('.crash-card').forEach(card => {
                card.classList.remove('active', 'crashed', 'crashed-hard');
            });
            
            // 重置文献综述页
            bookPageIndex = 0;
            bookComplete = false;
            document.getElementById('book-nav-hint').textContent = '点击翻页';
            
            // 重置研究问题页
            qStep = 0;
            qComplete = false;
            document.getElementById('main-question').classList.remove('drop', 'split');
            document.getElementById('sub-questions').classList.remove('show');
            
            // 重置研究方法页泡泡
            bubbleStep = 0;
            bubbleComplete = false;
            const mainBubble = document.getElementById('main-bubble');
            const smallBubbles = document.getElementById('small-bubbles');
            const stickyNotes = document.getElementById('sticky-notes');
            if (mainBubble) { mainBubble.classList.remove('show', 'pop'); mainBubble.style.display = ''; }
            if (smallBubbles) smallBubbles.classList.remove('show');
            if (stickyNotes) stickyNotes.classList.remove('show');
            document.querySelectorAll('.deco-bubble').forEach(b => b.classList.remove('visible'));
            
            // 重置反思与展望宽卡片
            wideStep = 0;
            wideComplete = false;
            wideAnimating = false;
            document.querySelectorAll('.wide-card').forEach((card, i) => {
                card.style.top = i === 0 ? '20%' : '100%';
                card.classList.toggle('active', i === 0);
                card.classList.remove('pushed');
            });
            
            // 重置研究结论卷轴
            scrollStep = 0;
            scrollComplete = false;
            scrollAnimating = false;
            document.querySelectorAll('.scroll-wrapper').forEach(s => s.classList.remove('unfolded'));
            
            // 重置结果讨论页
            discussGroup = 0;
            discussPhase = 0;
            discussComplete = false;
            discussAnimating = false;
            currentResultCard = null;
            currentEvidenceCard = null;
            const bean = document.getElementById('bean');
            const cardStage = document.getElementById('card-stage');
            const finalCard = document.getElementById('final-card');
            if (bean) bean.classList.remove('bean-exit');
            if (cardStage) cardStage.innerHTML = '';
            if (finalCard) finalCard.classList.remove('show');
            
            // 重置结果分析页图表
            chartGroup = 0;
            chartComplete = false;
            chartAnimating = false;
            const g1 = document.getElementById('chart-group-1');
            const g2 = document.getElementById('chart-group-2');
            const g3 = document.getElementById('chart-group-3');
            if (g1) { g1.classList.remove('animate'); g1.style.display = ''; g1.style.opacity = ''; }
            if (g2) { g2.classList.remove('animate'); g2.style.display = 'none'; g2.style.opacity = ''; }
            if (g3) { g3.classList.remove('animate'); g3.style.display = 'none'; g3.style.opacity = ''; }
            // 重置环状图
            document.querySelectorAll('.ring-fill').forEach(circle => {
                circle.style.strokeDashoffset = '439.82';
            });
            document.getElementById('chart-nav-hint').textContent = '点击切换下一组';
        }
        
        function setupEventListeners() {
            document.addEventListener('click', function(e) {
                if (e.target.closest('.fullscreen-btn') || e.target.closest('.page-nav-btn') || 
                    e.target.closest('.page-sidebar')) return;
                
                // 目录页点击展开卡片
                if (currentSlide === 2 && !tocComplete) {
                    handleTocClick();
                    return;
                }
                
                // 研究背景页点击展开卡片
                if (currentSlide === 3 && !bgComplete) {
                    handleBgClick();
                    return;
                }
                
                // 文献综述页翻书
                if (currentSlide === 4 && !bookComplete) {
                    handleBookClick();
                    return;
                }
                
                // 研究问题页动画
                if (currentSlide === 5 && !qComplete) {
                    handleQuestionClick();
                    return;
                }
                
                // 研究方法页泡泡动画
                if (currentSlide === 6 && !bubbleComplete) {
                    handleBubbleClick();
                    return;
                }
                
                // 结果分析页图表动画
                if (currentSlide === 7 && !chartComplete) {
                    handleChartClick();
                    return;
                }
                
                // 结果讨论页动画
                if (currentSlide === 8 && !discussComplete) {
                    handleDiscussClick();
                    return;
                }
                
                // 研究结论卷轴展开
                if (currentSlide === 9 && !scrollComplete) {
                    handleScrollClick();
                    return;
                }
                
                // 反思与展望宽卡片
                if (currentSlide === 10 && !wideComplete) {
                    handleWideClick();
                    return;
                }
                
                // 其他页面点击直接翻下一页
                nextSlide();
            });
            let wheelTimeout;
            document.addEventListener('wheel', function(e) {
                // 检查鼠标是否在可滚动的卷轴上方
                const scrollPaper = e.target.closest('.scroll-paper');
                if (scrollPaper && scrollPaper.scrollHeight > scrollPaper.clientHeight) {
                    // 允许卷轴内部滚动，不阻止默认行为
                    return;
                }
                
                e.preventDefault();
                clearTimeout(wheelTimeout);
                wheelTimeout = setTimeout(() => {
                    if (e.deltaY > 0) nextSlide(); else prevSlide();
                }, 100);
            }, { passive: false });
            document.addEventListener('keydown', function(e) {
                switch(e.key) {
                    case 'ArrowRight': case 'ArrowDown': case ' ': case 'PageDown':
                        e.preventDefault(); nextSlide(); break;
                    case 'ArrowLeft': case 'ArrowUp': case 'PageUp':
                        e.preventDefault(); prevSlide(); break;
                    case 'Home': e.preventDefault(); goToSlide(0); break;
                    case 'End': e.preventDefault(); goToSlide(slideElements.length - 1); break;
                    case 'F11': e.preventDefault(); toggleFullscreen(); break;
                }
            });
            document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
            document.getElementById('pageNavBtn').addEventListener('click', function() {
                document.getElementById('pageSidebar').classList.toggle('open');
            });
            document.getElementById('pageSidebarClose').addEventListener('click', function() {
                document.getElementById('pageSidebar').classList.remove('open');
            });
            let touchStartX = 0, touchStartY = 0;
            document.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; touchStartY = e.touches[0].clientY; });
            document.addEventListener('touchend', function(e) {
                const diffX = touchStartX - e.changedTouches[0].clientX;
                const diffY = touchStartY - e.changedTouches[0].clientY;
                if (Math.abs(diffX) > Math.abs(diffY)) {
                    if (diffX > 50) nextSlide(); else if (diffX < -50) prevSlide();
                }
            });
        }
        
        function toggleFullscreen() {
            if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen().catch(err => {
                    console.log('全屏请求失败:', err);
                });
            } else {
                document.exitFullscreen();
            }
        }
        
        function goToSlide(index) {
            if (isAnimating || index === currentSlide || index < 0 || index >= slideElements.length) return;
            isAnimating = true;
            slideElements[currentSlide].classList.remove('active');
            currentSlide = index;
            slideElements[currentSlide].classList.add('active');
            updateUI();
            setTimeout(() => { isAnimating = false; }, 500);
        }
        
        // 动画完成状态检查
        let bgClickCount = 0;
        let bgComplete = false;
        let bgAnimating = false;
        
        // 研究问题页动画状态
        let qStep = 0; // 0=未开始, 1=主问题掉落, 2=子问题展示
        let qComplete = false;
        
        // 答辩页状态
        let defendStep = 0;
        let defendComplete = false;
        
        // 反思与展望页宽卡片状态
        let wideStep = 0;
        let wideComplete = false;
        let wideAnimating = false;
        
        function handleWideClick() {
            if (currentSlide !== 10 || wideComplete || wideAnimating) return;
            
            const cards = document.querySelectorAll('.wide-card');
            if (wideStep < cards.length - 1) {
                wideAnimating = true;
                // 当前卡片推到顶部
                cards[wideStep].style.top = '-10%';
                cards[wideStep].classList.remove('active');
                cards[wideStep].classList.add('pushed');
                wideStep++;
                // 下一张卡片从底部冒出
                cards[wideStep].style.top = '20%';
                cards[wideStep].classList.add('active');
                setTimeout(() => { wideAnimating = false; }, 700);
            }
            if (wideStep >= cards.length - 1) {
                wideComplete = true;
            }
        }
        
        // 研究结论页卷轴状态
        let scrollStep = 0;
        let scrollComplete = false;
        let scrollAnimating = false;
        
        function handleScrollClick() {
            if (currentSlide !== 9 || scrollComplete || scrollAnimating) return;
            
            const scrolls = document.querySelectorAll('.scroll-wrapper');
            if (scrollStep < scrolls.length) {
                scrollAnimating = true;
                scrolls[scrollStep].classList.add('unfolded');
                scrollStep++;
                setTimeout(() => { scrollAnimating = false; }, 800);
                
                if (scrollStep >= scrolls.length) {
                    scrollComplete = true;
                }
            }
        }
        
        // 结果讨论页状态
        const discussData = [
            { result: '数理类科目需安排在上午，但应避开第一节。上午第一节41.9%学生最不专注，数理类71%-87%选择上午', evidence: '📄 验证文献：生物节律理论——生命活动呈周期性波动，早晨机械记忆力较强，上午9-11点处于顶峰（丛皓等，2019）' },
            { result: '异科联排可行，同科连堂应避免。66%支持异科联排，仅9.3%支持同科连堂，学生排斥的是重复内容', evidence: '📄 验证文献：认知负荷理论——同类学科连排会持续叠加内在认知负荷，极易造成超载（庞维国，2011）+ 脑部分区功能理论——单一脑区长期激活产生神经疲劳（周加仙，2013）' },
            { result: '问题在科目扎堆，而非课时总量。25.6%反映"黑色星期X"，8人中7人指向周三理科密集', evidence: '📄 验证文献：学习疲劳理论——高强度排课和长期单一学科学习会加重倦怠，导致注意力下降（靳铭等，2022）' },
            { result: '副科具备认知调节功能，应增加穿插频率。副科专注度较高，72.1%满意穿插安排', evidence: '📄 验证文献：学习迁移理论——交替学习不同类型内容可丰富认知网络，提升正向迁移（姚梅林，1994）' }
        ];
        // discussPhase: 0=吐结果卡, 1=吐证据卡(上一张消失), 2=盖章, 3=全部消失(进入下一组或结束)
        // discussGroup: 0-3 当前第几组
        let discussGroup = 0;
        let discussPhase = 0;
        let discussComplete = false;
        let discussAnimating = false;
        let currentResultCard = null;
        let currentEvidenceCard = null;
        
        function mouthOpen() {
            const mouth = document.getElementById('bean-mouth-svg');
            if (mouth) { 
                mouth.setAttribute('ry', '12'); 
                setTimeout(() => { mouth.setAttribute('ry', '4'); }, 300); 
            }
        }
        
        function handleDiscussClick() {
            if (currentSlide !== 8 || discussComplete || discussAnimating) return;
            
            const stage = document.getElementById('card-stage');
            const bean = document.getElementById('bean');
            const finalCard = document.getElementById('final-card');
            
            if (discussGroup < 4) {
                const data = discussData[discussGroup];
                discussAnimating = true;
                
                if (discussPhase === 0) {
                    // 吐出结果卡
                    mouthOpen();
                    currentResultCard = document.createElement('div');
                    currentResultCard.className = 'fly-card result-card';
                    currentResultCard.textContent = data.result;
                    stage.appendChild(currentResultCard);
                    setTimeout(() => { currentResultCard.classList.add('land'); discussPhase = 1; discussAnimating = false; }, 600);
                    
                } else if (discussPhase === 1) {
                    // 上一张消失 + 吐出证据卡
                    if (currentResultCard) { currentResultCard.style.opacity = '0'; currentResultCard.style.transition = 'opacity 0.3s'; }
                    mouthOpen();
                    currentEvidenceCard = document.createElement('div');
                    currentEvidenceCard.className = 'fly-card evidence-card';
                    currentEvidenceCard.textContent = data.evidence;
                    stage.appendChild(currentEvidenceCard);
                    setTimeout(() => { currentEvidenceCard.classList.add('land'); discussPhase = 2; discussAnimating = false; }, 600);
                    
                } else if (discussPhase === 2) {
                    // 盖章
                    const stamp = document.createElement('div');
                    stamp.className = 'stamp';
                    stamp.textContent = '✅ 已证实';
                    currentEvidenceCard.style.position = 'relative';
                    currentEvidenceCard.appendChild(stamp);
                    setTimeout(() => { stamp.classList.add('show'); discussPhase = 3; discussAnimating = false; }, 400);
                    
                } else if (discussPhase === 3) {
                    // 全部消失，进入下一组
                    if (currentResultCard) { currentResultCard.remove(); currentResultCard = null; }
                    if (currentEvidenceCard) { currentEvidenceCard.remove(); currentEvidenceCard = null; }
                    discussGroup++;
                    discussPhase = 0;
                    
                    if (discussGroup >= 4) {
                        // 所有4组完成
                        discussComplete = true;
                        discussAnimating = false;
                    } else {
                        discussAnimating = false;
                    }
                }
                
            } else {
                // 最终卡片
                discussComplete = true;
                discussAnimating = true;
                bean.classList.add('bean-exit');
                setTimeout(() => {
                    finalCard.classList.add('show');
                    discussAnimating = false;
                }, 500);
            }
        }
        
        // 结果分析页图表状态
        let chartGroup = 0; // 0=未开始, 1=第1组, 2=第2组
        let chartComplete = false;
        let chartAnimating = false;
        
        function initChartGroup(groupNum) {
            const group = document.getElementById('chart-group-' + groupNum);
            if (!group) return;
            
            if (groupNum === 1) {
                // 设置进度条目标宽度 + 数字计数
                group.querySelectorAll('.bar-item').forEach((item, index) => {
                    const val = parseFloat(item.dataset.value);
                    const fill = item.querySelector('.bar-fill');
                    const pctEl = item.querySelector('.bar-pct');
                    fill.style.setProperty('--target-width', val + '%');
                    // 延迟启动数字计数
                    setTimeout(() => {
                        animateCountUp(pctEl, val, 1200, '%');
                    }, 200 + index * 100);
                });
            } else if (groupNum === 2) {
                // 设置柱状图目标高度
                const maxVal = 41.9;
                group.querySelectorAll('.col-item').forEach(item => {
                    const val = parseFloat(item.dataset.value);
                    const bar = item.querySelector('.col-bar');
                    const heightPx = (val / maxVal) * 240;
                    bar.style.setProperty('--target-height', heightPx + 'px');
                });
            } else if (groupNum === 3) {
                // 环状图动画
                const circumference = 439.82;
                group.querySelectorAll('.ring-chart-item').forEach(item => {
                    const fills = item.querySelectorAll('.ring-fill');
                    fills.forEach((circle, index) => {
                        const val = parseFloat(circle.dataset.value);
                        const rotate = parseFloat(circle.dataset.rotate || 0);
                        const offset = circumference * (1 - val / 100);
                        const rotateOffset = circumference * (rotate / 100);
                        
                        // 设置旋转偏移
                        circle.style.transform = 'rotate(' + (rotate * 3.6) + 'deg)';
                        circle.style.transformOrigin = '90px 90px';
                        
                        // 延迟动画
                        setTimeout(() => {
                            circle.style.strokeDashoffset = offset;
                        }, index * 200);
                    });
                });
            }
        }
        
        // 数字计数动画 - 翻页时钟效果
        function animateCountUp(element, target, duration, suffix) {
            suffix = suffix || '%';
            const startTime = performance.now();
            const isFloat = target % 1 !== 0;
            element.textContent = '0' + suffix;
            
            function update(currentTime) {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                // easeOutQuart - 快速翻动然后减速
                const eased = 1 - Math.pow(1 - progress, 4);
                const current = target * eased;
                
                if (isFloat) {
                    element.textContent = current.toFixed(1) + suffix;
                } else {
                    element.textContent = Math.round(current) + suffix;
                }
                
                if (progress < 1) {
                    requestAnimationFrame(update);
                } else {
                    // 确保最终值精确
                    if (isFloat) {
                        element.textContent = target.toFixed(1) + suffix;
                    } else {
                        element.textContent = target + suffix;
                    }
                }
            }
            requestAnimationFrame(update);
        }
        
        function handleChartClick() {
            if (currentSlide !== 7 || chartComplete || chartAnimating) return;
            
            if (chartGroup === 0) {
                // 显示第1组并播放动画
                chartGroup = 1;
                chartAnimating = true;
                const g1 = document.getElementById('chart-group-1');
                initChartGroup(1);
                setTimeout(() => {
                    g1.classList.add('animate');
                    setTimeout(() => { chartAnimating = false; }, 1300);
                }, 100);
            } else if (chartGroup === 1) {
                // 切换到第2组
                chartGroup = 2;
                chartAnimating = true;
                const g1 = document.getElementById('chart-group-1');
                const g2 = document.getElementById('chart-group-2');
                g1.style.opacity = '0';
                g1.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    g1.style.display = 'none';
                    g2.style.display = '';
                    g2.style.opacity = '0';
                    initChartGroup(2);
                    setTimeout(() => {
                        g2.style.opacity = '1';
                        g2.style.transition = 'opacity 0.4s ease';
                        setTimeout(() => {
                            g2.classList.add('animate');
                            // 数字计数动画
                            g2.querySelectorAll('.col-item').forEach((item, index) => {
                                const val = parseFloat(item.dataset.value);
                                const pctEl = item.querySelector('.col-pct');
                                const origText = pctEl.textContent;
                                setTimeout(() => {
                                    animateCountUp(pctEl, val, 1000, '%');
                                    // 如果是"各约16%"，动画结束后恢复
                                    if (origText.includes('各约')) {
                                        setTimeout(() => { pctEl.textContent = origText; }, 1100);
                                    }
                                }, index * 150);
                            });
                            setTimeout(() => { chartAnimating = false; }, 1500);
                        }, 100);
                    }, 50);
                }, 400);
            } else if (chartGroup === 2) {
                // 切换到第3组
                chartGroup = 3;
                chartAnimating = true;
                const g2 = document.getElementById('chart-group-2');
                const g3 = document.getElementById('chart-group-3');
                g2.style.opacity = '0';
                g2.style.transition = 'opacity 0.4s ease';
                setTimeout(() => {
                    g2.style.display = 'none';
                    g3.style.display = '';
                    g3.style.opacity = '0';
                    initChartGroup(3);
                    setTimeout(() => {
                        g3.style.opacity = '1';
                        g3.style.transition = 'opacity 0.4s ease';
                        setTimeout(() => {
                            g3.classList.add('animate');
                            setTimeout(() => { chartAnimating = false; }, 1600);
                        }, 100);
                    }, 50);
                }, 400);
            } else if (chartGroup === 3) {
                // 全部完成
                chartComplete = true;
                document.getElementById('chart-nav-hint').textContent = ' ';
            }
        }
        
        // 研究方法页泡泡动画状态
        let bubbleStep = 0; // 0=未开始, 1=大泡泡出现, 2=4小泡泡, 3=便利贴
        let bubbleComplete = false;
        
        function handleBubbleClick() {
            if (currentSlide !== 6 || bubbleComplete) return;
            
            const mainBubble = document.getElementById('main-bubble');
            const smallBubbles = document.getElementById('small-bubbles');
            const stickyNotes = document.getElementById('sticky-notes');
            
            if (bubbleStep === 0) {
                // 第一次点击：大泡泡冒出 + 装饰泡泡显示
                bubbleStep = 1;
                mainBubble.classList.add('show');
                // 延迟显示装饰泡泡
                document.querySelectorAll('.deco-bubble').forEach((b, i) => {
                    setTimeout(() => { b.classList.add('visible'); }, i * 200);
                });
            } else if (bubbleStep === 1) {
                // 第二次点击：大泡泡淡出，4个小泡泡淡入
                bubbleStep = 2;
                mainBubble.classList.remove('show');
                mainBubble.classList.add('pop');
                setTimeout(() => {
                    mainBubble.style.display = 'none';
                    smallBubbles.classList.add('show');
                }, 500);
            } else if (bubbleStep === 2) {
                // 第三次点击：小泡泡淡出，便利贴淡入
                bubbleStep = 3;
                bubbleComplete = true;
                smallBubbles.classList.add('fade-out');
                setTimeout(() => {
                    smallBubbles.classList.remove('show');
                    stickyNotes.classList.add('show');
                }, 400);
            }
        }
        
        function handleQuestionClick() {
            if (currentSlide !== 5 || qComplete) return;
            
            const mainQ = document.getElementById('main-question');
            const subQ = document.getElementById('sub-questions');
            
            if (qStep === 0) {
                // 主问题掉落
                qStep = 1;
                mainQ.classList.add('drop');
            } else if (qStep === 1) {
                // 主问题分裂，子问题出现
                qStep = 2;
                qComplete = true;
                mainQ.classList.remove('drop');
                mainQ.classList.add('split');
                setTimeout(() => {
                    subQ.classList.add('show');
                }, 300);
            }
        }
        function handleBgClick() {
            if (currentSlide !== 3 || bgComplete || bgAnimating) return;
            
            bgClickCount++;
            const card = document.getElementById('bg-' + bgClickCount);
            const prevCard = document.getElementById('bg-' + (bgClickCount - 1));
            
            if (card) {
                bgAnimating = true;
                
                // 撞飞上一个卡片（SO那一下更猛）
                if (prevCard) {
                    if (bgClickCount === 5) {
                        prevCard.classList.remove('active');
                        prevCard.classList.add('crashed-hard');
                    } else {
                        prevCard.classList.remove('active');
                        prevCard.classList.add('crashed');
                    }
                }
                
                // 新卡片从右侧撞入
                setTimeout(() => {
                    card.classList.add('active');
                    bgAnimating = false;
                }, bgClickCount === 5 ? 150 : 250);
            }
            
            if (bgClickCount >= 7) {
                bgComplete = true;
            }
        }
        
        function isAnimationComplete() {
            // 第1页：打字效果完成
            if (currentSlide === 1) {
                return typingStarted && document.getElementById('typing-cursor').style.display === 'none';
            }
            // 第2页：目录卡片全部展示
            if (currentSlide === 2) {
                return tocComplete;
            }
            // 第3页：研究背景卡片全部展示
            if (currentSlide === 3) {
                return bgComplete;
            }
            // 第4页：翻书完成
            if (currentSlide === 4) {
                return bookComplete;
            }
            // 第5页：研究问题动画完成
            if (currentSlide === 5) {
                return qComplete;
            }
            // 第6页：研究方法泡泡动画完成
            if (currentSlide === 6) {
                return bubbleComplete;
            }
            // 第7页：结果分析图表完成
            if (currentSlide === 7) {
                return chartComplete;
            }
            // 第8页：结果讨论完成
            if (currentSlide === 8) {
                return discussComplete;
            }
            // 第9页：研究结论卷轴完成
            if (currentSlide === 9) {
                return scrollComplete;
            }
            // 第10页：反思与展望完成
            if (currentSlide === 10) {
                return wideComplete;
            }
            // 其他页面：默认完成
            return true;
        }
        
        function nextSlide() { 
            if (!isAnimationComplete()) return; // 动画没完成禁止翻页
            if (currentSlide < slideElements.length - 1) goToSlide(currentSlide + 1); 
        }
        function prevSlide() { 
            if (!isAnimationComplete()) return; // 动画没完成禁止翻页
            if (currentSlide > 0) goToSlide(currentSlide - 1); 
        }
        
        function updateUI() {
            document.getElementById('progressBar').style.width = ((currentSlide + 1) / slideElements.length * 100) + '%';
            
            // 更新侧边栏当前页高亮
            document.querySelectorAll('.page-sidebar-item').forEach((item, index) => {
                item.classList.toggle('active', index === currentSlide);
            });
            
            // 当切换到第2页时触发打字效果
            if (currentSlide === 1) {
                startTypingEffect();
            }
            
            // 当切换到第5页时初始化翻书内容
            if (currentSlide === 4 && !bookComplete) {
                renderBookPage();
            }
            
            // 当切换到第9页(研究结论)时重置卷轴
            if (currentSlide === 9) {
                scrollStep = 0;
                scrollComplete = false;
                document.querySelectorAll('.scroll-wrapper').forEach(s => s.classList.remove('unfolded'));
            }
            
            // 当切换到第11页(答辩)时自动播放
            if (currentSlide === 11) {
                defendStep = 0;
                defendComplete = false;
                const card1 = document.getElementById('defend-card-1');
                const card2 = document.getElementById('defend-card-2');
                if (card1) { card1.style.opacity = '0'; card1.style.transform = 'scale(0.8)'; }
                if (card2) { card2.style.opacity = '0'; card2.style.transform = 'scale(0.8)'; }
                // 自动播放第一张
                setTimeout(() => {
                    if (currentSlide === 11) {
                        card1.style.opacity = '1';
                        card1.style.transform = 'scale(1)';
                        defendStep = 1;
                        // 自动播放第二张
                        setTimeout(() => {
                            if (currentSlide === 11) {
                                card2.style.opacity = '1';
                                card2.style.transform = 'scale(1)';
                                defendStep = 2;
                                defendComplete = true;
                            }
                        }, 600);
                    }
                }, 600);
            }
        }
        
        // 目录页点击展开动画
        let tocClickCount = 0;
        let tocComplete = false;
        
        // 翻书效果数据
        const bookPages = [
            { // 第1-2页：理论基础
                left: { chapterEn: 'Chapter 1', chapter: '理论基础', content: '<div class="book-theory"><h3>① 生物节律理论</h3><p><span class="book-underline">生命活动呈周期性波动</span>，早晨记忆力较强，上午9—11点顶峰。</p></div><div class="book-theory"><h3>② 学习疲劳理论</h3><p>高强度排课加重<span class="book-underline">倦怠</span>，导致注意力下降。</p></div>' },
                right: { content: '<div class="book-theory"><h3>③ 脑部分区功能理论</h3><p>单一脑区长期激活产生<span class="book-underline">神经疲劳</span>，需顺应脑分区规律。</p></div><div class="book-theory"><h3>④ 认知负荷理论</h3><p><span class="book-underline">工作记忆容量有限</span>，同类学科连排易超载。</p></div><div class="book-theory"><h3>⑤ 学习迁移理论</h3><p>内容相似科目相邻易产生<span class="book-underline">负迁移</span>，需文理交替。</p></div>', pageNum: 2 }
            },
            { // 第3-4页：前人研究
                left: { chapterEn: 'Chapter 2', chapter: '前人研究', content: '<div class="book-theory"><h3>泰勒（1949）</h3><p>提出<span class="book-underline">课程优化四大核心问题</span>：学校应力求达到何种教育目标？提供何种教育经验？如何有效组织这些经验？如何确定目标是否达成？</p></div>' },
                right: { content: '<div class="book-theory"><h3>林崇德（2016）</h3><p>提出<span class="book-underline">宏观-中观-微观路径</span>，为课程设计提供系统框架。</p></div>', pageNum: 4 }
            },
            { // 第5-6页：研究空白
                left: { chapterEn: 'Chapter 3', chapter: '研究空白', content: '<div class="book-theory"><p>那么，我们可以发现，现在这方面研究最大的空白，是<span class="book-underline">没有一个针对中学生，尤其是大规模中学的量化研究</span>。</p></div>' },
                right: { content: '<div class="book-theory"><p>于是我们打算以<span class="book-underline">深圳中学</span>为例，去深入研究这一个问题，<span class="book-underline">填补这方面的空白</span>。</p></div>', pageNum: 6 }
            },
            { // 第7-8页：参考文献
                left: { chapterEn: 'Chapter 4', chapter: '参考文献', content: '<div class="book-theory" style="font-size: 18px; line-height: 1.8;"><p>[1] 丛皓，郭菲，陈祉妍.青少年昼夜偏好类型及其与睡眠质量关系[J].中国公共卫生，2019,35(10):1400-1403.</p><p>[2] 靳铭，曾练平，曾小叶.高中生正念与学习倦怠[J].心理与行为研究，2022,20(04):542-549.</p><p>[3] 周加仙.教育神经科学[J].华东师范大学学报，2013,31(02):42-48.</p></div>' },
                right: { content: '<div class="book-theory" style="font-size: 18px; line-height: 1.8;"><p>[4] 庞维国.认知负荷理论及其教学涵义[J].当代教育科学，2011(12):23-28.</p><p>[5] 姚梅林.学习迁移研究的新进展[J].北京师范大学学报，1994(05):99-104.</p><p>[6] TYLER R W. Basic Principles of Curriculum and Instruction[M].Chicago: The University of Chicago Press, 1949.</p><p>[7] 林崇德.21世纪学生发展核心素养研究[M].北京：北京师范大学出版社，2016.</p></div>', pageNum: 8 }
            }
        ];
        let bookPageIndex = 0;
        let bookComplete = false;
        
        function renderBookPage() {
            const page = bookPages[bookPageIndex];
            const leftContent = document.getElementById('book-left-content');
            const rightContent = document.getElementById('book-right-content');
            const leftNum = document.getElementById('book-left-num');
            const rightNum = document.getElementById('book-right-num');
            const leftChapter = document.getElementById('book-left-chapter');
            const leftChapterEn = document.getElementById('book-left-chapter-en');
            
            leftChapterEn.textContent = page.left.chapterEn || '';
            leftChapter.textContent = page.left.chapter;
            leftContent.innerHTML = page.left.content;
            rightContent.innerHTML = page.right.content;
            leftNum.textContent = page.right.pageNum - 1;
            rightNum.textContent = page.right.pageNum;
            
            if (bookPageIndex >= bookPages.length - 1) {
                bookComplete = true;
                document.getElementById('book-nav-hint').textContent = ' ';
            }
        }
        
        function handleBookClick() {
            if (currentSlide !== 4 || bookComplete) return;
            
            const rightPage = document.getElementById('book-right');
            
            // 书籍翻页：旧页翻出 → 新页翻入
            rightPage.classList.add('page-flip-out');
            
            setTimeout(() => {
                bookPageIndex++;
                renderBookPage();
                rightPage.classList.remove('page-flip-out');
                rightPage.classList.add('page-flip-in');
                
                setTimeout(() => {
                    rightPage.classList.remove('page-flip-in');
                }, 600);
            }, 600);
        }
        function handleTocClick() {
            if (currentSlide !== 2 || tocComplete) return;
            
            tocClickCount++;
            const item = document.getElementById('toc-' + tocClickCount);
            if (item) {
                item.classList.add('show');
            }
            if (tocClickCount >= 6) {
                tocComplete = true;
            }
        }
        
        // 打字效果
        let typingStarted = false;
        function startTypingEffect() {
            if (typingStarted) return;
            typingStarted = true;
            
            const textEl = document.getElementById('typing-text');
            const cursorEl = document.getElementById('typing-cursor');
            const infoEl = document.getElementById('slide-info');
            const membersEl = document.getElementById('slide-members');
            const fullText = '深圳中学课程安排现状及优化建议';
            const pauseIndex = 4; // "深圳中学"后面暂停
            
            let charIndex = 0;
            let isPaused = false;
            
            function typeNextChar() {
                if (charIndex < fullText.length) {
                    textEl.textContent += fullText[charIndex];
                    charIndex++;
                    
                    // 在"深圳中学"后面暂停
                    if (charIndex === pauseIndex && !isPaused) {
                        isPaused = true;
                        setTimeout(() => {
                            isPaused = false;
                            typeNextChar();
                        }, 800); // 停顿800ms
                    } else {
                        setTimeout(typeNextChar, 150); // 每个字150ms
                    }
                } else {
                    // 打字完成，隐藏光标
                    cursorEl.style.display = 'none';
                    
                    // 滑入组名和成员信息
                    setTimeout(() => {
                        infoEl.style.opacity = '1';
                        infoEl.style.transform = 'translateX(0)';
                    }, 300);
                    
                    setTimeout(() => {
                        membersEl.style.opacity = '1';
                        membersEl.style.transform = 'translateX(0)';
                    }, 600);
                }
            }
            
            // 开始打字
            setTimeout(typeNextChar, 500);
        }