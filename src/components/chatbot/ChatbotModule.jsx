import { useState, useRef, useEffect } from 'react';
import { Send, Bot, RefreshCw, ChevronDown, Globe, Fish } from 'lucide-react';
import { AFOODS_SYSTEM_PROMPT, AFOODS_WELCOME_MESSAGES, QUICK_QUESTIONS } from '../../data/chatbotKnowledge';
import InquiryModal from './InquiryModal';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const MODEL_NAME = import.meta.env.VITE_GEMINI_MODEL || 'gemini-flash-lite-latest';

// Support multiple API keys with Round-Robin load balancing & fallback
const API_KEYS = API_KEY ? API_KEY.split(',').map(k => k.trim()).filter(Boolean) : [];

let currentKeyIndex = (() => {
  try {
    const saved = sessionStorage.getItem('afoods_key_idx');
    return saved ? parseInt(saved, 10) || 0 : 0;
  } catch {
    return 0;
  }
})();

function getRotatedApiKeys() {
  if (API_KEYS.length <= 1) return API_KEYS;
  const startIdx = currentKeyIndex % API_KEYS.length;
  // Advance pointer for the next message
  currentKeyIndex = (startIdx + 1) % API_KEYS.length;
  try {
    sessionStorage.setItem('afoods_key_idx', currentKeyIndex);
  } catch {}

  // Active key is placed first, others follow as instant fallbacks
  return [
    ...API_KEYS.slice(startIdx),
    ...API_KEYS.slice(0, startIdx)
  ];
}

