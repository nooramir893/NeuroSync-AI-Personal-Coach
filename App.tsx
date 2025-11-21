import { useState } from 'react';
import { LandingScreen } from './components/LandingScreen';
import { WelcomeLandingScreen } from './components/WelcomeLandingScreen';
import { RecordingScreen } from './components/RecordingScreen';
import { ProcessingScreen } from './components/ProcessingScreen';
import { ResultsScreen } from './components/ResultsScreen';
import { HistoryScreen } from './components/HistoryScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { BottomNav } from './components/BottomNav';

type Screen = 'welcome' | 'login' | 'signup' | 'home' | 'recording' | 'processing' | 'results' | 'history' | 'settings';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [darkMode, setDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userName, setUserName] = useState('');

  const navigateToScreen = (screen: Screen) => {
    setCurrentScreen(screen);
  };

  const startRecording = () => {
    setCurrentScreen('recording');
  };

  const handleLogin = (email: string, password: string) => {
    // Frontend-only login (for demo purposes)
    setIsAuthenticated(true);
    setUserName(email.split('@')[0]);
    setCurrentScreen('home');
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Frontend-only signup (for demo purposes)
    setIsAuthenticated(true);
    setUserName(name);
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserName('');
    setCurrentScreen('login');
  };

  const renderScreen = () => {
    // Show welcome screen first
    if (currentScreen === 'welcome') {
      return <WelcomeLandingScreen onGetStarted={() => setCurrentScreen('login')} />;
    }

    // Show auth screens if not authenticated
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'login':
          return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setCurrentScreen('signup')} onBack={() => setCurrentScreen('welcome')} darkMode={darkMode} />;
        case 'signup':
          return <SignupScreen onSignup={handleSignup} onSwitchToLogin={() => setCurrentScreen('login')} onBack={() => setCurrentScreen('welcome')} darkMode={darkMode} />;
        default:
          return <LoginScreen onLogin={handleLogin} onSwitchToSignup={() => setCurrentScreen('signup')} onBack={() => setCurrentScreen('welcome')} darkMode={darkMode} />;
      }
    }

    // Show app screens if authenticated
    switch (currentScreen) {
      case 'home':
        return <LandingScreen onStartRecording={startRecording} userName={userName} onNavigateToSettings={() => setCurrentScreen('settings')} onLogout={handleLogout} />;
      case 'recording':
        return <RecordingScreen onComplete={() => setCurrentScreen('processing')} onCancel={() => setCurrentScreen('home')} />;
      case 'processing':
        return <ProcessingScreen onComplete={() => setCurrentScreen('results')} />;
      case 'results':
        return <ResultsScreen onRegenerate={() => setCurrentScreen('processing')} onBack={() => setCurrentScreen('home')} />;
      case 'history':
        return <HistoryScreen onRerunCheckIn={() => setCurrentScreen('recording')} />;
      case 'settings':
        return <SettingsScreen darkMode={darkMode} onToggleDarkMode={() => setDarkMode(!darkMode)} onLogout={handleLogout} userName={userName} />;
      default:
        return <LandingScreen onStartRecording={startRecording} />;
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-teal-50 via-blue-50 to-purple-50'} transition-colors duration-300`}>
      <div className="pb-20">
        {renderScreen()}
      </div>
      {isAuthenticated && <BottomNav currentScreen={currentScreen} onNavigate={navigateToScreen} darkMode={darkMode} />}
    </div>
  );
}