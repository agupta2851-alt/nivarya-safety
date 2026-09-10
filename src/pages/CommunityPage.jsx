import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { communityCategories } from '../data/initialData';
import { 
  HeartHandshake, 
  ThumbsUp, 
  Flag, 
  MapPin, 
  Clock, 
  Calendar, 
  ShieldCheck, 
  AlertTriangle, 
  Filter, 
  Check, 
  EyeOff,
  Plus,
  MessageSquare,
  Send,
  HelpCircle,
  Sparkles
} from 'lucide-react';

export default function CommunityPage() {
  const { incidents, upvoteIncident, flagIncident, setCurrentPage, showToast, t } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterSeverity, setFilterSeverity] = useState('All');
  const [expandedComments, setExpandedComments] = useState({});
  const [newCommentText, setNewCommentText] = useState({});

  const categories = ['All', ...communityCategories];

  const filteredIncidents = incidents.filter(item => {
    const matchesCat = selectedCategory === 'All' || item.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSev = filterSeverity === 'All' || item.severity === filterSeverity;
    return matchesCat && matchesSev;
  });

  const toggleComments = (id) => {
    setExpandedComments(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddComment = (e, incidentId) => {
    e.preventDefault();
    const text = newCommentText[incidentId];
    if (!text || !text.trim()) return;
    showToast('Your anonymous advice has been added to the safety thread!', 'safe');
    setNewCommentText(prev => ({ ...prev, [incidentId]: '' }));
  };

  return (
    <div className="community-page container animate-fade-in" style={{ paddingTop: '24px', paddingBottom: '60px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div>
          <span className="section-tag">
            <HeartHandshake size={14} />
            <span>Community Radar & Crowdsourced Vigilance</span>
          </span>
          <h1 className="section-title" style={{ marginBottom: '6px' }}>
            {t.community.title}
          </h1>
          <p className="section-desc">
            Verified local alerts, safe spot recommendations, and crowdsourced hazard reporting submitted by students and working women.
          </p>
        </div>

        <button 
          className="btn btn-primary btn-lg"
          onClick={() => { setCurrentPage('report'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
        >
          <Plus size={16} />
          <span>Report New Hazard</span>
        </button>
      </div>

      {/* Community Guidelines & Privacy Card */}
      <div style={{
        background: 'rgba(16, 185, 129, 0.08)',
        border: '1px solid rgba(16, 185, 129, 0.25)',
        borderRadius: '16px',
        padding: '16px 20px',
        marginBottom: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
        fontSize: '0.85rem',
        color: '#CBD5E1'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldCheck size={22} color="#10B981" style={{ flexShrink: 0 }} />
          <span>
            <strong>Verified Community Guidelines: </strong> 
            All submissions are strictly moderated and anonymized to protect reporter identities. Posts with actionable details are escalated to city patrol teams.
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span className="badge badge-safe">Zero-Harassment Policy</span>
          <span className="badge badge-primary">Peer-Verified</span>
        </div>
      </div>

      {/* Filter Chips Bar (6 Standard Categories) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
        {categories.map(cat => (
          <button
            key={cat}
            className={`btn btn-sm ${selectedCategory === cat ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setSelectedCategory(cat)}
            style={{ fontSize: '0.8rem', padding: '6px 14px' }}
          >
            <span>{cat}</span>
          </button>
        ))}
      </div>

      {/* Incidents Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {filteredIncidents.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '48px 20px', color: '#94A3B8' }}>
            <p>No safety reports match this category filter.</p>
          </div>
        ) : (
          filteredIncidents.map(item => {
            const showComments = expandedComments[item.id];

            return (
              <div key={item.id} className="glass-card" style={{ padding: '24px', borderRadius: '18px', opacity: item.flagged ? 0.6 : 1 }}>
                <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span className={`badge ${item.severity === 'High' ? 'badge-danger' : item.severity === 'Medium' ? 'badge-warning' : 'badge-safe'}`}>
                      {item.category} • {item.severity} Risk
                    </span>

                    <span style={{ fontSize: '0.8rem', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <EyeOff size={13} color="#10B981" />
                      <span>{item.authorBadge || 'Verified Student'}</span>
                    </span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={13} />
                      <span>{item.date}</span>
                    </span>
                    <span>•</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={13} />
                      <span>{item.time}</span>
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#818CF8', fontSize: '0.95rem', fontWeight: 600, marginBottom: '10px' }}>
                  <MapPin size={16} />
                  <span>{item.location}</span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '0.92rem', color: '#E2E8F0', lineHeight: '1.6', marginBottom: '18px' }}>
                  {item.description}
                </p>

                {/* Footer: Upvote Helpful, Flag, Comments Toggle */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: '#10B981' }}>
                    <ShieldCheck size={16} />
                    <span>{item.status || 'Community Verified'}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button 
                      className="btn btn-secondary btn-sm"
                      onClick={() => upvoteIncident(item.id)}
                      style={{ gap: '6px' }}
                    >
                      <ThumbsUp size={14} color="#10B981" />
                      <span>Helpful ({item.upvotes})</span>
                    </button>

                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => toggleComments(item.id)}
                    >
                      <MessageSquare size={14} />
                      <span>Advice & Comments</span>
                    </button>

                    <button 
                      className="btn btn-ghost btn-sm"
                      onClick={() => flagIncident(item.id)}
                      style={{ color: item.flagged ? '#EF4444' : '#64748B', fontSize: '0.78rem' }}
                    >
                      <Flag size={13} />
                      <span>{item.flagged ? 'Flagged' : 'Flag'}</span>
                    </button>
                  </div>
                </div>

                {/* Interactive Comment Thread Section */}
                {showComments && (
                  <div className="animate-fade-in" style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px dashed var(--border-subtle)' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#A5B4FC', marginBottom: '10px' }}>
                      Community Advice & Peer Notes:
                    </div>

                    <div style={{ background: 'rgba(7, 11, 20, 0.5)', padding: '12px', borderRadius: '10px', marginBottom: '10px', fontSize: '0.82rem', color: '#CBD5E1' }}>
                      <strong style={{ color: 'var(--safe-light)' }}>Resident • Sector 4: </strong>
                      "I walk this stretch every day after 8:30 PM. I recommend taking the footpath opposite the pharmacy instead, as it has continuous shop lights."
                    </div>

                    <form onSubmit={(e) => handleAddComment(e, item.id)} style={{ display: 'flex', gap: '8px' }}>
                      <input 
                        type="text"
                        className="input-field"
                        placeholder="Add anonymous safety advice or detour tip..."
                        value={newCommentText[item.id] || ''}
                        onChange={(e) => setNewCommentText({ ...newCommentText, [item.id]: e.target.value })}
                        style={{ fontSize: '0.82rem' }}
                      />
                      <button type="submit" className="btn btn-primary btn-sm">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