function parseMarkdown(text) {
  if (!text) return '';
  let html = text;

  // 1. Markdown Links [text](url) -> Clickable anchor with modern styling
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline font-semibold transition-colors inline-flex items-center gap-1">$1 ↗</a>'
  );

  // 2. Bold and Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em class="italic text-slate-300">$1</em>');
  html = html.replace(/`([^`]+)`/g, '<code class="px-1.5 py-0.5 rounded bg-slate-800 text-teal-300 text-xs font-mono">$1</code>');

  // 3. Headings
  html = html.replace(/^### (.*$)/gim, '<h3 class="font-bold text-teal-400 text-sm mt-3 mb-1">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 class="font-bold text-teal-300 text-base mt-3 mb-1.5">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 class="font-extrabold text-white text-lg mt-3 mb-2">$1</h1>');

  // 4. Bullet lists: clean flex layout, avoids redundant double bullet points
  html = html.replace(/^[-*]\s+(.*$)/gim, '<div class="flex items-start gap-2 my-1 text-slate-200 pl-1"><span class="text-teal-400 select-none mt-0.5 font-bold">▸</span><div class="flex-1 leading-relaxed">$1</div></div>');

  // 5. Numbered lists
  html = html.replace(/^(\d+)\.\s+(.*$)/gim, '<div class="flex items-start gap-2 my-1 text-slate-200 pl-1"><span class="text-teal-400 font-mono font-bold text-xs mt-0.5 select-none">$1.</span><div class="flex-1 leading-relaxed">$2</div></div>');

  // 6. Email addresses
  html = html.replace(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g, '<a href="mailto:$1" class="text-teal-400 hover:text-teal-300 underline font-medium">$1</a>');

  // 7. Spacing and line breaks
  html = html.replace(/\n\n/g, '<div class="h-2"></div>');
  html = html.replace(/\n/g, '<br/>');

  return html;
}

function getLocalFallbackResponse(query) {
  const q = query.toLowerCase();
  if (q.includes('chứng chỉ') || q.includes('certif') || q.includes('dl 422') || q.includes('dh 323') || q.includes('haccp') || q.includes('iso') || q.includes('fda') || q.includes('brc') || q.includes('halal') || q.includes('asc') || q.includes('msc')) {
    return `🏆 **Chứng Chỉ & Tiêu Chuẩn Quốc Tế Của AFOODS (afoods.vn):**\n\n- **EU Approval No.: DL 422 & DH 323**: Đạt chuẩn xuất khẩu thủy hải sản vào toàn bộ 27 quốc gia Liên minh Châu Âu (EU).\n- **ISO 22000:2018 & ISO 9001:2015**: Hệ thống quản lý an toàn thực phẩm & chất lượng chuẩn quốc tế.\n- **BRC Global Standard**: Tiêu chuẩn Hiệp hội Bán lẻ Anh Quốc (Grade A).\n- **HACCP**: Hệ thống phân tích mối nguy và kiểm soát điểm tới hạn nghiêm ngặt.\n- **HALAL Food Council S.E. Asia**: Chứng nhận Halal cho thị trường Malaysia & Trung Đông.\n- **ASC & MSC**: Chứng nhận Nuôi trồng & Khai thác Thủy sản Bền vững.\n- **FDA (USA)**: Đăng ký Cục Quản lý Thực phẩm & Dược phẩm Hoa Kỳ.\n\nQuý khách có thể yêu cầu gửi bản sao chứng chỉ kèm báo giá chính thức! 🌊`;
  }
  if (q.includes('khoai tây') || q.includes('potato') || q.includes('tôm cuộn')) {
    return `🥔 **Potato Wrapped PTO Shrimp (Tôm Cuộn Khoai Tây AFOODS):**\n\n- **Đặc điểm**: Món ăn signature xuất khẩu hàng đầu của AFOODS. Tôm nguyên con tươi bóc vỏ để đuôi (PTO), được cuộn tỉ mỉ bằng sợi khoai tây tự nhiên.\n- **Cách dùng**: Chiên ngập dầu ở 170°C - 175°C trong 3-4 phút, lớp khoai tây giòn rụm vàng ươm, thịt tôm bên trong mọng nước ngọt tự nhiên.\n- **Thị trường**: Nhật Bản, Hàn Quốc, EU, Mỹ, chuỗi nhà hàng & siêu thị cao cấp.\n\nNhấn nút **"Gửi Yêu Cầu"** phía trên để nhận báo giá FOB/CIF cho sản phẩm này! 📦`;
  }
  if (q.includes('sushi') || q.includes('neta') || q.includes('tsubu') || q.includes('harasu') || q.includes('akaika')) {
    return `🍣 **Dây Chuyền Chế Biến Sushi Neta AFOODS (Hợp tác Nhật Bản):**\n\n1. **Tsubu-gai (Ốc Biển Neta):** Ốc neta giòn ngọt, chế biến theo bí quyết truyền thống Nhật Bản.\n2. **Harasu (Lườn Cá Hồi Neta):** Lườn cá hồi béo ngậy, cắt lát đồng đều chuẩn sashimi.\n3. **AkaIka (Mực Đỏ Neta):** Mực đỏ giòn dai, cắt lát khía hoa tinh tế.\n\n- Toàn bộ dòng Sushi Neta được đối tác Nhật Bản cung cấp nguyên liệu và kiểm soát chất lượng nghiêm ngặt, cấp đông IQF giữ trọn vị tươi sống.\n\nQuý đối tác vui lòng nhấn **"Gửi Yêu Cầu"** để nhận catalog chi tiết! 🤝`;
  }
  if (q.includes('gtgt') || q.includes('dimsum') || q.includes('há cảo') || q.includes('hargao') || q.includes('farci') || q.includes('chả giò') || q.includes('springroll') || q.includes('chạo tôm') || q.includes('wonton') || q.includes('xíu mại')) {
    return `🥟 **Sản Phẩm Giá Trị Gia Tăng (Value Added Products) AFOODS:**\n\n- **Potato Wrapped PTO Shrimp**: Tôm cuộn khoai tây giòn rụm.\n- **Money Bag Hargao**: Há cảo túi tiền may mắn nhân tôm tươi.\n- **Mixed Dimsum**: Khay dimsum tổng hợp cao cấp xuất khẩu.\n- **Collique Scallop Farci & Crab Farci**: Sò điệp và cua nhồi sốt đút lò.\n- **Springroll (Chả giò)**: Chả giò hải sản, chả giò tôm rế.\n- **Shrimp Paste (Chạo tôm)**: Chạo tôm quấn mía truyền thống.\n- **Wonton & Shaomai**: Hoành thánh và xíu mại tôm thịt.\n- **Breaded Products**: Tôm tẩm bột chiên xù, cá tẩm bột.\n\nĐạt chuẩn xuất khẩu sang Nhật, Hàn, EU, Mỹ & Úc! 📦`;
  }
  if (q.includes('tôm') || q.includes('shrimp') || q.includes('black tiger') || q.includes('vannamei')) {
    return `🦐 **Danh Mục Tôm Đông Lạnh Xuất Khẩu AFOODS:**\n\n- **Chủng loại**: Tôm Sú (Black Tiger Shrimp), Tôm Thẻ Chân Trắng (Vannamei Shrimp).\n- **Quy cách**: HOSO (nguyên con), HLSO (không đầu), PD (bóc vỏ bỏ chỉ), PUD, PDTO.\n- **Kích cỡ (Count/lb)**: 4/6, 6/8, 8/12, 13/15, 16/20, 21/25, 26/30, 31/40, 41/50.\n- **Cấp đông**: Cấp đông nhanh IQF hoặc Block, mạ băng 10% - 20% theo yêu cầu.\n- **Đóng gói**: Thùng master 10kg/20kg (túi chân không hoặc PE).\n\nNhấn nút **"Gửi Yêu Cầu"** để nhận báo giá FOB Cảng TP.HCM / Cái Mép mới nhất! 🌊`;
  }
  if (q.includes('cá') || q.includes('fish') || q.includes('basa') || q.includes('pangasius')) {
    return `🐟 **Cá Đông Lạnh Xuất Khẩu AFOODS:**\n\n- **Chủng loại**: Cá Tra/Basa (Pangasius), Cá Thu (Mackerel), Cá Hồng (Snapper), Cá Chim (Pomfret), Cá Rô phi (Tilapia).\n- **Quy cách**: Fillet thịt trắng, Cắt khoanh (Steak), Nguyên con làm sạch (G&G), HGT.\n- **Tiêu chuẩn xuất khẩu**: EU Approval DL 422, HACCP, FDA, ASC/MSC.\n\nVui lòng nhấn **"Gửi Yêu Cầu"** để nhận thông số kỹ thuật chi tiết!`;
  }
  if (q.includes('mực') || q.includes('squid')) {
    return `🦑 **Mực Đông Lạnh Xuất Khẩu AFOODS:**\n\n- **Chủng loại**: Mực ống (Loligo), Mực nang (Cuttlefish), Mực lá.\n- **Quy cách**: Mực nguyên con làm sạch, Cắt khoanh (Rings), Cắt ống (Tubes), Râu mực (Tentacles).\n- **Cấp đông**: IQF nhanh, bảo toàn hương vị tươi giòn tự nhiên.`;
  }
  if (q.includes('liên hệ') || q.includes('contact') || q.includes('địa chỉ') || q.includes('email') || q.includes('sđt') || q.includes('phone') || q.includes('nhà máy') || q.includes('ở đâu')) {
    return `🏢 **Thông Tin Liên Hệ Công Ty CP XNK Thực Phẩm Á Châu (AFOODS):**\n\n- **Tên giao dịch**: Asia Foods Import Export Corporation (AFOODS)\n- **Slogan**: *"Good food, good health"*\n- **Nhà máy & Trụ sở**: Ấp Đông Hoà, Xã Kim Sơn, Tỉnh Đồng Tháp (Ven sông Tiền, cách TP.HCM 75km)\n- **Quy mô**: Diện tích 40,000 m², nhà xưởng 9,000 m², hơn 900 cán bộ công nhân viên, 4 kho lạnh sức chứa ~2,380 tấn\n- **Mã xuất khẩu EU**: DL 422 & DH 323\n- **Điện thoại**: (+84) 0273 361 1994 / (+84) 0273 361 1992\n- **Fax**: (+84) 0273 361 1997\n- **Email**: info@afoods.vn / huutho@afoods.vn / nguyettruong@icloud.com\n- **Website chính thức**: https://afoods.vn\n\nAFOODS luôn sẵn sàng tiếp đón và hợp tác cùng Quý đối tác toàn cầu! 🤝`;
  }
  if (q.includes('moq') || q.includes('đặt hàng') || q.includes('order') || q.includes('thanh toán') || q.includes('giá') || q.includes('price')) {
    return `📦 **Điều Kiện Đặt Hàng & Thanh Toán Quốc Tế:**\n\n- **MOQ (Số lượng tối thiểu)**: 1 container 20ft (~20-25 tấn) hoặc 1 container 40ft (24-26 tấn tôm, 20-22 tấn cá).\n- **Điều kiện giao hàng**: FOB Cảng TP.HCM / Cái Mép, CFR, CIF toàn cầu.\n- **Phương thức thanh toán**: T/T (30% đặt cọc, 70% sau khi nhận copy Vận đơn B/L) hoặc L/C at sight không hủy ngang.\n- **Thời gian chuẩn bị**: 2 - 4 tuần sau khi ký hợp đồng và cọc.\n\nNhấn nút **"Gửi Yêu Cầu"** phía trên để nhận báo giá FOB/CIF tốt nhất cho lô hàng của bạn! 📋`;
  }
  return `🌊 **AFOODS hân hạnh phục vụ Quý đối tác!**\n\n*"Good food, good health"* — AFOODS chuyên chế biến & xuất khẩu thủy sản cao cấp đạt mã **EU DL 422 & DH 323**, BRC, ISO 22000, HACCP, HALAL, ASC/MSC, FDA:\n\n- 🥔 **Sản phẩm GTGT**: Tôm cuộn khoai tây (Potato Wrapped PTO Shrimp), Há cảo túi tiền (Money Bag Hargao), Sò điệp Farci, Chả giò, Chạo tôm\n- 🍣 **Sushi Neta Nhật Bản**: Tsubu-gai (ốc biển), Harasu (lườn cá hồi), AkaIka (mực đỏ)\n- 🦐 **Tôm đông lạnh**: Tôm Sú, Tôm Thẻ (IQF/Block)\n- 🐟 **Cá & Mực đông lạnh**: Cá Tra/Basa, Cá Biển, Mực ống & nang\n\nQuý khách vui lòng cho biết nhu cầu hoặc nhấn **"Gửi Yêu Cầu"** để nhận báo giá chi tiết! 😊`;
}

