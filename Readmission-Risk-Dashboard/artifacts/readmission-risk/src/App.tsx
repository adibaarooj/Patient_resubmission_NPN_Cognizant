import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, useLocation, Router as WouterRouter } from 'wouter';
import { encounters as initialEncounters } from './data';
import type { Encounter } from './data';
import { Shell } from './components/Shell';
import { Overview } from './pages/Overview';
import { Patients } from './pages/Patients';
import { Models } from './pages/Models';
import { NewPatient } from './pages/NewPatient';

const queryClient = new QueryClient();
const ENCOUNTERS_KEY='tandem-demo-encounters-v1';
const SELECTED_KEY='tandem-demo-selected-v1';

function loadEncounters():Encounter[] {
  try {
    const stored=localStorage.getItem(ENCOUNTERS_KEY);
    if(stored){
      const parsed:unknown=JSON.parse(stored);
      if(Array.isArray(parsed)&&parsed.length>0&&parsed.every(item=>item&&typeof item.encounterId==='string'&&typeof item.patientId==='string'))return parsed as Encounter[];
    }
  } catch { /* Use the in-memory synthetic seed if browser storage is unavailable. */ }
  return initialEncounters;
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function AppRoutes() {
  const [,setLocation]=useLocation();
  const [encounters, setEncounters] = useState<Encounter[]>(loadEncounters);
  const [selectedId, setSelectedId] = useState(()=> {
    try { return localStorage.getItem(SELECTED_KEY)??initialEncounters[0].encounterId; } catch { return initialEncounters[0].encounterId; }
  });
  const [pendingRevealId,setPendingRevealId]=useState<string|null>(null);
  const selected = useMemo(() => encounters.find(item => item.encounterId === selectedId) ?? encounters[0], [encounters, selectedId]);
  useEffect(()=>{try{localStorage.setItem(ENCOUNTERS_KEY,JSON.stringify(encounters));}catch{/* The synthetic prototype remains usable when storage is blocked. */}},[encounters]);
  useEffect(()=>{try{localStorage.setItem(SELECTED_KEY,selectedId);}catch{/* Selection persistence is best effort. */}},[selectedId]);
  const toggleReviewed = (id: string) => setEncounters(current => current.map(item => item.encounterId === id ? { ...item, reviewed: !item.reviewed } : item));
  const addEncounter=(encounter:Encounter)=>{
    setEncounters(current=>[encounter,...current]);
    setSelectedId(encounter.encounterId);
    setPendingRevealId(encounter.encounterId);
    setLocation('/patients');
  };
  return (
    <Shell>
      <RoutedErrorBoundary>
        <Switch>
          <Route path="/">
            <Overview encounters={encounters} selected={selected} onSelect={setSelectedId} onToggleReviewed={toggleReviewed} />
          </Route>
          <Route path="/patients/new"><NewPatient encounters={encounters} onSave={addEncounter}/></Route>
          <Route path="/patients">
            <Patients encounters={encounters} selected={selected} onSelect={setSelectedId} onToggleReviewed={toggleReviewed} autoRevealEncounterId={pendingRevealId} onDetailRevealed={()=>setPendingRevealId(null)} />
          </Route>
          <Route path="/models"><Models /></Route>
          <Route component={NotFound} />
        </Switch>
      </RoutedErrorBoundary>
    </Shell>
  );
}

function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}><AppRoutes /></WouterRouter><Toaster /></TooltipProvider></QueryClientProvider>;
}

export default App;
