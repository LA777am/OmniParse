import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Lenis from '@studio-freight/lenis';
import gsap from 'gsap';
// Actually, Stitch MCP will generate the screens! Let's just create a shell.

import UploadScreen from './screens/UploadScreen';
import StitchUploadScreen from './screens/StitchUploadScreen';
import ChatScreen from './screens/ChatScreen';

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<UploadScreen />} />
        <Route path="/stitch" element={<StitchUploadScreen />} />
        <Route path="/document/:document_id" element={<ChatScreen />} />
      </Routes>
    </Router>
  );
}

export default App;
