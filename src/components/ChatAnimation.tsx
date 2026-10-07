import { useEffect, useState, useRef } from 'react';

const messages = [
  { text: "It's a great day at Curivanta Cuts. How can I help you today? Are you looking to book an appointment or have questions about our services?", type: 'ai' },
  { text: "Book", type: 'user' },
  { text: "Great! What date would you like to schedule your appointment for?", type: 'ai' },
  { text: "July 2", type: 'user' },
  { text: "Thanks! What type of service would you like to book? (For example: boys haircut, girls haircut, first haircut, buzz cut, bang trim, or minicure)", type: 'ai' },
  { text: "Boys cut", type: 'user' },
  { text: "Do you have a stylist preference, or should I select \"any\" available stylist for you?", type: 'ai' },
  { text: "Any", type: 'user' },
  { text: "Great! Here are the available times for July 2: 10:00 AM, 11:30 AM, 2:00 PM, 4:00 PM. Which time works best for you?", type: 'ai' },
  { text: "2:00 PM", type: 'user' },
  { text: "Thank you! Can you please provide the name for the appointment?", type: 'ai' },
  { text: "Andrea Smith", type: 'user' },
  { text: "Perfect! We have you down for July 2 at 2:00 PM for a Boys cut with any available stylist. We will send a confirmation text shortly. See you then!", type: 'ai' }
];

export const ChatAnimation = () => {
  const [visibleMessages, setVisibleMessages] = useState<number>(1);
  const [isTyping, setIsTyping] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [visibleMessages, isTyping]);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    if (visibleMessages < messages.length) {
      const nextMessage = messages[visibleMessages];
      const delay = nextMessage.type === 'user' ? 1500 : 1800;
      
      setIsTyping(nextMessage.type === 'ai');
      
      timeout = setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages(prev => prev + 1);
      }, delay);
    } else {
      timeout = setTimeout(() => {
        setVisibleMessages(1);
      }, 4000);
    }
    
    return () => clearTimeout(timeout);
  }, [visibleMessages]);

  return (
    <div className="relative mx-auto w-full max-w-[320px] h-[650px] rounded-[3rem] border-[8px] shadow-2xl overflow-hidden flex flex-col" style={{ 
      background: 'var(--ink)', 
      borderColor: 'var(--ink-soft)',
      boxShadow: '0 30px 60px -14px rgba(0,0,0,0.5)'
    }}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 rounded-b-3xl z-20" style={{ background: 'var(--ink-soft)' }}></div>
      <div className="pt-10 pb-3 px-4 flex items-center justify-between border-b z-10" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--line)' }}>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6" style={{ color: 'var(--bone-dim)' }}><path d="m15 18-6-6 6-6"></path></svg>
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ background: '#0d9488' }}>S</div>
          <span className="font-semibold text-sm" style={{ color: 'var(--bone)' }}>Curivanta Cuts</span>
        </div>
        <div className="flex items-center gap-3">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: 'var(--bone-dim)' }}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path><path d="M14.05 2a9 9 0 0 1 8 7.94"></path><path d="M14.05 6A5 5 0 0 1 18 10"></path></svg>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: 'var(--bone-dim)' }}><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
        </div>
      </div>
      
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-4 pb-20 flex flex-col scrollbar-hide" style={{ background: 'var(--ink)' }}>
        {messages.slice(0, visibleMessages).map((msg, idx) => (
          <div key={idx} style={{ 
            background: msg.type === 'ai' ? 'var(--ink-soft)' : 'var(--brass)', 
            color: msg.type === 'ai' ? 'var(--bone)' : '#ffffff',
            padding: '12px', 
            borderRadius: '16px', 
            borderTopLeftRadius: msg.type === 'ai' ? '4px' : '16px', 
            borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
            fontSize: '13px', 
            lineHeight: '1.5',
            maxWidth: '85%',
            alignSelf: msg.type === 'ai' ? 'flex-start' : 'flex-end',
            animation: 'fadeUp 0.3s ease forwards'
          }}>
            {msg.text}
          </div>
        ))}
        {isTyping && (
          <div style={{ 
            background: 'var(--ink-soft)', 
            padding: '12px 16px', 
            borderRadius: '16px', 
            borderTopLeftRadius: '4px', 
            alignSelf: 'flex-start',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            height: '40px',
            animation: 'fadeUp 0.3s ease forwards'
          }}>
            <div className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--bone-dim)' }}></div>
            <div className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--bone-dim)', animationDelay: '0.2s' }}></div>
            <div className="w-1.5 h-1.5 rounded-full typing-dot" style={{ background: 'var(--bone-dim)', animationDelay: '0.4s' }}></div>
          </div>
        )}
      </div>
      
      <div className="absolute bottom-0 w-full p-3 flex items-center gap-2 border-t" style={{ background: 'rgba(255,255,255,0.03)', borderColor: 'var(--line)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="text-xl leading-none" style={{ color: 'var(--bone-dim)' }}>+</span>
        </div>
        <div className="flex-1 rounded-full h-10 px-4 flex items-center justify-between" style={{ background: 'rgba(255,255,255,0.05)' }}>
          <span className="text-[13px]" style={{ color: 'rgba(255,255,255,0.4)' }}>Text message</span>
          <div className="flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }}><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" x2="9.01" y1="9" y2="9"></line><line x1="15" x2="15.01" y1="9" y2="9"></line></svg>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: 'rgba(255,255,255,0.4)' }}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"></rect><circle cx="9" cy="9" r="2"></circle><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"></path></svg>
          </div>
        </div>
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: '#312e81' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5" style={{ color: '#4d6bf6' }}><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .typing-dot {
          animation: typingBlink 1.4s infinite both;
        }
        @keyframes typingBlink {
          0% { opacity: 0.2; }
          20% { opacity: 1; }
          100% { opacity: 0.2; }
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};
