'use client';

import dynamic from 'next/dynamic';
import OmniBar from '@/components/ui/OmniBar';
import FloatingCapsule from '@/components/ui/FloatingCapsule';
import { useCosmosStore } from '@/stores/cosmosStore';
import { useUIStore } from '@/stores/uiStore';
import { useEffect, useState } from 'react';
import DashboardView from '@/components/dashboard/DashboardView';
import ProjectPage from '@/components/project/ProjectPage';
import UserProfile from '@/components/ui/UserProfile';
import { 
  IconFolder, IconLightbulb, IconLayoutGrid, IconList, IconNetwork, IconSparkles, IconArrowLeft 
} from '@/components/ui/icons';

// Dynamic import for R3F (must avoid SSR)
const CosmosCanvas = dynamic(
  () => import('@/components/cosmos/CosmosCanvas'),
  { ssr: false }
);

export default function CosmosPage() {
  const fetchData = useCosmosStore((s) => s.fetchData);
  const focusedSystemId = useUIStore((s) => s.focusedSystemId);
  const toggleFocusedSystem = useUIStore((s) => s.toggleFocusedSystem);
  const deselectNode = useUIStore((s) => s.deselectNode);
  const getNodeById = useCosmosStore((s) => s.getNodeById);
  const nodes = useCosmosStore((s) => s.nodes);

  const focusedNode = focusedSystemId ? getNodeById(focusedSystemId) : undefined;
  
  const [activeFilter, setActiveFilter] = useState('All');
  const activeView = useUIStore((s) => s.activeView);
  const setActiveView = useUIStore((s) => s.setActiveView);
  const activeProjectId = useUIStore((s) => s.activeProjectId);

  // Load backend data on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleBack = () => {
    deselectNode();
    if (focusedSystemId) toggleFocusedSystem(focusedSystemId);
  };

  return (
    <>
      {activeProjectId ? (
        <ProjectPage projectId={activeProjectId} />
      ) : (
        <>
          {activeView === 'Mindmap' && <CosmosCanvas />}
          {activeView === 'Dashboard' && <DashboardView />}
        </>
      )}
      <OmniBar />
      {!activeProjectId && <FloatingCapsule />}

      {/* Top Navigation Bar */}
      <div
        style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          height: '64px',
          zIndex: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          background: '#FFFFFF',
          borderBottom: '1px solid #E5E7EB',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
          <span style={{ fontSize: '24px', pointerEvents: 'none', color: '#7C3AED', display: 'flex', alignItems: 'center' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
          </span>
          <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '18px', fontWeight: 700, color: '#0F172A', pointerEvents: 'none' }}>Ideatask</span>
          <span style={{ padding: '2px 8px', fontSize: '10px', fontWeight: 600, color: '#7C3AED', background: '#EDE9FE', borderRadius: '4px', pointerEvents: 'none' }}>ALPHA</span>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
          <button 
            onClick={() => useUIStore.getState().toggleOmniBar()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '400px',
              height: '40px',
              padding: '0 16px',
              background: '#F8FAFC',
              border: '1px solid #E5E7EB',
              borderRadius: '20px',
              color: '#94A3B8',
              fontFamily: "'Inter', sans-serif",
              fontSize: '14px',
              cursor: 'text',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <IconSparkles width={16} height={16} />
              <span>Capture a thought...</span>
            </div>
            <span style={{ fontSize: '12px', background: '#FFFFFF', padding: '2px 6px', borderRadius: '4px', border: '1px solid #E5E7EB' }}>⌘K</span>
          </button>
        </div>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'flex-end' }}>
          <UserProfile />
        </div>
      </div>

      {/* Filter Chips & View Controls Row — hide when in project page */}
      {!activeProjectId && <div style={{
        position: 'fixed',
        top: '84px',
        left: '24px',
        right: '24px',
        zIndex: 39,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        userSelect: 'none',
        pointerEvents: 'none', // Allow clicking through empty space
      }}>
        {/* Filter Chips */}
        <div style={{ display: 'flex', gap: '8px', pointerEvents: 'auto' }}>
          {[
            { id: 'All', icon: null, count: null },
            { id: 'Projects', icon: <IconFolder width={16} height={16} />, count: nodes.filter(n => n.type === 'project').length },
            { id: 'Ideas', icon: <IconLightbulb width={16} height={16} />, count: nodes.filter(n => n.type === 'idea').length },
          ].map(filter => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                height: '40px',
                padding: '0 14px',
                borderRadius: '12px',
                fontFamily: "'Inter', sans-serif",
                fontSize: '13px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s',
                ...(activeFilter === filter.id ? {
                  background: '#EDE9FE',
                  color: '#6D28D9',
                  border: '1px solid #C4B5FD',
                  boxShadow: '0 2px 8px rgba(124, 58, 237, 0.1)',
                } : {
                  background: '#FFFFFF',
                  color: '#475569',
                  border: '1px solid #E5E7EB',
                })
              }}
              onMouseEnter={(e) => {
                if (activeFilter !== filter.id) {
                  e.currentTarget.style.background = '#F8FAFC';
                }
              }}
              onMouseLeave={(e) => {
                if (activeFilter !== filter.id) {
                  e.currentTarget.style.background = '#FFFFFF';
                }
              }}
            >
              {filter.icon && <span style={{ opacity: activeFilter === filter.id ? 1 : 0.7 }}>{filter.icon}</span>}
              {filter.id}
              {filter.count !== null && (
                <span style={{ 
                  marginLeft: '4px', 
                  fontSize: '12px', 
                  color: activeFilter === filter.id ? '#7C3AED' : '#94A3B8' 
                }}>
                  {filter.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* View Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', pointerEvents: 'auto' }}>
          <div style={{
            display: 'flex',
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: '12px',
            padding: '2px',
          }}>
            {[
              { id: 'Dashboard', icon: <IconLayoutGrid width={16} height={16} /> },
              { id: 'List', icon: <IconList width={16} height={16} /> },
              { id: 'Mindmap', icon: <IconNetwork width={16} height={16} /> },
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: activeView === view.id ? '#F8FAFC' : 'transparent',
                  color: activeView === view.id ? '#6D28D9' : '#64748B',
                  fontFamily: "'Inter', sans-serif",
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {view.icon} {view.id}
              </button>
            ))}
          </div>
        </div>
      </div>}

      {/* Bottom-left: contextual hints */}
      {!activeProjectId && activeView === 'Mindmap' && (
        <div
          style={{
            position: 'fixed',
            bottom: '28px',
            left: '24px',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            pointerEvents: 'none',
            userSelect: 'none',
            background: '#FFFFFF',
            padding: '12px',
            borderRadius: '12px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
          }}
        >
          {(focusedNode
            ? [
                ['Click', 'Select node'],
                ['Dbl-Click', 'Edit / Add'],
                ['Esc', 'Back to map'],
              ]
            : [
                ['Click', 'Select project'],
                ['Scroll', 'Zoom in/out'],
                ['Drag', 'Pan canvas'],
              ]
          ).map(([key, action]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '12px',
                color: '#6B7280',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              <span style={{ width: '60px', color: '#94A3B8' }}>{key}</span>
              <span style={{ color: '#334155' }}>{action}</span>
            </div>
          ))}
        </div>
      )}


    </>
  );
}
