'use client';

import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase'; // ajuste si ton export est différent
import {
  Trophy, Crown, MessageSquare, Plus, X, Menu, Award, BarChart3,
  CheckCircle, XCircle, TrendingUp, Star, DollarSign, Mail
} from 'lucide-react';

// ...existing code...
const MoneyBallLoader = () => {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700 flex items-center justify-center z-50">
      <div className="relative">
        <div className="relative animate-bounce">
          <div className="w-32 h-32 rounded-full bg-white shadow-2xl flex items-center justify-center animate-spin-slow">
            <div className="text-6xl">⚽</div>
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="absolute animate-money-explosion" style={{ transform: `rotate(${i * 30}deg) translateY(-60px)`, animationDelay: `${i * 0.1}s` }}>
                <span className="text-3xl">💰</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-center mt-8 text-yellow-300 font-black text-xl animate-pulse">
          Chargement des pronostics gagnants...
        </p>
      </div>
      <style>{`
        @keyframes spin-slow { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes money-explosion { 0% { opacity: 0; transform: scale(0) translateY(0); } 50% { opacity: 1; transform: scale(1.2) translateY(-80px); } 100% { opacity: 0; transform: scale(0.8) translateY(-120px); } }
        .animate-spin-slow { animation: spin-slow 3s linear infinite; }
        .animate-money-explosion { animation: money-explosion 2s ease-out infinite; }
      `}</style>
    </div>
  );
};
// ...existing code...

