/**
 * avivu — chatbot.js
 * Chatbot mô phỏng dùng chung toàn site
 */

document.addEventListener('DOMContentLoaded', () => {
  initAvivuChatbot();
});

function initAvivuChatbot() {
  if (document.querySelector('.ai-chatbot')) return;

  const basePath = window.location.pathname.includes('/pages/') ? '' : 'pages/';

  const chatbot = document.createElement('div');
  chatbot.className = 'ai-chatbot';

  chatbot.innerHTML = `
    <div class="ai-chat-panel" id="aiChatPanel">
      <div class="ai-chat-header">
        <div class="ai-chat-avatar">
          <i class="fas fa-robot"></i>
        </div>

        <div class="ai-chat-title">
          <h4>avivu AI</h4>
          <span>Trợ lý du lịch demo</span>
        </div>

        <button class="ai-chat-close" type="button" id="aiChatClose" aria-label="Đóng chatbot">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="ai-chat-body">
        <div class="ai-message">
          Xin chào! Mình là <strong>avivu AI</strong>. 
          Hiện tại mình có thể gợi ý nhanh một số loại tour phù hợp cho bạn.
        </div>

        <div class="ai-suggestions">
          <button class="ai-suggestion" type="button" data-url="${basePath}tours.html?cat=bien-dao">
            <i class="fas fa-umbrella-beach"></i>
            Tour biển đảo
          </button>

          <button class="ai-suggestion" type="button" data-url="${basePath}tours.html?cat=gia-dinh">
            <i class="fas fa-users"></i>
            Tour gia đình
          </button>

          <button class="ai-suggestion" type="button" data-url="${basePath}tours.html?price=duoi-3tr">
            <i class="fas fa-tags"></i>
            Tour dưới 3 triệu
          </button>

          <button class="ai-suggestion" type="button" data-url="${basePath}tours.html?duration=cuoi-tuan">
            <i class="fas fa-calendar-week"></i>
            Tour cuối tuần
          </button>
        </div>
      </div>

      <div class="ai-chat-footer">
        <div class="ai-input-fake">
          <span>Tính năng chat đang được phát triển...</span>
          <button type="button" aria-label="Gửi tin nhắn demo">
            <i class="fas fa-paper-plane"></i>
          </button>
        </div>
        <p class="ai-note">Demo UI cho học phần Thiết kế Web</p>
      </div>
    </div>

    <button class="ai-chat-toggle" type="button" id="aiChatToggle" aria-label="Mở chatbot">
      <i class="fas fa-comments"></i>
    </button>
  `;

  document.body.appendChild(chatbot);

  const toggle = document.getElementById('aiChatToggle');
  const close = document.getElementById('aiChatClose');

  toggle?.addEventListener('click', () => {
    chatbot.classList.toggle('open');
  });

  close?.addEventListener('click', () => {
    chatbot.classList.remove('open');
  });

  document.querySelectorAll('.ai-suggestion').forEach(button => {
    button.addEventListener('click', () => {
      const url = button.dataset.url;
      if (url) window.location.href = url;
    });
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') {
      chatbot.classList.remove('open');
    }
  });
}