import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { sampleBotResponses } from '../data/initialData';
import { 
  Bot, 
  Send, 
  User, 
  AlertTriangle, 
  Sparkles, 
  Trash2, 
  HelpCircle, 
  CheckCircle2, 
  PhoneCall,
  ShieldAlert,
  CheckSquare,
  Square
} from 'lucide-react';

export default function SafeBotPage() {
  const { triggerSos, setCurrentPage, t } = useApp();

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello! I am Nivarya SafeBot, your 24/7 proactive personal safety advisor. I can assist with late-night transit guidelines, de-escalation strategies, emergency prep, or legal rights in India. How can I support your safety today?",
      checklist: null,
      time: 'Just now'
    }
  ]);

  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checkedItems, setCheckedItems] = useState({});
  const chatBottomRef = useRef(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const promptSuggestions = [
    "Late-Night Cab Safety Checklist",
    "What should I do if I suspect I'm being followed?",
    "What are my legal safety rights in India (Zero FIR)?",
    "Hostel & Curfew Safe Return Guidelines",
    "How does Nivarya Safe Journey tracking work?"
  ];

  const toggleChecklistItem = (itemKey) => {
    setCheckedItems(prev => ({ ...prev, [itemKey]: !prev[itemKey] }));
  };

  const handleSend = (textToSend) => {
    const query = (textToSend || inputVal).trim();
    if (!query) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = {
        id: Date.now() + 1,
        sender: 'bot',
        text: '',
        checklist: null,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      const lower = query.toLowerCase();

      if (lower.includes('cab') || lower.includes('taxi') || lower.includes('travel') || lower.includes('alone')) {
        botReply.text = "When travelling alone or late at night, proactive prevention is your strongest defense:";
        botReply.checklist = sampleBotResponses.cab;
      } else if (lower.includes('follow') || lower.includes('unsafe') || lower.includes('stalk') || lower.includes('danger')) {
        botReply.text = "If you feel unsafe or sense you are being followed, take these immediate protective actions:";
        botReply.checklist = sampleBotResponses.followed;
      } else if (lower.includes('right') || lower.includes('fir') || lower.includes('police') || lower.includes('law') || lower.includes('legal')) {
        botReply.text = "Under Indian law, women have strong constitutional and legal protections:";
        botReply.checklist = sampleBotResponses.rights;
      } else if (lower.includes('hostel') || lower.includes('curfew')) {
        botReply.text = "Here are recommended protocols for late hostel and PG entry:";
        botReply.checklist = {
          title: "Hostel Late Return Protocol",
          points: [
            "Inform your hostel warden or local guardian before 8:30 PM if you anticipate travel delays.",
            "Schedule a Nivarya Safe Journey check-in set to trigger 15 minutes before your curfew.",
            "Avoid dark campus alleys; enter strictly via the CCTV-monitored North Security Pavilion.",
            "Keep the campus quick-response number saved in your trusted contacts list."
          ]
        };
      } else if (lower.includes('journey') || lower.includes('how') || lower.includes('location') || lower.includes('share')) {
        botReply.text = "To share your journey on Nivarya: Go to the 'Safe Journey' tab, input your start and destination, select your transit mode, and tap 'Launch Safe Journey'. You can share the live tracking link directly with your parents or friends on WhatsApp.";
      } else {
        botReply.text = "Here are foundational personal safety rules for everyday travel:";
        botReply.checklist = sampleBotResponses.general;
      }

      setIsTyping(false);
      setMessages(prev => [...prev, botReply]);
    }, 800);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: 1,
        sender: 'bot',
        text: "Chat cleared. I'm ready to assist with safety tips or route guidance anytime.",
        checklist: null,
        time: 'Just now'
      }
    ]);
  };

  return (
    <div className="safebot-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div className="section-header" style={{ marginBottom: '24px' }}>
        <span className="section-tag">
          <Bot size={14} />
          <span>AI Safety Advisor</span>
        </span>
        <h1 className="section-title">
          {t.safeBot.title}
        </h1>
        <p className="section-desc">
          24/7 proactive advice on late-night transit, legal rights in India, de-escalation, and journey preparedness.
        </p>
      </div>

      {/* Mandatory Emergency Disclaimer */}
      <div style={{
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.25)',
        borderRadius: '12px',
        padding: '12px 18px',
        maxWidth: '840px',
        margin: '0 auto 20px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
        fontSize: '0.82rem',
        color: '#FCA5A5'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldAlert size={18} style={{ flexShrink: 0 }} />
          <span>{t.safeBot.disclaimer}</span>
        </div>
        <button 
          className="btn btn-danger btn-sm"
          onClick={triggerSos}
          style={{ flexShrink: 0, padding: '4px 10px', fontSize: '0.75rem' }}
        >
          SOS Trigger
        </button>
      </div>

      {/* Chat Container */}
      <div className="safebot-container" style={{ borderRadius: '18px' }}>
        {/* Header */}
        <div className="chat-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(99, 102, 241, 0.5)'
            }}>
              <Bot size={22} />
            </div>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700, color: '#FFFFFF' }}>
                Nivarya SafeBot
              </div>
              <div style={{ fontSize: '0.75rem', color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className="demo-banner-dot"></span>
                <span>Active • Online Safety Assistant</span>
              </div>
            </div>
          </div>

          <button 
            className="btn btn-ghost btn-sm"
            onClick={handleClearChat}
            title="Clear Chat History"
            style={{ color: '#94A3B8' }}
          >
            <Trash2 size={16} />
            <span style={{ fontSize: '0.78rem' }}>Clear</span>
          </button>
        </div>

        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map(msg => (
            <div 
              key={msg.id} 
              className={msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-bot'}
            >
              <p style={{ color: msg.sender === 'user' ? '#FFFFFF' : '#F1F5F9', lineHeight: '1.6' }}>
                {msg.text}
              </p>

              {/* Actionable Checklist / Structured Cards with Interactive Checkboxes */}
              {msg.checklist && (
                <div style={{
                  marginTop: '14px',
                  background: 'rgba(11, 17, 32, 0.7)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '12px',
                  padding: '16px'
                }}>
                  <strong style={{ color: '#818CF8', fontSize: '0.92rem', display: 'block', marginBottom: '10px' }}>
                    📋 {msg.checklist.title}:
                  </strong>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {msg.checklist.points.map((pt, idx) => {
                      const itemKey = `${msg.id}-${idx}`;
                      const isChecked = !!checkedItems[itemKey];

                      return (
                        <div 
                          key={idx} 
                          onClick={() => toggleChecklistItem(itemKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '10px',
                            fontSize: '0.86rem',
                            color: isChecked ? '#94A3B8' : '#CBD5E1',
                            textDecoration: isChecked ? 'line-through' : 'none',
                            cursor: 'pointer'
                          }}
                        >
                          <div style={{ color: isChecked ? '#10B981' : '#6366F1', marginTop: '2px', flexShrink: 0 }}>
                            {isChecked ? <CheckSquare size={16} /> : <Square size={16} />}
                          </div>
                          <span>{pt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{
                fontSize: '0.7rem',
                color: msg.sender === 'user' ? '#C7D2FE' : '#64748B',
                textAlign: 'right',
                marginTop: '6px'
              }}>
                {msg.time}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-bubble-bot" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '12px 18px' }}>
              <span className="demo-banner-dot"></span>
              <span style={{ fontSize: '0.82rem', color: '#94A3B8' }}>SafeBot is evaluating safety protocols...</span>
            </div>
          )}

          <div ref={chatBottomRef}></div>
        </div>

        {/* Prompt Suggestion Chips */}
        <div className="prompt-suggestions-row">
          {promptSuggestions.map((prompt, idx) => (
            <button
              key={idx}
              className="prompt-chip"
              onClick={() => handleSend(prompt)}
            >
              <Sparkles size={12} color="#818CF8" style={{ display: 'inline', marginRight: '4px' }} />
              <span>{prompt}</span>
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form 
          className="chat-input-row"
          onSubmit={(e) => { e.preventDefault(); handleSend(); }}
        >
          <input 
            type="text"
            className="input-field"
            placeholder={t.safeBot.inputPlaceholder}
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            style={{ borderRadius: '10px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ padding: '0 20px' }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
