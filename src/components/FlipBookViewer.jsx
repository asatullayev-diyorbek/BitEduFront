import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Download, Loader2,
  ChevronLeft, ChevronRight,
  Highlighter, X, ZoomIn, ZoomOut,
  Maximize2, Minimize2,
} from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';
import PdfWorker from 'pdfjs-dist/build/pdf.worker.min?url';

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

const HIGHLIGHT_COLORS = ['#FFD700', '#90EE90', '#87CEEB', '#FFB6C1', '#FFA500'];

// ── PagePanel — komponent TASHQARIDA, ref lar prop orqali ──────────────────
const PagePanel = ({
  side, cRef, hRef, pageNum, totalPages,
  isFlipping, flipDirection, flipProgress,
  highlighterActive, isFullscreen,
  onDown, onMove, onUp,
}) => {
  const deg =
    isFlipping && side === 'left'  && flipDirection === 'left'  ? flipProgress * -28 :
    isFlipping && side === 'right' && flipDirection === 'right' ? flipProgress *  28 : 0;

  const shadow = side === 'left'
    ? { boxShadow: '-6px 0 28px rgba(0,0,0,0.6), inset -3px 0 8px rgba(0,0,0,0.15)' }
    : { boxShadow:  '6px 0 28px rgba(0,0,0,0.6), inset  3px 0 8px rgba(0,0,0,0.15)' };

  return (
    <div
      className={`relative flex-1 max-w-[48%] h-full flex items-center ${side === 'left' ? 'justify-end' : 'justify-start'} select-none`}
      style={{ cursor: highlighterActive ? 'crosshair' : 'default' }}
      onMouseDown={e => onDown(e, side)}
      onMouseMove={e => onMove(e, side)}
      onMouseUp={e => onUp(e, side)}
      onTouchStart={e => onDown(e, side)}
      onTouchMove={e => onMove(e, side)}
      onTouchEnd={e => onUp(e, side)}
    >
      <div
        className="relative"
        style={{
          transformOrigin: `${side === 'left' ? 'right' : 'left'} center`,
          transform: `perspective(1200px) rotateY(${deg}deg)`,
        }}
      >
        <div
          className={`relative overflow-hidden ${side === 'left' ? 'rounded-l-sm' : 'rounded-r-sm'}`}
          style={shadow}
        >
          <canvas
            ref={cRef}
            className="block"
            style={{ maxHeight: isFullscreen ? '88vh' : '700px' }}
          />
          <canvas
            ref={hRef}
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ mixBlendMode: 'multiply' }}
          />
          {pageNum && pageNum <= totalPages && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-slate-400/40 text-[9px] font-mono pointer-events-none">
              {pageNum}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── FlipBookViewer ─────────────────────────────────────────────────────────────
const FlipBookViewer = ({ pdfBlobUrl, downloadUrl, bookName, height = '860px' }) => {
  const containerRef   = useRef(null);
  const canvasLeftRef  = useRef(null);
  const canvasRightRef = useRef(null);
  const hlLeftRef      = useRef(null);
  const hlRightRef     = useRef(null);
  const animFrameRef   = useRef(null);

  const [pdfDoc,           setPdfDoc]           = useState(null);
  const [totalPages,       setTotalPages]       = useState(0);
  const [currentSpread,    setCurrentSpread]    = useState(0);
  const [isLoading,        setIsLoading]        = useState(true);
  const [zoom,             setZoom]             = useState(1);
  const [isFlipping,       setIsFlipping]       = useState(false);
  const [flipDirection,    setFlipDirection]    = useState(null);
  const [flipProgress,     setFlipProgress]     = useState(0);
  const [highlighterActive,setHighlighterActive]= useState(false);
  const [highlighterColor, setHighlighterColor] = useState('#FFD700');
  const [isDrawing,        setIsDrawing]        = useState(false);
  const [highlights,       setHighlights]       = useState({});
  const [drawStart,        setDrawStart]        = useState(null);
  const [pageSize,         setPageSize]         = useState({ width: 500, height: 700 });
  const [isFullscreen,     setIsFullscreen]     = useState(false);

  // PDF yuklash
  useEffect(() => {
    if (!pdfBlobUrl) return;
    setIsLoading(true);
    setCurrentSpread(0);
    pdfjsLib.getDocument(pdfBlobUrl).promise
      .then(doc => { setPdfDoc(doc); setTotalPages(doc.numPages); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, [pdfBlobUrl]);

  // Fullscreen listener
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  useEffect(() => () => cancelAnimationFrame(animFrameRef.current), []);

  // Hisob-kitoblar
  const totalSpreads = Math.ceil(totalPages / 2);
  const leftPageNum  = currentSpread === 0 ? null : currentSpread * 2 - 1;
  const rightPageNum = currentSpread === 0 ? 1    : currentSpread * 2;

  // Highlight render
  const drawHighlights = useCallback((canvas, pageNum, w, h) => {
    if (!canvas || !w || !h) return;
    canvas.width  = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, w, h);
    (highlights[pageNum] || []).forEach(hl => {
      ctx.globalAlpha = 0.38;
      ctx.fillStyle   = hl.color;
      ctx.fillRect(hl.x, hl.y, hl.w, hl.h);
      ctx.globalAlpha = 1;
    });
  }, [highlights]);

  // Sahifa render
  const renderPage = useCallback(async (pageNum, canvasRef, hlRef) => {
    if (!pdfDoc || !canvasRef.current) return;

    if (!pageNum || pageNum < 1 || pageNum > totalPages) {
      const c   = canvasRef.current;
      const w   = pageSize.width  || 500;
      const h   = pageSize.height || 700;
      c.width   = w; c.height = h;
      const ctx = c.getContext('2d');
      ctx.fillStyle = '#faf9f6';
      ctx.fillRect(0, 0, w, h);
      return;
    }

    const page = await pdfDoc.getPage(pageNum);
    const vp   = page.getViewport({ scale: zoom * 1.5 });
    const c    = canvasRef.current;
    if (!c) return;                      // unmount bo'lgan bo'lishi mumkin
    c.width  = vp.width;
    c.height = vp.height;
    setPageSize({ width: vp.width, height: vp.height });

    const ctx = c.getContext('2d');
    ctx.fillStyle = '#faf9f6';
    ctx.fillRect(0, 0, vp.width, vp.height);
    await page.render({ canvasContext: ctx, viewport: vp }).promise;
    drawHighlights(hlRef?.current, pageNum, vp.width, vp.height);
  }, [pdfDoc, zoom, totalPages, drawHighlights, pageSize.width, pageSize.height]);

  // Spread o'zgarganda render
  useEffect(() => {
    if (!pdfDoc) return;
    renderPage(leftPageNum,  canvasLeftRef,  hlLeftRef);
    renderPage(rightPageNum, canvasRightRef, hlRightRef);
  }, [pdfDoc, currentSpread, zoom, renderPage]);

  // Highlight o'zgarganda faqat overlay qayta chiziladi
  useEffect(() => {
    if (hlLeftRef.current  && leftPageNum)
      drawHighlights(hlLeftRef.current,  leftPageNum,  pageSize.width, pageSize.height);
    if (hlRightRef.current && rightPageNum)
      drawHighlights(hlRightRef.current, rightPageNum, pageSize.width, pageSize.height);
  }, [highlights]);

  // Flip animatsiya
  const animateFlip = useCallback((direction) => {
    if (isFlipping) return;
    if (direction === 'right' && currentSpread >= totalSpreads - 1) return;
    if (direction === 'left'  && currentSpread <= 0) return;
    setIsFlipping(true); setFlipDirection(direction); setFlipProgress(0);
    const startTime = performance.now();
    const animate = (now) => {
      const p     = Math.min((now - startTime) / 380, 1);
      const eased = p < 0.5 ? 4 * p ** 3 : 1 - (-2 * p + 2) ** 3 / 2;
      setFlipProgress(eased);
      if (p < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrentSpread(prev => direction === 'right' ? prev + 1 : prev - 1);
        setIsFlipping(false); setFlipDirection(null); setFlipProgress(0);
      }
    };
    animFrameRef.current = requestAnimationFrame(animate);
  }, [isFlipping, currentSpread, totalSpreads]);

  // Klaviatura
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight') animateFlip('right');
      if (e.key === 'ArrowLeft')  animateFlip('left');
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [animateFlip]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!isFullscreen) containerRef.current?.requestFullscreen?.();
    else document.exitFullscreen?.();
  };

  // Highlighter yordamchilari
  const getCoords = (e, ref) => {
    if (!ref.current) return null;
    const rect = ref.current.getBoundingClientRect();
    const sx   = ref.current.width  / rect.width;
    const sy   = ref.current.height / rect.height;
    const cx   = e.touches ? e.touches[0].clientX : e.clientX;
    const cy   = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (cx - rect.left) * sx, y: (cy - rect.top) * sy };
  };

  const sideToPageNum = s => s === 'left' ? leftPageNum  : rightPageNum;
  const sideToHlRef   = s => s === 'left' ? hlLeftRef    : hlRightRef;

  const onDown = (e, side) => {
    if (!highlighterActive) return;
    const coords = getCoords(e, sideToHlRef(side));
    if (coords) { setIsDrawing(true); setDrawStart({ ...coords, side }); }
  };

  const onMove = (e, side) => {
    if (!highlighterActive || !isDrawing || drawStart?.side !== side) return;
    const ref    = sideToHlRef(side);
    const coords = getCoords(e, ref);
    if (!coords || !ref.current) return;
    const pageNum = sideToPageNum(side);
    if (!pageNum) return;
    const canvas = ref.current;
    const ctx    = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    (highlights[pageNum] || []).forEach(hl => {
      ctx.globalAlpha = 0.38; ctx.fillStyle = hl.color;
      ctx.fillRect(hl.x, hl.y, hl.w, hl.h); ctx.globalAlpha = 1;
    });
    ctx.globalAlpha = 0.38; ctx.fillStyle = highlighterColor;
    ctx.fillRect(
      Math.min(drawStart.x, coords.x), Math.min(drawStart.y, coords.y),
      Math.abs(coords.x - drawStart.x), Math.abs(coords.y - drawStart.y),
    );
    ctx.globalAlpha = 1;
  };

  const onUp = (e, side) => {
    if (!highlighterActive || !isDrawing || drawStart?.side !== side) return;
    const coords  = getCoords(e, sideToHlRef(side));
    const pageNum = sideToPageNum(side);
    if (coords && pageNum) {
      const hl = {
        x: Math.min(drawStart.x, coords.x), y: Math.min(drawStart.y, coords.y),
        w: Math.abs(coords.x - drawStart.x), h: Math.abs(coords.y - drawStart.y),
        color: highlighterColor,
      };
      if (hl.w > 5 && hl.h > 5)
        setHighlights(prev => ({ ...prev, [pageNum]: [...(prev[pageNum] || []), hl] }));
    }
    setIsDrawing(false); setDrawStart(null);
  };

  const clearCurrentHighlights = () => {
    setHighlights(prev => {
      const next = { ...prev };
      if (leftPageNum)  delete next[leftPageNum];
      if (rightPageNum) delete next[rightPageNum];
      return next;
    });
  };

  // ── RENDER ────────────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="flex flex-col overflow-hidden"
      style={{
        height: isFullscreen ? '100vh' : height,
        background: '#13100e',
        borderRadius: isFullscreen ? 0 : '28px',
        ...(isFullscreen ? { position: 'fixed', inset: 0, zIndex: 9999 } : {}),
      }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10 bg-[#0e0c0a] shrink-0 gap-3 flex-wrap">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-white/50 text-[10px] font-bold uppercase tracking-[0.22em] truncate max-w-[180px]">
            {bookName || 'Elektron Darslik'}
          </span>
          {totalPages > 0 && (
            <span className="text-white/25 text-[10px] font-mono whitespace-nowrap">
              {leftPageNum ?? '—'} / {rightPageNum} · {totalPages} bet
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zoom */}
          <div className="flex items-center gap-1 bg-white/5 rounded-lg px-2 py-1">
            <button onClick={() => setZoom(z => Math.max(0.5, +(z - 0.25).toFixed(2)))}
              className="p-1 text-white/50 hover:text-white transition-colors">
              <ZoomOut size={14} />
            </button>
            <span className="text-white/35 text-[10px] font-mono w-9 text-center">{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
              className="p-1 text-white/50 hover:text-white transition-colors">
              <ZoomIn size={14} />
            </button>
          </div>

          <div className="w-px h-5 bg-white/10" />

          {/* Highlighter */}
          <button
            onClick={() => setHighlighterActive(h => !h)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
              highlighterActive
                ? 'bg-amber-400 text-black'
                : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white'
            }`}
          >
            <Highlighter size={13} />
            <span className="hidden sm:inline uppercase tracking-widest">Marker</span>
          </button>

          {highlighterActive && (
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2 py-1.5">
              {HIGHLIGHT_COLORS.map(color => (
                <button
                  key={color}
                  onClick={() => setHighlighterColor(color)}
                  className="w-4 h-4 rounded-full transition-transform hover:scale-125 border-2 shrink-0"
                  style={{ backgroundColor: color, borderColor: highlighterColor === color ? 'white' : 'transparent' }}
                />
              ))}
              <button onClick={clearCurrentHighlights} className="ml-1 text-white/30 hover:text-red-400 transition-colors">
                <X size={12} />
              </button>
            </div>
          )}

          <div className="w-px h-5 bg-white/10" />

          {/* Fullscreen */}
          <button onClick={toggleFullscreen}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition-all">
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>

          {/* Download */}
          {downloadUrl && (
            <a href={downloadUrl} target="_blank" rel="noopener noreferrer" download
              className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-black px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all">
              <Download size={12} />
              <span className="hidden sm:inline">PDF</span>
            </a>
          )}
        </div>
      </div>

      {/* Book Stage */}
      <div
        className="flex-1 flex items-center justify-center relative overflow-hidden px-10"
        style={{ background: 'radial-gradient(ellipse at center, #28201a 0%, #13100e 100%)' }}
      >
        {isLoading ? (
          <div className="flex flex-col items-center gap-4 text-white/30">
            <Loader2 className="animate-spin" size={30} />
            <p className="text-[10px] uppercase tracking-widest font-bold">Kitob yuklanmoqda...</p>
          </div>
        ) : (
          <>
            <PagePanel
              side="left"
              cRef={canvasLeftRef} hRef={hlLeftRef}
              pageNum={leftPageNum} totalPages={totalPages}
              isFlipping={isFlipping} flipDirection={flipDirection} flipProgress={flipProgress}
              highlighterActive={highlighterActive} isFullscreen={isFullscreen}
              onDown={onDown} onMove={onMove} onUp={onUp}
            />

            {/* Spine */}
            <div className="z-10 w-px self-stretch mx-1 pointer-events-none flex items-center">
              <div className="w-full h-4/5 rounded-full"
                style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,0,0,0.8) 50%, transparent)' }} />
            </div>

            <PagePanel
              side="right"
              cRef={canvasRightRef} hRef={hlRightRef}
              pageNum={rightPageNum} totalPages={totalPages}
              isFlipping={isFlipping} flipDirection={flipDirection} flipProgress={flipProgress}
              highlighterActive={highlighterActive} isFullscreen={isFullscreen}
              onDown={onDown} onMove={onMove} onUp={onUp}
            />

            {/* Chap o'q */}
            <button
              onClick={() => animateFlip('left')}
              disabled={currentSpread <= 0 || isFlipping}
              className={`absolute left-2 z-30 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ${
                currentSpread <= 0
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-black/40 hover:bg-amber-400 text-white hover:text-black hover:scale-110 shadow-xl backdrop-blur-sm'
              }`}
            >
              <ChevronLeft size={20} />
            </button>

            {/* O'ng o'q */}
            <button
              onClick={() => animateFlip('right')}
              disabled={currentSpread >= totalSpreads - 1 || isFlipping}
              className={`absolute right-2 z-30 w-11 h-11 flex items-center justify-center rounded-full transition-all duration-200 ${
                currentSpread >= totalSpreads - 1
                  ? 'opacity-0 pointer-events-none'
                  : 'bg-black/40 hover:bg-amber-400 text-white hover:text-black hover:scale-110 shadow-xl backdrop-blur-sm'
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Progress */}
      {totalPages > 0 && (
        <div className="shrink-0 px-5 py-3 bg-[#0e0c0a] border-t border-white/5 flex items-center gap-4">
          <span className="text-white/25 text-[9px] font-mono w-8 text-right">
            {Math.round(((currentSpread + 1) / totalSpreads) * 100)}%
          </span>
          <div className="flex-1 h-[3px] bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${((currentSpread + 1) / totalSpreads) * 100}%` }}
            />
          </div>
          <div className="flex gap-1 overflow-hidden max-w-[180px]">
            {Array.from({ length: Math.min(totalSpreads, 20) }).map((_, i) => {
              const ts = Math.round(i * (totalSpreads - 1) / Math.max(Math.min(totalSpreads, 20) - 1, 1));
              return (
                <button
                  key={i}
                  onClick={() => !isFlipping && setCurrentSpread(ts)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    ts === currentSpread ? 'bg-amber-400 scale-125' : 'bg-white/15 hover:bg-white/35'
                  }`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default FlipBookViewer;