export default function BerichApp() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('matches');
  const [matches, setMatches] = useState<any[]>([]);
  const [predictions, setPredictions] = useState<any[]>([]);
  const [reactions, setReactions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [showAddMatch, setShowAddMatch] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [showResultModal, setShowResultModal] = useState<number | null>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  const [newMatch, setNewMatch] = useState({ team1: '', team2: '', team1_logo: '', team2_logo: '', date: '', time: '' });
  const [showAddPrediction, setShowAddPrediction] = useState<number | null>(null);
  const [newPrediction, setNewPrediction] = useState({ prediction: '', odds: '', description: '' });
  const [resultData, setResultData] = useState({ result: 'win', final_odds: '' });
  const [showCommentForm, setShowCommentForm] = useState<number | null>(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    const init = async () => {
      await checkUser();
      await loadData();
      setTimeout(() => setLoading(false), 1500);
    };
    init();
  }, []);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    setUser(data?.user ?? null);
  };

  const loadData = async () => {
    const [matchesRes, predictionsRes, reactionsRes, commentsRes] = await Promise.all([
      supabase.from('matches').select('*').order('match_date', { ascending: true }),
      supabase.from('predictions').select('*'),
      supabase.from('reactions').select('*'),
      supabase.from('comments').select('*')
    ]);
    setMatches(matchesRes.data || []);
    setPredictions(predictionsRes.data || []);
    setReactions(reactionsRes.data || []);
    setComments(commentsRes.data || []);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { data: { username, is_admin: false, is_vip: false } }
        });
        if (error) throw error;
        alert('Compte créé ! Vérifiez votre email pour confirmer.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      await checkUser();
      setShowAuthModal(false);
      setEmail(''); setPassword(''); setUsername('');
    } catch (error: any) {
      alert(error.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await supabase.from('matches').insert({
        team1: newMatch.team1, team2: newMatch.team2,
        team1_logo: newMatch.team1_logo, team2_logo: newMatch.team2_logo,
        match_date: newMatch.date, match_time: newMatch.time, admin_id: user?.id ?? null
      });
      await loadData();
      setShowAddMatch(false);
      setNewMatch({ team1: '', team2: '', team1_logo: '', team2_logo: '', date: '', time: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleAddPrediction = async (e: React.FormEvent, matchId: number) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (!user) { setShowAuthModal(true); return; }
      await supabase.from('predictions').insert({
        match_id: matchId, user_id: user.id,
        username: user.user_metadata?.username || user.email,
        prediction: newPrediction.prediction, odds: newPrediction.odds,
        description: newPrediction.description, is_admin: user.user_metadata?.is_admin ?? false, result: 'pending'
      });
      await loadData();
      setShowAddPrediction(null);
      setNewPrediction({ prediction: '', odds: '', description: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleUpdateResult = async (predictionId: number) => {
    setLoading(true);
    try {
      await supabase.from('predictions').update({
        result: resultData.result,
        final_odds: resultData.final_odds || null
      }).eq('id', predictionId);
      await loadData();
      setShowResultModal(null);
      setResultData({ result: 'win', final_odds: '' });
    } catch (error: any) {
      alert(error.message);
    } finally {
      setTimeout(() => setLoading(false), 1000);
    }
  };

  const handleReaction = async (predictionId: number) => {
    if (!user) { setShowAuthModal(true); return; }
    const existingReaction = reactions.find(r => r.prediction_id === predictionId && r.user_id === user.id);
    try {
      if (existingReaction) {
        await supabase.from('reactions').delete().eq('id', existingReaction.id);
      } else {
        await supabase.from('reactions').insert({ prediction_id: predictionId, user_id: user.id });
      }
      await loadData();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAddComment = async (e: React.FormEvent, predictionId: number) => {
    e.preventDefault();
    if (!user) { setShowAuthModal(true); return; }
    try {
      await supabase.from('comments').insert({
        prediction_id: predictionId, user_id: user.id,
        username: user.user_metadata?.username || user.email, text: commentText
      });
      await loadData();
      setShowCommentForm(null);
      setCommentText('');
    } catch (error: any) {
      alert(error.message);
    }
  };

  const getReactionCount = (predictionId: number) => reactions.filter(r => r.prediction_id === predictionId).length;
  const getCommentCount = (predictionId: number) => comments.filter(c => c.prediction_id === predictionId).length;
  const hasUserReacted = (predictionId: number) => user && reactions.some(r => r.prediction_id === predictionId && r.user_id === user.id);
  const getPredictionsForMatch = (matchId: number) => predictions.filter(p => p.match_id === matchId).sort((a, b) => getReactionCount(b.id) - getReactionCount(a.id));
  const getCommentsForPrediction = (predictionId: number) => comments.filter(c => c.prediction_id === predictionId);

  const getStatistics = () => {
    const finishedPredictions = predictions.filter(p => p.result && p.result !== 'pending');
    const wonPredictions = finishedPredictions.filter(p => p.result === 'win');
    const lostPredictions = finishedPredictions.filter(p => p.result === 'loss');
    const winRate = finishedPredictions.length > 0 ? Math.round((wonPredictions.length / finishedPredictions.length) * 100) : 0;
    return {
      total: predictions.length, won: wonPredictions.length, lost: lostPredictions.length,
      pending: predictions.filter(p => !p.result || p.result === 'pending').length, winRate
    };
  };

  const stats = getStatistics();
  const isAdmin = user?.user_metadata?.is_admin === true;
  const isVip = user?.user_metadata?.is_vip === true;

  if (loading) return <MoneyBallLoader />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-yellow-800 to-amber-700">
      <header className="bg-black/40 backdrop-blur-md border-b border-yellow-500/30 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full p-3 shadow-lg">
                <Trophy className="text-white" size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-200">BERICH</h1>
                <p className="text-yellow-200/70 text-xs font-semibold">Pronostics Gagnants</p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4 flex-wrap">
              {['matches', 'history', 'stats'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg font-bold transition capitalize ${activeTab === tab ? 'bg-yellow-500 text-black' : 'text-yellow-200 hover:bg-white/10'}`}>
                  {tab === 'matches' ? 'Matchs' : tab === 'history' ? 'Historique' : 'Statistiques'}
                </button>
              ))}
              {isVip && (
                <button onClick={() => setActiveTab('vip')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition ${activeTab === 'vip' ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-purple-300 hover:bg-purple-900/20'}`}>
                  <Crown size={18} />VIP
                </button>
              )}
              <button onClick={() => setShowPromoModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black px-4 py-2 rounded-lg font-bold transition shadow-lg">
                <MessageSquare size={18} />Code Promo
              </button>
              
              {user ? (
                <div className="flex items-center gap-3 ml-2">
                  <button onClick={handleSignOut} className="bg-white/10 hover:bg-white/20 text-yellow-200 px-4 py-2 rounded-lg font-bold">Se déconnecter</button>
                </div>
              ) : (
                <button onClick={() => setShowAuthModal(true)} className="bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-500 hover:to-amber-500 text-black px-6 py-2 rounded-lg font-black transition shadow-lg ml-2">
                  Se connecter
                </button>
              )}
            </div>

            <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden text-yellow-300 p-2">
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'matches' && (
          <>
            {isAdmin && (
              <div className="mb-6">
                <button onClick={() => setShowAddMatch(true)}
                  className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-black transition shadow-xl">
                  <Plus size={20} />Ajouter un match
                </button>
              </div>
            )}

            <div className="space-y-6">
              {matches.filter(m => new Date(m.match_date) >= new Date()).length === 0 ? (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 text-center text-white border-2 border-yellow-500/30">
                  <Trophy size={64} className="mx-auto mb-4 text-yellow-300" />
                  {isAdmin ? (
                    <div>
                      <p className="text-yellow-200 mb-4">Aucun match programmé — ajoutez-en un :</p>
                      <button onClick={() => setShowAddMatch(true)} className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-6 py-2 rounded-lg font-bold">Ajouter un match</button>
                    </div>
                  ) : (
                    <p className="text-yellow-200/60 text-center">Aucun match programmé pour le moment</p>
                  )}
                </div>
              ) : (
                matches.filter(m => new Date(m.match_date) >= new Date()).map(match => (
                  <div key={match.id} className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl overflow-hidden shadow-2xl border-2 border-yellow-500/30">
                    <div className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {match.team1_logo && <img src={match.team1_logo} alt={match.team1} className="w-12 h-12 object-cover rounded-full" />}
                        <div className="font-black text-white">{match.team1}</div>
                        <div className="text-yellow-300 font-bold mx-2">vs</div>
                        <div className="font-black text-white">{match.team2}</div>
                        {match.team2_logo && <img src={match.team2_logo} alt={match.team2} className="w-12 h-12 object-cover rounded-full" />}
                      </div>
                      <div className="text-yellow-200 text-sm">{new Date(match.match_date).toLocaleDateString()} {match.match_time}</div>
                    </div>
                    <div className="p-4 border-t border-yellow-500/20 flex items-center justify-between">
                      <div className="text-yellow-200 text-sm">{getPredictionsForMatch(match.id).length} pronostics</div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddPrediction(match.id)} className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-bold">Voir / Ajouter</button>
                        {isAdmin && <button onClick={() => setShowAddPrediction(match.id)} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-lg font-black">Ajouter un pronostic</button>}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeTab === 'history' && (
          <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-500/30">
            <h2 className="text-3xl font-black text-yellow-300 mb-6 flex items-center gap-3"><Award size={32} />Historique des Pronostics</h2>
            {predictions.filter(p => p.result && p.result !== 'pending').length === 0 ? (
              <p className="text-yellow-200/60 text-center py-12">Aucun pronostic terminé pour le moment</p>
            ) : (
              <div className="space-y-4">
                {predictions.filter(p => p.result && p.result !== 'pending').sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).map(prediction => {
                  const match = matches.find(m => m.id === prediction.match_id);
                  return (
                    <div key={prediction.id} className={`rounded-xl p-5 border-2 ${prediction.result === 'win' ? 'bg-green-900/20 border-green-500/50' : 'bg-red-900/20 border-red-500/50'}`}>
                      {match && (
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-black text-white">{match.team1} vs {match.team2}</div>
                            <div className="text-yellow-200 text-sm">{prediction.username} — {prediction.prediction} ({prediction.odds})</div>
                          </div>
                          <div className="text-white font-black">{prediction.result === 'win' ? 'GAGNÉ' : 'PERDU'}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="bg-gradient-to-br from-black/40 to-black/20 backdrop-blur-md rounded-2xl p-6 border-2 border-yellow-500/30">
            <h2 className="text-3xl font-black text-yellow-300 mb-6 flex items-center gap-3"><BarChart3 size={32} />Statistiques de Performance</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 rounded-xl p-6 border-2 border-blue-500/30">
                <div className="text-blue-300 text-sm font-bold mb-2">Total Pronostics</div>
                <div className="text-white text-4xl font-black">{stats.total}</div>
              </div>
              <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 rounded-xl p-6 border-2 border-green-500/30">
                <div className="text-green-300 text-sm font-bold mb-2 flex items-center gap-2"><CheckCircle size={16} />Gagnés</div>
                <div className="text-white text-4xl font-black">{stats.won}</div>
              </div>
              <div className="bg-gradient-to-br from-red-600/20 to-red-800/20 rounded-xl p-6 border-2 border-red-500/30">
                <div className="text-red-300 text-sm font-bold mb-2 flex items-center gap-2"><XCircle size={16} />Perdus</div>
                <div className="text-white text-4xl font-black">{stats.lost}</div>
              </div>
              <div className="bg-gradient-to-br from-yellow-600/20 to-amber-800/20 rounded-xl p-6 border-2 border-yellow-500/30">
                <div className="text-yellow-300 text-sm font-bold mb-2 flex items-center gap-2"><TrendingUp size={16} />Taux de Réussite</div>
                <div className="text-white text-4xl font-black">{stats.winRate}%</div>
              </div>
            </div>
            <div className="bg-black/30 rounded-xl p-6 border border-yellow-500/20">
              <h3 className="text-yellow-200 font-bold mb-4">Performance Globale</h3>
              <div className="relative h-8 bg-gray-800 rounded-full overflow-hidden">
                <div className="absolute h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-1000" style={{ width: `${stats.winRate}%` }} />
                <div className="absolute inset-0 flex items-center justify-center text-white font-black text-sm">{stats.winRate}% de réussite</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vip' && isVip && (
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/40 backdrop-blur-md rounded-2xl p-8 border-2 border-purple-500/50 shadow-2xl">
            <div className="text-center mb-8">
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-amber-500 rounded-full p-4 mb-4">
                <Crown size={48} className="text-purple-900" />
              </div>
              <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-pink-300 mb-2">ESPACE VIP</h2>
              <p className="text-purple-200">Accès exclusif aux pronostics premium</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-black/30 rounded-xl p-6 border-2 border-purple-500/30">
                <h3 className="text-purple-300 font-black text-xl mb-4 flex items-center gap-2"><Star size={24} />Avantages VIP</h3>
                <ul className="space-y-3 text-purple-100">
                </ul>
              </div>
              <div className="bg-black/30 rounded-xl p-6 border-2 border-purple-500/30">
                <h3 className="text-purple-300 font-black text-xl mb-4 flex items-center gap-2"><DollarSign size={24} />Vos Stats VIP</h3>
                <div className="space-y-4">
                </div>
              </div>
            </div>
            <div className="mt-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border-2 border-purple-500/30">
              <p className="text-center text-purple-200 font-bold">🎉 Merci d'être membre VIP ! Profitez de vos avantages exclusifs pour maximiser vos gains.</p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-black/40 backdrop-blur-md border-t-2 border-yellow-500/30 mt-12 py-6">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-yellow-200 font-bold mb-2">📢 Besoin d'un code promo ? Contactez-nous !</p>
          <button onClick={() => setShowPromoModal(true)} className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black px-6 py-3 rounded-lg font-black transition shadow-xl">
            Obtenir le code promo "Le226"
          </button>
        </div>
      </footer>

      {/* MODALS */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-amber-800 to-yellow-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-yellow-500/50">
            <h2 className="text-3xl font-black text-yellow-300 mb-6">{authMode === 'login' ? '🔐 Connexion' : '✨ Inscription'}</h2>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div><label className="block text-yellow-200 mb-2 font-bold">Nom d'utilisateur</label>
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} 
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
                </div>
              )}
              <div><label className="block text-yellow-200 mb-2 font-bold">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
              </div>
              <div><label className="block text-yellow-200 mb-2 font-bold">Mot de passe</label>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
              </div>
              <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black py-3 rounded-lg font-black text-lg transition shadow-xl">
                {authMode === 'login' ? 'Se connecter' : "S'inscrire"}
              </button>
            </form>
            <div className="mt-6 text-center">
              <button onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} className="text-yellow-200 hover:text-yellow-100 transition underline font-bold">
                {authMode === 'login' ? "Pas de compte ? S'inscrire" : 'Déjà un compte ? Se connecter'}
              </button>
            </div>
            <button onClick={() => { setShowAuthModal(false); setEmail(''); setPassword(''); setUsername(''); }}
              className="mt-4 w-full bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg font-bold transition">Annuler</button>
          </div>
        </div>
      )}

      {showAddMatch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-amber-800 to-yellow-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-4 border-yellow-500/50 my-8">
            <h2 className="text-3xl font-black text-yellow-300 mb-6">⚽ Ajouter un match</h2>
            <form onSubmit={handleAddMatch} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-yellow-200 mb-2 font-bold">Équipe 1</label>
                  <input type="text" value={newMatch.team1} onChange={(e) => setNewMatch({...newMatch, team1: e.target.value})} placeholder="Nom de l'équipe 1"
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
                </div>
                <div><label className="block text-yellow-200 mb-2 font-bold">Logo Équipe 1 (URL)</label>
                  <input type="url" value={newMatch.team1_logo} onChange={(e) => setNewMatch({...newMatch, team1_logo: e.target.value})} placeholder="https://exemple.com/logo1.png"
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-yellow-200 mb-2 font-bold">Équipe 2</label>
                  <input type="text" value={newMatch.team2} onChange={(e) => setNewMatch({...newMatch, team2: e.target.value})} placeholder="Nom de l'équipe 2"
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
                </div>
                <div><label className="block text-yellow-200 mb-2 font-bold">Logo Équipe 2 (URL)</label>
                  <input type="url" value={newMatch.team2_logo} onChange={(e) => setNewMatch({...newMatch, team2_logo: e.target.value})} placeholder="https://exemple.com/logo2.png"
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white placeholder-yellow-200/50 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div><label className="block text-yellow-200 mb-2 font-bold">Date</label>
                  <input type="date" value={newMatch.date} onChange={(e) => setNewMatch({...newMatch, date: e.target.value})}
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
                </div>
                <div><label className="block text-yellow-200 mb-2 font-bold">Heure</label>
                  <input type="time" value={newMatch.time} onChange={(e) => setNewMatch({...newMatch, time: e.target.value})}
                    className="w-full bg-black/30 border-2 border-yellow-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500" required />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black py-3 rounded-lg font-black text-lg transition shadow-xl">Ajouter</button>
                <button type="button" onClick={() => { setShowAddMatch(false); setNewMatch({ team1: '', team2: '', team1_logo: '', team2_logo: '', date: '', time: '' }); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold transition">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddPrediction && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-green-800 to-emerald-900 rounded-2xl p-8 max-w-2xl w-full shadow-2xl border-4 border-green-500/50 my-8">
            <h2 className="text-3xl font-black text-green-300 mb-6">🎯 Ajouter un Pronostic</h2>
            <form onSubmit={(e) => handleAddPrediction(e, showAddPrediction!)} className="space-y-4">
              <div><label className="block text-green-200 mb-2 font-bold">Pronostic</label>
                <input type="text" value={newPrediction.prediction} onChange={(e) => setNewPrediction({...newPrediction, prediction: e.target.value})} placeholder="Ex: Victoire de l'équipe 1"
                  className="w-full bg-black/30 border-2 border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-green-200/50 focus:outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div><label className="block text-green-200 mb-2 font-bold">Cote</label>
                <input type="text" value={newPrediction.odds} onChange={(e) => setNewPrediction({...newPrediction, odds: e.target.value})} placeholder="Ex: 2.50"
                  className="w-full bg-black/30 border-2 border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-green-200/50 focus:outline-none focus:ring-2 focus:ring-green-500" required />
              </div>
              <div><label className="block text-green-200 mb-2 font-bold">Analyse</label>
                <textarea value={newPrediction.description} onChange={(e) => setNewPrediction({...newPrediction, description: e.target.value})} placeholder="Analyse détaillée..."
                  className="w-full bg-black/30 border-2 border-green-500/30 rounded-lg px-4 py-3 text-white placeholder-green-200/50 focus:outline-none focus:ring-2 focus:ring-green-500 h-32 resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white py-3 rounded-lg font-black text-lg transition shadow-xl">Publier</button>
                <button type="button" onClick={() => { setShowAddPrediction(null); setNewPrediction({ prediction: '', odds: '', description: '' }); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold transition">Annuler</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-blue-500/50">
            <h2 className="text-3xl font-black text-blue-300 mb-6">📊 Mettre à jour le résultat</h2>
            <div className="space-y-4">
              <div><label className="block text-blue-200 mb-3 font-bold">Résultat du pronostic</label>
                <div className="grid grid-cols-2 gap-3">
                  <button onClick={() => setResultData({...resultData, result: 'win'})}
                    className={`py-4 rounded-lg font-black transition ${resultData.result === 'win' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}>
                    <CheckCircle size={24} className="mx-auto mb-2" />GAGNÉ
                  </button>
                  <button onClick={() => setResultData({...resultData, result: 'loss'})}
                    className={`py-4 rounded-lg font-black transition ${resultData.result === 'loss' ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white' : 'bg-white/10 text-blue-200 hover:bg-white/20'}`}>
                    <XCircle size={24} className="mx-auto mb-2" />PERDU
                  </button>
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => handleUpdateResult(showResultModal!)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3 rounded-lg font-black transition shadow-xl">Valider</button>
                <button onClick={() => { setShowResultModal(null); setResultData({ result: 'win', final_odds: '' }); }}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold transition">Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showPromoModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-green-800 to-emerald-900 rounded-2xl p-8 max-w-md w-full shadow-2xl border-4 border-green-500/50">
            <div className="text-center">
              <div className="bg-yellow-400 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <Trophy className="text-green-900" size={40} />
              </div>
              <h2 className="text-3xl font-black text-green-300 mb-4">🎉 Code Promo Exclusif</h2>
              <div className="bg-black/30 border-4 border-yellow-500 rounded-xl p-6 mb-6">
                <p className="text-yellow-200 text-sm font-bold mb-2">Utilisez ce code pour bénéficier d'offres exclusives :</p>
                <div className="bg-gradient-to-r from-yellow-500 to-amber-500 text-black text-3xl font-black py-4 px-6 rounded-lg mb-4 tracking-wider shadow-xl">Le226</div>
                <p className="text-green-200 text-xs">Code valable sur nos partenaires bookmakers</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4 mb-6 border-2 border-green-500/30">
                <p className="text-green-200 font-bold mb-3">📧 Besoin d'aide ou d'informations ?</p>
                <a href="mailto:contact@berich-prono.com?subject=Demande Code Promo Le226"
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-black transition shadow-xl">
                  <Mail size={20} />Contactez-nous
                </a>
              </div>
              <p className="text-green-300 text-sm mb-4">💰 Rejoignez notre communauté de gagnants et profitez des meilleurs pronostics !</p>
            </div>
            <button onClick={() => setShowPromoModal(false)} className="w-full bg-white/10 hover:bg-white/20 text-white py-3 rounded-lg font-bold transition">Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}