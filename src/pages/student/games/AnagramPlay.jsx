import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../../api/axios';
import { toast } from 'react-hot-toast';
import { Loader2, ArrowLeft, CheckCircle2, RotateCcw, XCircle, Trophy } from 'lucide-react';

// Har bir harf uchun unique id (bir xil harflar bo'lishi mumkin)
const makeTiles = (letters) => letters.map((ch, i) => ({ id: `${ch}-${i}`, ch }));

const AnagramPlay = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [index, setIndex] = useState(0);        // joriy so'z indeksi
  const [tray, setTray] = useState([]);
  const [slot, setSlot] = useState([]);
  const [collected, setCollected] = useState([]); // [{word_id, answer}]
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null);

  const words = game?.words || [];
  const currentWord = words[index];

  const loadWord = (word) => {
    setTray(makeTiles(word?.scrambled_letters || []));
    setSlot([]);
  };

  const loadGame = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get(`/games/anagrams/${id}/`);
      const data = res.data?.data;
      setGame(data);
      setIndex(0);
      setCollected([]);
      setResult(null);
      loadWord(data.words?.[0]);
    } catch {
      // global toast
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadGame(); }, [loadGame]);

  const moveToSlot = (tile) => {
    setTray((t) => t.filter((x) => x.id !== tile.id));
    setSlot((s) => [...s, tile]);
  };
  const moveToTray = (tile) => {
    setSlot((s) => s.filter((x) => x.id !== tile.id));
    setTray((t) => [...t, tile]);
  };

  const onDragStart = (e, tile, from) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ id: tile.id, from }));
  };
  const onDropToSlot = (e) => {
    e.preventDefault();
    const { id: tileId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (from === 'tray') {
      const tile = tray.find((x) => x.id === tileId);
      if (tile) moveToSlot(tile);
    }
  };
  const onDropToTray = (e) => {
    e.preventDefault();
    const { id: tileId, from } = JSON.parse(e.dataTransfer.getData('text/plain'));
    if (from === 'slot') {
      const tile = slot.find((x) => x.id === tileId);
      if (tile) moveToTray(tile);
    }
  };

  const reset = () => loadWord(currentWord);

  const finalize = async (allAnswers) => {
    try {
      setChecking(true);
      const res = await api.post(`/games/anagrams/${id}/submit/`, { answers: allAnswers });
      setResult(res.data?.data);
    } catch {
      // global toast
    } finally {
      setChecking(false);
    }
  };

  const check = async () => {
    if (slot.length === 0) {
      toast.error('Avval harflarni joylashtiring');
      return;
    }
    const answer = slot.map((t) => t.ch).join('');
    try {
      setChecking(true);
      const res = await api.post(`/games/anagrams/${id}/check/`, {
        word_id: currentWord.id,
        answer,
      });
      if (res.data?.data?.is_correct) {
        const updated = [...collected, { word_id: currentWord.id, answer }];
        setCollected(updated);
        if (index + 1 >= words.length) {
          toast.success('Barcha so\'zlar topildi! 🎉');
          await finalize(updated);
        } else {
          toast.success('To\'g\'ri! Keyingi so\'z');
          const next = index + 1;
          setIndex(next);
          loadWord(words[next]);
        }
      } else {
        toast.error('Noto\'g\'ri. Qayta urinib ko\'ring');
      }
    } catch {
      // global toast
    } finally {
      setChecking(false);
    }
  };

  const Tile = ({ tile, from }) => (
    <button
      draggable
      onDragStart={(e) => onDragStart(e, tile, from)}
      onClick={() => (from === 'tray' ? moveToSlot(tile) : moveToTray(tile))}
      className="flex h-16 w-16 select-none items-center justify-center rounded-2xl bg-blue-600 text-2xl font-black text-white shadow-lg shadow-blue-200 transition-transform hover:scale-105 active:scale-95 cursor-grab"
    >
      {tile.ch}
    </button>
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 gap-4">
        <Loader2 className="animate-spin text-blue-600" size={40} />
        <p className="text-[10px] font-black uppercase italic text-slate-400 tracking-[0.3em]">Yuklanmoqda...</p>
      </div>
    );
  }

  // ── Natija ekrani ──
  if (result) {
    return (
      <div className="max-w-md mx-auto py-10 animate-in zoom-in-95 duration-500">
        <div className="bg-white rounded-[35px] border border-slate-100 shadow-2xl p-8 text-center">
          <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 shadow-lg ${result.is_correct ? 'bg-emerald-500 shadow-emerald-200 text-white' : 'bg-red-500 shadow-red-200 text-white'}`}>
            {result.is_correct ? <Trophy size={40} /> : <XCircle size={40} />}
          </div>
          <h2 className="text-xl font-black italic uppercase tracking-tight text-slate-900">
            {result.is_correct ? 'Barakalla!' : 'Hali imkon bor!'}
          </h2>
          <p className="text-slate-400 font-bold mt-2 uppercase text-[9px] tracking-widest">{result.message}</p>

          <div className="grid grid-cols-2 gap-3 mt-8">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">So&rsquo;zlar</p>
              <p className="text-lg font-black text-slate-800">{result.correct_count} / {result.total_questions}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase italic">Berilgan ball</p>
              <p className="text-lg font-black text-blue-600">+{result.points_awarded}</p>
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              onClick={loadGame}
              className="flex-1 py-4 bg-slate-100 text-slate-700 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 italic"
            >
              Qayta o&rsquo;ynash
            </button>
            <button
              onClick={() => navigate('/student/games/anagram')}
              className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all active:scale-95 italic"
            >
              O&rsquo;yinlarga qaytish
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── O'yin ekrani ──
  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Link to="/student/games/anagram" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-blue-600 transition-colors">
        <ArrowLeft size={16} /> Orqaga
      </Link>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight italic">{game?.title}</h1>
          <p className="text-slate-500 font-medium">{game?.description}</p>
        </div>
        <span className="shrink-0 rounded-xl bg-blue-50 px-3.5 py-2 text-[11px] font-black uppercase tracking-wider text-blue-600">
          So&rsquo;z {index + 1} / {words.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(index / words.length) * 100}%` }}
        />
      </div>

      {game?.is_completed && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center text-[11px] font-black uppercase tracking-widest text-emerald-600 flex items-center justify-center gap-2">
          <CheckCircle2 size={16} /> Allaqachon bajarilgan — ball qo&rsquo;shilmaydi
        </div>
      )}

      {currentWord?.hint && (
        <p className="text-center text-sm font-bold text-slate-400">💡 Ishora: {currentWord.hint}</p>
      )}

      {/* Aralash harflar (TRAY) */}
      <div
        className="flex flex-wrap justify-center gap-3 min-h-[4rem]"
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropToTray}
      >
        {tray.map((tile) => <Tile key={tile.id} tile={tile} from="tray" />)}
      </div>

      {/* Drop zona (SLOT) */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={onDropToSlot}
        className="min-h-[6rem] rounded-[28px] border border-slate-100 bg-slate-50 p-6 flex flex-wrap items-center justify-center gap-3"
      >
        {slot.length === 0 ? (
          <span className="text-slate-400 font-bold uppercase text-xs tracking-widest">Harflarni bu yerga sudrang</span>
        ) : (
          slot.map((tile) => <Tile key={tile.id} tile={tile} from="slot" />)
        )}
      </div>

      {/* Tugmalar */}
      <div className="flex items-center justify-center gap-4 pt-2">
        <button
          onClick={check}
          disabled={checking}
          className="px-10 py-4 bg-blue-600 text-white rounded-[18px] font-black text-[11px] uppercase tracking-[0.2em] italic shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {checking ? <Loader2 className="animate-spin" size={18} /> : 'Tekshirish'}
        </button>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-6 py-4 rounded-[18px] font-black text-[11px] uppercase tracking-[0.2em] italic text-slate-500 hover:text-blue-600 transition-colors"
        >
          <RotateCcw size={16} /> Qayta boshlash
        </button>
      </div>
    </div>
  );
};

export default AnagramPlay;
