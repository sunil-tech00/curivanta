import { useEffect, useRef } from 'react';

export const DeviceAnimation = () => {
  const laptopRef = useRef<HTMLDivElement>(null);
  const phoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const laptopMock = laptopRef.current;
    const phoneMock = phoneRef.current;
    if (!laptopMock || !phoneMock) return;

    const laptopScenes = Array.from(laptopMock.querySelectorAll('.log-scene'));
    const phoneScenes = Array.from(phoneMock.querySelectorAll('.log-scene'));

    const sequence = [
      { el: laptopMock, other: phoneMock, scenes: laptopScenes, idx: 0 },
      { el: phoneMock, other: laptopMock, scenes: phoneScenes, idx: 0 },
      { el: laptopMock, other: phoneMock, scenes: laptopScenes, idx: 1 },
      { el: phoneMock, other: laptopMock, scenes: phoneScenes, idx: 1 }
    ];
    let seqPos = 0;
    let isCancelled = false;
    let typeTimeout: NodeJS.Timeout;
    let showTimeout: NodeJS.Timeout;
    let nextTimeout: NodeJS.Timeout;

    function playStep() {
      if (isCancelled) return;
      
      const step = sequence[seqPos];
      step.el.classList.remove('dim');
      step.other.classList.add('dim');
      
      step.scenes.forEach((s, i) => {
        if (i === step.idx) s.classList.add('active');
        else s.classList.remove('active');
      });

      const sceneEl = step.scenes[step.idx];
      if (!sceneEl) return;
      
      const typedSpan = sceneEl.querySelector('.typed');
      const line2 = sceneEl.querySelector('.scene-line2');
      const line1 = sceneEl.querySelector('.scene-line1') as HTMLElement;
      const fullText = line1?.dataset.text || '';
      
      if (typedSpan) typedSpan.textContent = '';
      if (line2) line2.classList.remove('show');

      let ci = 0;
      function typeChar() {
        if (isCancelled) return;
        if (ci <= fullText.length) {
          if (typedSpan) typedSpan.textContent = fullText.slice(0, ci);
          ci++;
          typeTimeout = setTimeout(typeChar, 32);
        } else {
          showTimeout = setTimeout(() => {
            if (isCancelled) return;
            if (line2) line2.classList.add('show');
          }, 300);
          nextTimeout = setTimeout(() => {
            if (isCancelled) return;
            seqPos = (seqPos + 1) % sequence.length;
            playStep();
          }, 2200);
        }
      }
      typeChar();
    }
    
    playStep();

    return () => {
      isCancelled = true;
      clearTimeout(typeTimeout);
      clearTimeout(showTimeout);
      clearTimeout(nextTimeout);
    };
  }, []);

  return (
    <div className="dual-devices">
      <div className="laptop-mock" id="laptopMock" ref={laptopRef}>
        <div className="laptop-screen">
          <div className="browser-bar">
            <div className="tl"><span></span><span></span><span></span></div>
            <div className="browser-url">curivanta.com</div>
          </div>
          <div className="device-body">
            <div className="log-scene active" data-idx="0">
              <span className="scene-tag">WORKFLOW</span>
              <p className="scene-line1" data-text="→ Trigger: appointment completed"><span className="typed"></span><span className="cursor">▌</span></p>
              <p className="scene-line2">✓ Review request + rebooking reminder sent</p>
            </div>
            <div className="log-scene" data-idx="1">
              <span className="scene-tag">WEBSITE</span>
              <p className="scene-line1" data-text="→ New visitor on curivanta.com"><span className="typed"></span><span className="cursor">▌</span></p>
              <p className="scene-line2">✓ Lead captured, synced to calendar</p>
            </div>
          </div>
        </div>
        <div className="laptop-base"></div>
      </div>

      <div className="phone-mock" id="phoneMock" ref={phoneRef}>
        <div className="phone-notch"></div>
        <div className="device-body">
          <div className="log-scene active" data-idx="0">
            <span className="scene-tag">VOICE</span>
            <p className="scene-line1" data-text="→ Incoming call: (949) 555-0182"><span className="typed"></span><span className="cursor">▌</span></p>
            <p className="scene-line2">✓ Booked Thu 2:00pm</p>
          </div>
          <div className="log-scene" data-idx="1">
            <span className="scene-tag">CHAT</span>
            <p className="scene-line1" data-text='→ SMS: "Saturday openings?"'><span className="typed"></span><span className="cursor">▌</span></p>
            <p className="scene-line2">✓ Booked Sat 10am via text</p>
          </div>
        </div>
      </div>
    </div>
  );
};