async function callGemini(apiKey, modelName, contents, timeoutMs = 22000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: AFOODS_SYSTEM_PROMPT }]
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1024
        }
      })
    });
    clearTimeout(timer);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    const data = await res.json();
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    if (!text) throw new Error('Empty response');
    return text;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

export default function ChatbotModule({ onInquirySubmit }) {
  const [messages, setMessages] = useState(AFOODS_WELCOME_MESSAGES);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showInquiry, setShowInquiry] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleScroll = () => {
    if (!messagesContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
    setShowScrollBtn(scrollHeight - scrollTop - clientHeight > 100);
  };

  const sendMessage = async (text) => {
    if (!text.trim() || isLoading) return;

    const userMsg = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const formattedHistory = [
      ...chatHistory.slice(-6).map(h => ({
        role: h.role === 'model' ? 'model' : 'user',
        parts: [{ text: h.content || h.parts?.[0]?.text || '' }]
      })),
      {
        role: 'user',
        parts: [{ text }]
      }
    ];

    let aiText = null;

    if (API_KEYS.length > 0) {
      // 1. Try gemini-3.1-flash-lite first (verified 6-10s response time, zero queue latency)
      // 2. Fall back to configured MODEL_NAME and gemini-3.5-flash
      const modelsToTry = [
        'gemini-3.1-flash-lite',
        MODEL_NAME,
        'gemini-3.5-flash'
      ].filter((v, i, a) => a.indexOf(v) === i);

      const rotatedKeys = getRotatedApiKeys();

      for (const model of modelsToTry) {
        if (aiText) break;
        for (const key of rotatedKeys) {
          try {
            aiText = await callGemini(key, model, formattedHistory, 20000);
            if (aiText) {
              const keyNum = API_KEYS.indexOf(key) + 1;
              console.log(`[Gemini] ✅ Succeeded with Model: ${model} | API Key #${keyNum}`);
              break;
            }
          } catch (err) {
            const keyNum = API_KEYS.indexOf(key) + 1;
            console.warn(`[Gemini] ⚠️ ${model} with Key #${keyNum} failed (${err.message}), trying next...`);
          }
        }
      }
    }

    // If all remote attempts fail or no keys, provide local knowledge base answer
    if (!aiText) {
      aiText = getLocalFallbackResponse(text);
    }

    setMessages(prev => [...prev, { role: 'model', content: aiText }]);
    setChatHistory(prev => [
      ...prev,
      { role: 'user', parts: [{ text }] },
      { role: 'model', parts: [{ text: aiText }] },
    ]);

    // Detect inquiry intent
    const inquiryKeywords = ['order', 'buy', 'purchase', 'price', 'quote', 'inquiry', 'mua', 'đặt hàng', 'báo giá', 'liên hệ', 'quy cách', 'báo giá tôm', 'báo giá cá'];
    const hasInquiryIntent = inquiryKeywords.some(kw => text.toLowerCase().includes(kw));
    if (hasInquiryIntent) {
      setTimeout(() => setShowInquiry(true), 1500);
    }

    setIsLoading(false);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleReset = () => {
    setMessages(AFOODS_WELCOME_MESSAGES);
    setChatHistory([]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] sm:h-[calc(100vh-64px)] max-w-4xl mx-auto w-full">
      {/* Chat Header */}
      <div className="glass-dark border-b border-slate-700/30 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src="/avatar-chatbot.jpg"
                alt="AFOODS AI Assistant"
                className="w-10 h-10 rounded-xl object-cover border border-teal-500/30 shadow-md"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900 animate-pulse-slow" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-white text-sm sm:text-base">AFOODS AI Assistant</h2>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Globe size={11} />
                <span>Hỗ trợ đa ngôn ngữ · 24/7 Online</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowInquiry(true)}
              className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-orange-500/25 to-amber-500/25 hover:from-orange-500/35 hover:to-amber-500/35 text-orange-300 border border-orange-500/40 px-2.5 py-1.5 rounded-lg transition-all duration-200 shadow-sm"
              title="Gửi yêu cầu báo giá chính thức"
            >
              <Fish size={13} className="text-orange-400" />
              <span>Gửi Yêu Cầu</span>
            </button>
            <button
              onClick={handleReset}
              className="p-2 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all duration-200"
              title="Cuộc trò chuyện mới"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-4 scroll-container"
      >
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex gap-2 sm:gap-3 animate-fade-in ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0 mt-1">
              {msg.role === 'user' ? (
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xs font-bold">
                  U
                </div>
              ) : (
                <img
                  src="/avatar-chatbot.jpg"
                  alt="AFOODS AI"
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover border border-teal-500/30 shadow-sm"
                />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[82%] sm:max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
              <div
                className={`px-3 sm:px-4 py-2.5 sm:py-3 text-sm leading-relaxed ${
                  msg.role === 'user' ? 'chat-bubble-user text-white' : 'chat-bubble-ai text-slate-200'
                }`}
              >
                {msg.role === 'model' ? (
                  <div
                    className="markdown-content"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(msg.content) }}
                  />
                ) : (
                  <span>{msg.content}</span>
                )}
              </div>
              <span className="text-[10px] text-slate-600 px-1">
                {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex gap-3 animate-fade-in">
            <img
              src="/avatar-chatbot.jpg"
              alt="AFOODS AI"
              className="w-8 h-8 rounded-full object-cover border border-teal-500/30 flex-shrink-0 mt-1 shadow-sm"
            />
            <div className="chat-bubble-ai px-4 py-3">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Scroll to bottom button */}
      {showScrollBtn && (
        <button
          onClick={scrollToBottom}
          className="absolute bottom-24 right-4 w-8 h-8 rounded-full glass border border-slate-600 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-all shadow-lg animate-bounce-slow"
        >
          <ChevronDown size={16} />
        </button>
      )}

      {/* Quick Questions */}
      <div className="px-3 sm:px-4 py-2 border-t border-slate-700/30">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setShowInquiry(true)}
            className="flex-shrink-0 text-xs font-semibold bg-gradient-to-r from-orange-500/25 to-amber-500/25 hover:from-orange-500/35 hover:to-amber-500/35 border border-orange-500/40 text-orange-300 px-3 py-1.5 rounded-full transition-all whitespace-nowrap shadow-sm flex items-center gap-1"
          >
            📋 Gửi Yêu Cầu Báo Giá
          </button>
          {QUICK_QUESTIONS.map((q, i) => (
            <button
              key={i}
              onClick={() => sendMessage(q.text)}
              disabled={isLoading}
              className="flex-shrink-0 text-xs bg-slate-800/80 hover:bg-teal-500/20 border border-slate-700 hover:border-teal-500/40 text-slate-300 hover:text-teal-300 px-3 py-1.5 rounded-full transition-all duration-200 whitespace-nowrap disabled:opacity-50"
            >
              {q.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="glass-dark border-t border-slate-700/30 px-3 sm:px-4 py-3">
        <div className="flex items-end gap-2 sm:gap-3">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Nhập câu hỏi... (English, Tiếng Việt, 日本語, 中文...)"
            rows={1}
            disabled={isLoading}
            className="flex-1 input-field resize-none min-h-[44px] max-h-32 text-sm py-2.5 overflow-hidden"
            style={{ height: 'auto' }}
            onInput={(e) => {
              e.target.style.height = 'auto';
              e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={!input.trim() || isLoading}
            className="flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
            style={{ boxShadow: '0 4px 15px rgba(13,148,136,0.4)' }}
          >
            <Send size={16} />
          </button>
        </div>
        <div className="text-center text-[10px] text-slate-500 mt-2">
          Powered by Tran Hoang Sang 0888.003.205 · Asia Foods Import Export Corp (AFOODS © Since 2005) · <a href="https://afoods.vn" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">afoods.vn</a>
        </div>
      </div>

      {/* Inquiry Modal */}
      {showInquiry && (
        <InquiryModal
          onClose={() => setShowInquiry(false)}
          onSubmit={(data) => {
            onInquirySubmit(data);
            setShowInquiry(false);
            setMessages(prev => [...prev, {
              role: 'model',
              content: `✅ **Cảm ơn ${data.buyer_name}!**\n\nYêu cầu của bạn đã được ghi nhận thành công. Đội ngũ AFOODS sẽ liên hệ lại trong vòng **24 giờ làm việc**.\n\n📧 ${data.email}\n🏢 ${data.company} - ${data.country}\n\nNếu cần gấp, vui lòng liên hệ trực tiếp: **huutho@afoods.vn** 🌊`,
            }]);
          }}
        />
      )}
    </div>
  );
}
